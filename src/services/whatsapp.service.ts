import { env } from '../config/env';
import { logger } from '../utils/logger';

class WhatsAppService {
  async sendAlert(clientName: string, clientEmail: string, message: string): Promise<boolean> {
    if (!env.WHATSAPP_PHONE || !env.WHATSAPP_CALLMEBOT_API_KEY) {
      logger.debug('WhatsApp CallMeBot credentials not configured. Skipping WhatsApp alert.');
      return false;
    }

    try {
      // Clean phone number (CallMeBot requires numbers without +, or standard format)
      const phone = env.WHATSAPP_PHONE.replace(/\+/g, '').replace(/\s+/g, '');
      const text = `🔔 *New Portfolio Chat!*\n👤 *From:* ${clientName || 'Visitor'} (${clientEmail || 'No email'})\n💬 *Message:* ${message}`;
      const encodedText = encodeURIComponent(text);

      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedText}&apikey=${env.WHATSAPP_CALLMEBOT_API_KEY}`;

      const response = await fetch(url);
      if (response.ok) {
        logger.success(`WhatsApp alert sent successfully to ${env.WHATSAPP_PHONE}`);
        return true;
      } else {
        const errText = await response.text();
        logger.warn('WhatsApp alert response not OK:', errText);
        return false;
      }
    } catch (error) {
      logger.error('Failed to dispatch WhatsApp alert:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
