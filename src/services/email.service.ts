import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ContactInquiry } from '../types/portfolio';

export interface ChatLeadEmailData {
  sessionId: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  latestUserMessage: string;
  aiReply?: string;
  isHumanActive?: boolean;
  messages: Array<{
    role: 'user' | 'model' | 'human';
    text: string;
    timestamp?: string;
  }>;
}

interface EmailJob {
  options: {
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  };
  retries: number;
}

class EmailService {
  private transporter: Transporter | null = null;
  private queue: EmailJob[] = [];
  private activeWorkers = 0;
  private readonly MAX_CONCURRENT = 2; // Process 2 emails at a time to prevent SMTP connection throttling

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          pool: true,
          maxConnections: 3,
          maxMessages: 50,
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
        });
        logger.info('SMTP email transporter initialized successfully with connection pool.');
      } catch (error) {
        logger.warn('Failed to initialize SMTP transporter:', error);
        this.transporter = null;
      }
    } else {
      logger.warn(
        '⚠️ SMTP credentials not found in environment variables. If you have not set up RESEND_API_KEY or SMTP_USER/SMTP_PASS, emails cannot be sent.'
      );
    }
  }

  /**
   * Enqueues an email job into the high-concurrency worker queue.
   * Returns immediately so API requests from chatbot or contact forms are never blocked.
   */
  private enqueueEmail(options: {
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): void {
    this.queue.push({ options, retries: 0 });
    this.processQueue();
  }

  /**
   * High-concurrency queue worker with auto-retry and rate pacing.
   * Handles 100+ simultaneous chat visitors smoothly without overloading Gmail SMTP or dropping messages.
   */
  private async processQueue(): Promise<void> {
    if (this.activeWorkers >= this.MAX_CONCURRENT || this.queue.length === 0) {
      return;
    }

    this.activeWorkers++;
    const job = this.queue.shift();

    if (!job) {
      this.activeWorkers--;
      return;
    }

    try {
      const delivered = await this.dispatchEmailDirect(job.options);

      if (!delivered && job.retries < 2) {
        job.retries++;
        logger.warn(`Email delivery failed. Re-queuing job for retry attempt ${job.retries}/2...`);
        setTimeout(() => {
          this.queue.push(job);
          this.processQueue();
        }, 2000 * job.retries);
      }
    } catch (err) {
      logger.error('Unhandled email queue worker exception:', err);
    } finally {
      this.activeWorkers--;
      // 250ms spacing between outbound email handshakes to stay within healthy rate limits
      setTimeout(() => this.processQueue(), 250);
    }
  }

  /**
   * Direct dispatcher: attempts Resend HTTPS API first, falls back to pooled SMTP.
   */
  private async dispatchEmailDirect(options: {
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<boolean> {
    // 1. Priority 1: Resend Transactional HTTPS API (never blocked by cloud firewalls or Google IP filters)
    if (env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Portfolio Alerts <onboarding@resend.dev>',
            to: [env.CONTACT_RECEIVER_EMAIL],
            reply_to: options.replyTo,
            subject: options.subject,
            text: options.text,
            html: options.html,
          }),
        });

        if (response.ok) {
          logger.success(`Email delivered successfully via Resend API to: ${env.CONTACT_RECEIVER_EMAIL}`);
          return true;
        }

        const errText = await response.text();
        logger.error('Resend API dispatch failed:', errText);
      } catch (resendErr) {
        logger.error('Failed to communicate with Resend HTTPS API:', resendErr);
      }
    }

    // 2. Priority 2: Direct SMTP (Gmail)
    if (this.transporter && env.SMTP_USER && env.SMTP_PASS) {
      try {
        await Promise.race([
          this.transporter.sendMail({
            from: `"Portfolio Alerts" <${env.SMTP_USER}>`,
            to: env.CONTACT_RECEIVER_EMAIL,
            replyTo: options.replyTo || env.SMTP_USER,
            subject: options.subject,
            text: options.text,
            html: options.html,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP send timed out after 10s')), 10000)
          ),
        ]);

        logger.success(`Email delivered successfully via SMTP to: ${env.CONTACT_RECEIVER_EMAIL}`);
        return true;
      } catch (smtpErr: any) {
        logger.error('SMTP email dispatch error:', smtpErr?.message || smtpErr);
        if (smtpErr?.code === 'EAUTH' || smtpErr?.responseCode === 535) {
          logger.error('⚠️ Gmail Authentication Failed: Check your 16-character Gmail App Password.');
        } else if (smtpErr?.code === 'ETIMEDOUT' || smtpErr?.code === 'ECONNREFUSED') {
          logger.error('⚠️ Cloud Firewall Blocking SMTP: Cloud hosts (Render/AWS/DO) frequently block ports 587 & 465. Use RESEND_API_KEY for guaranteed HTTPS delivery.');
        }
        return false;
      }
    }

    // If neither provider is configured:
    logger.warn('⚠️ [EMAIL NOT SENT] Neither RESEND_API_KEY nor valid SMTP credentials found in environment variables.');
    return false;
  }

  /**
   * Dispatched dynamically when ANY visitor messages in the chatbot.
   * Sends an email on EVERY message with an anti-thread dynamic timestamp subject.
   */
  async sendChatLeadAlert(data: ChatLeadEmailData): Promise<boolean> {
    const hasClientEmail = Boolean(
      data.clientEmail &&
      data.clientEmail !== 'Not provided yet' &&
      data.clientEmail.includes('@')
    );
    const hasClientPhone = Boolean(
      data.clientPhone &&
      data.clientPhone !== 'Not provided yet'
    );

    const nowFormatted = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const nowTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Dynamic subject with timestamp so Gmail NEVER collapses new messages into old threads
    const subject = `A client just reached out to you! [${nowTime} IST]`;

    const plainText = `A client just reached out to you!

Message:
${data.latestUserMessage}
${data.aiReply ? `\nAI Reply:\n${data.aiReply}\n` : ''}
${hasClientEmail ? `Email: ${data.clientEmail}\n` : ''}${hasClientPhone ? `Phone: ${data.clientPhone}\n` : ''}Time: ${nowFormatted} IST
Session: ${data.sessionId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 20px; color: #18181b;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 24px;">
          
          <h2 style="margin: 0 0 16px 0; color: #09090b; font-size: 20px; font-weight: 700; border-bottom: 2px solid #06b6d4; padding-bottom: 12px;">
            A client just reached out to you!
          </h2>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 6px;">
              Client Message:
            </div>
            <div style="padding: 14px 16px; background-color: #f4f4f5; border-radius: 6px; font-size: 15px; color: #18181b; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.latestUserMessage)}</div>
          </div>

          ${
            data.aiReply
              ? `
          <div style="margin-bottom: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: #0891b2; text-transform: uppercase; margin-bottom: 6px;">
              AI Reply:
            </div>
            <div style="padding: 14px 16px; background-color: #ecfeff; border-left: 3px solid #06b6d4; border-radius: 6px; font-size: 14px; color: #164e63; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.aiReply)}</div>
          </div>
          `
              : ''
          }

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f4f4f5; font-size: 13px; color: #52525b; line-height: 1.8;">
            ${
              hasClientEmail
                ? `<div><strong>Email:</strong> <a href="mailto:${data.clientEmail}" style="color: #06b6d4; font-weight: 600;">${data.clientEmail}</a></div>`
                : ''
            }
            ${
              hasClientPhone
                ? `<div><strong>Phone:</strong> <span style="color: #09090b; font-weight: 600;">${data.clientPhone}</span></div>`
                : ''
            }
            <div><strong>Time:</strong> ${nowFormatted} IST</div>
          </div>

        </div>
      </body>
      </html>
    `;

    this.enqueueEmail({
      subject,
      text: plainText,
      html: htmlContent,
      replyTo: hasClientEmail ? data.clientEmail : undefined,
    });

    return true;
  }

  /**
   * Dispatched on Contact Form submissions.
   */
  async sendContactNotification(inquiry: ContactInquiry): Promise<boolean> {
    const nowFormatted = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const nowTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const subject = `A client just reached out to you! [${nowTime} IST]`;

    const plainText = `A client just reached out to you!

Client: ${inquiry.name}
Email: ${inquiry.email}
${inquiry.phone ? `Phone / WhatsApp: ${inquiry.phone}\n` : ''}${inquiry.service ? `Service Needed: ${inquiry.service}\n` : ''}${inquiry.budget ? `Budget: ${inquiry.budget}\n` : ''}${inquiry.timeline ? `Timeline: ${inquiry.timeline}\n` : ''}
Message:
${inquiry.message}

Time: ${nowFormatted} IST`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; padding: 20px; color: #18181b;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #09090b; font-size: 20px; font-weight: 700; border-bottom: 2px solid #06b6d4; padding-bottom: 12px;">
            A client just reached out to you!
          </h2>
          <div style="font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
            <div><strong>Client:</strong> ${escapeHtml(inquiry.name)}</div>
            <div><strong>Email:</strong> <a href="mailto:${inquiry.email}" style="color: #06b6d4; font-weight: 600;">${inquiry.email}</a></div>
            ${inquiry.phone ? `<div><strong>Phone / WhatsApp:</strong> <span style="color: #09090b; font-weight: 600;">${escapeHtml(inquiry.phone)}</span></div>` : ''}
            ${inquiry.service ? `<div><strong>Service Needed:</strong> <span style="color: #09090b;">${escapeHtml(inquiry.service)}</span></div>` : ''}
            ${inquiry.budget ? `<div><strong>Budget:</strong> ${escapeHtml(inquiry.budget)}</div>` : ''}
            ${inquiry.timeline ? `<div><strong>Timeline:</strong> ${escapeHtml(inquiry.timeline)}</div>` : ''}
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 6px;">
              Project Message:
            </div>
            <div style="padding: 14px 16px; background-color: #f4f4f5; border-radius: 6px; font-size: 15px; color: #18181b; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</div>
          </div>
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f4f4f5; font-size: 13px; color: #71717a;">Time: ${nowFormatted} IST</div>
        </div>
      </body>
      </html>
    `;

    this.enqueueEmail({
      subject,
      text: plainText,
      html: htmlContent,
      replyTo: inquiry.email,
    });

    return true;
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const emailService = new EmailService();
