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

class EmailService {
  private transporter: Transporter | null = null;

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
        logger.info('SMTP email transporter initialized successfully.');
      } catch (error) {
        logger.warn('Failed to initialize SMTP transporter. Falling back to console logging.', error);
        this.transporter = null;
      }
    } else {
      logger.info('SMTP credentials not configured. Inquiries will be logged to console.');
    }
  }

  /**
   * Dispatched dynamically whenever anyone messages on the website.
   * Minimal, clean, 100% dynamic content: "A client just reached out to you!"
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

    const subject = 'A client just reached out to you!';

    const nowFormatted = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

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

    if (!this.transporter) {
      logger.info('================ [CLIENT REACHED OUT] ================');
      logger.info(`Message: ${data.latestUserMessage}`);
      logger.info(`AI Reply: ${data.aiReply || 'N/A'}`);
      logger.info(`Email: ${data.clientEmail || 'N/A'} | Phone: ${data.clientPhone || 'N/A'}`);
      logger.info('======================================================');
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"Portfolio Alerts" <${env.SMTP_USER}>`,
        to: env.CONTACT_RECEIVER_EMAIL,
        replyTo: hasClientEmail ? data.clientEmail : env.SMTP_USER,
        subject,
        text: plainText,
        html: htmlContent,
      });
      logger.success(`Notification sent: "A client just reached out to you!" -> ${env.CONTACT_RECEIVER_EMAIL}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      return false;
    }
  }

  /**
   * Dispatched on Contact Form submissions.
   */
  async sendContactNotification(inquiry: ContactInquiry): Promise<boolean> {
    const subject = 'A client just reached out to you!';

    const nowFormatted = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const plainText = `A client just reached out to you!

Client: ${inquiry.name}
Email: ${inquiry.email}
${inquiry.budget ? `Budget: ${inquiry.budget}\n` : ''}${inquiry.timeline ? `Timeline: ${inquiry.timeline}\n` : ''}${inquiry.service ? `Service: ${inquiry.service}\n` : ''}
Message:
${inquiry.message}

Time: ${nowFormatted} IST`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; padding: 20px; color: #18181b;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #09090b; font-size: 20px; font-weight: 700; border-bottom: 2px solid #06b6d4; padding-bottom: 12px;">
            A client just reached out to you!
          </h2>
          <div style="font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
            <div><strong>Client:</strong> ${escapeHtml(inquiry.name)}</div>
            <div><strong>Email:</strong> <a href="mailto:${inquiry.email}" style="color: #06b6d4; font-weight: 600;">${inquiry.email}</a></div>
            ${inquiry.budget ? `<div><strong>Budget:</strong> ${escapeHtml(inquiry.budget)}</div>` : ''}
            ${inquiry.timeline ? `<div><strong>Timeline:</strong> ${escapeHtml(inquiry.timeline)}</div>` : ''}
            ${inquiry.service ? `<div><strong>Service:</strong> ${escapeHtml(inquiry.service)}</div>` : ''}
          </div>
          <div style="padding: 14px; background-color: #f4f4f5; border-radius: 6px; font-size: 15px; color: #18181b; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</div>
          <div style="margin-top: 16px; font-size: 13px; color: #71717a;">Time: ${nowFormatted} IST</div>
        </div>
      </body>
      </html>
    `;

    if (!this.transporter) {
      logger.info('================ [CONTACT INQUIRY] ================');
      logger.info(`From: ${inquiry.name} <${inquiry.email}>`);
      logger.info(`Message: ${inquiry.message}`);
      logger.info('====================================================');
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"Portfolio Alerts" <${env.SMTP_USER}>`,
        to: env.CONTACT_RECEIVER_EMAIL,
        replyTo: inquiry.email,
        subject,
        text: plainText,
        html: htmlContent,
      });
      logger.success(`Contact notification sent: "A client just reached out to you!" -> ${env.CONTACT_RECEIVER_EMAIL}`);
      return true;
    } catch (error) {
      logger.error('Failed to send contact notification:', error);
      return false;
    }
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
