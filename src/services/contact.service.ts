import { ContactInquiry, ContactSubmission } from '../types/portfolio';
import { emailService } from './email.service';
import { logger } from '../utils/logger';

class ContactService {
  // In-memory submissions store (can be seamlessly connected to MongoDB, PostgreSQL, or Supabase)
  private submissions: ContactSubmission[] = [];

  async createSubmission(inquiry: ContactInquiry, ipAddress?: string): Promise<ContactSubmission> {
    const submission: ContactSubmission = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...inquiry,
      createdAt: new Date().toISOString(),
      ipAddress,
      status: 'received',
    };

    this.submissions.push(submission);
    logger.success(`Contact submission recorded with ID: ${submission.id}`);

    // Send async email notification (non-blocking for client response speed)
    emailService.sendContactNotification(inquiry).catch((err) => {
      logger.error('Background email dispatch failed:', err);
    });

    return submission;
  }

  async getAllSubmissions(): Promise<ContactSubmission[]> {
    return [...this.submissions].reverse();
  }

  async getSubmissionById(id: string): Promise<ContactSubmission | null> {
    return this.submissions.find((sub) => sub.id === id) || null;
  }
}

export const contactService = new ContactService();
