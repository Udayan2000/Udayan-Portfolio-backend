import fs from 'fs';
import path from 'path';
import { emailService } from './email.service';
import { whatsappService } from './whatsapp.service';
import { logger } from '../utils/logger';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'human';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  messages: ChatMessage[];
  isHumanActive: boolean;
  createdAt: string;
  lastActivity: string;
  notificationCount: number;
}

class ChatSessionService {
  private sessions = new Map<string, ChatSession>();
  private backupFilePath = path.join(__dirname, '../../data/chats.json');

  constructor() {
    this.loadBackup();
  }

  private loadBackup(): void {
    try {
      if (fs.existsSync(this.backupFilePath)) {
        const raw = fs.readFileSync(this.backupFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          data.forEach((s: ChatSession) => {
            this.sessions.set(s.sessionId, s);
          });
          logger.info(`Loaded ${this.sessions.size} chat session(s) from local backup.`);
        }
      }
    } catch (err) {
      logger.warn('Could not load chat backup:', err);
    }
  }

  private saveBackup(): void {
    try {
      const dataDir = path.dirname(this.backupFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const allSessions = Array.from(this.sessions.values());
      fs.writeFileSync(this.backupFilePath, JSON.stringify(allSessions, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to save chat backup to disk:', err);
    }
  }

  getOrCreateSession(sessionId: string, visitorName?: string, visitorEmail?: string): ChatSession {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        visitorName,
        visitorEmail,
        messages: [],
        isHumanActive: false,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        notificationCount: 0,
      };
      this.sessions.set(sessionId, session);
    } else {
      if (visitorName && !session.visitorName) session.visitorName = visitorName;
      if (visitorEmail && !session.visitorEmail) session.visitorEmail = visitorEmail;
      session.lastActivity = new Date().toISOString();
    }

    return session;
  }

  /**
   * Intelligently scans incoming user messages to automatically capture email addresses
   * or phone numbers that the client volunteered in the conversation.
   */
  extractContactInfo(sessionId: string, text: string): void {
    const session = this.getOrCreateSession(sessionId);

    // Auto-detect email
    const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    if (emailMatch && (!session.visitorEmail || session.visitorEmail === 'Not provided yet')) {
      session.visitorEmail = emailMatch[0];
      logger.success(`Automatically captured client email from chat: ${session.visitorEmail}`);
    }

    // Auto-detect phone / WhatsApp number across international & local formats
    const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches && (!session.visitorPhone || session.visitorPhone === 'Not provided yet')) {
      const validPhone = phoneMatches.find((m) => {
        const digits = m.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      });
      if (validPhone) {
        session.visitorPhone = validPhone.trim();
        logger.success(`Automatically captured client phone from chat: ${session.visitorPhone}`);
      }
    }

    this.saveBackup();
  }

  addMessage(sessionId: string, role: 'user' | 'model' | 'human', text: string): ChatMessage {
    const session = this.getOrCreateSession(sessionId);
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role,
      text,
      timestamp: new Date().toISOString(),
    };

    session.messages.push(msg);

    // Keep sliding window of last 14 messages
    if (session.messages.length > 14) {
      session.messages = session.messages.slice(-14);
    }

    session.lastActivity = new Date().toISOString();
    this.saveBackup();

    return msg;
  }

  setHumanActive(sessionId: string, active: boolean): void {
    const session = this.getOrCreateSession(sessionId);
    session.isHumanActive = active;
    logger.info(`Session [${sessionId}] human takeover status changed to: ${active}`);
    this.saveBackup();
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  /**
   * Dispatches instant alerts (Email & WhatsApp) every time a client or visitor sends a message.
   * Includes the client's latest message, the AI's intelligent reply, and full conversation history.
   */
  dispatchNotifications(session: ChatSession, latestUserMessage: string, aiReply?: string): void {
    const clientName = session.visitorName || 'Prospective Client';
    const clientEmail = session.visitorEmail || 'Not provided yet';
    const clientPhone = session.visitorPhone || 'Not provided yet';

    // 1. WhatsApp notification (async, non-blocking)
    whatsappService.sendAlert(clientName, clientEmail, latestUserMessage).catch((err) => {
      logger.error('WhatsApp background alert error:', err);
    });

    // 2. Instant Email Notification for EVERY client message via resilient queue
    emailService
      .sendChatLeadAlert({
        sessionId: session.sessionId,
        clientName,
        clientEmail,
        clientPhone,
        latestUserMessage,
        aiReply,
        isHumanActive: session.isHumanActive,
        messages: session.messages,
      })
      .catch((err) => {
        logger.error('Email background dispatch error:', err);
      });

    session.notificationCount += 1;
  }
}

export const chatSessionService = new ChatSessionService();
