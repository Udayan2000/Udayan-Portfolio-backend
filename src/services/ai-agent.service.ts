import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ChatMessageItem {
  role: 'user' | 'model' | 'human';
  text: string;
}

const SYSTEM_INSTRUCTION = `
You are Udayan Ghosh's dedicated personal AI assistant on his developer portfolio.

CRITICAL RULES - ANSWER LENGTH & STYLE:
- ALWAYS keep answers SHORT, CRISP, AND DIRECT (strictly 1 to 3 short sentences, under 50 words).
- Answer ONLY the specific question asked by the user. Do not write essays, unsolicited marketing fluff, or long lists.
- Speak naturally and warmly like a senior full-stack developer chatting on Slack or WhatsApp.

CRITICAL RULE - GATHER CLIENT EMAIL ON FIRST / EARLY INTERACTION:
- When a client/visitor sends their first message or early inquiry, answer their question directly, and politely invite them to share their email address so Udayan can reach out to them directly with full details or a proposal (e.g., "Feel free to drop your email here so Udayan can reach out directly!").
- If the visitor has already provided their email or phone number in the chat history, do not ask again; warmly confirm Udayan will be in touch.

CRITICAL RULE - BUDGET & PRICING:
- NEVER state any numbers, prices, hourly rates, or dollar amounts.
- When anyone asks about budget, pricing, cost, rates, quotes, or how much something costs:
  Politely explain that pricing is customized based on their specific project scope and features, and invite them to share their email or reach out directly to Udayan Ghosh at +91 89459 38993 (WhatsApp/Call) or ghosh.udayan2000@gmail.com for a tailored quote.
  Dynamically adapt your response to the exact project, app, or feature they asked about!

KNOWLEDGE BASE:
- Developer: Udayan Ghosh (Senior Full-Stack Developer & Solutions Architect, 4+ years exp).
- Tech Stack: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Node.js, Express, PostgreSQL, Prisma, Redis, Stripe, WordPress (custom Gutenberg), Wix Studio, Shopify, Building AI Agents.
- Turnaround: 1 to 3 weeks for websites/e-commerce; 3 to 6 weeks for custom web applications and SaaS MVPs.
- Guarantees: 100% full GitHub repository ownership, zero vendor lock-in, 30 days post-launch bug warranty.
- Contact: ghosh.udayan2000@gmail.com, WhatsApp: +91 89459 38993.
`;

class AiAgentService {
  private models = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

  async generateReply(history: ChatMessageItem[]): Promise<string> {
    const formattedContents = history.map((msg) => ({
      role: msg.role === 'human' ? 'model' : msg.role,
      parts: [{ text: msg.text }],
    }));

    if (formattedContents.length === 0 || formattedContents[formattedContents.length - 1].role !== 'user') {
      return "Hi! I'm Udayan's AI assistant. Please share your email or phone number so Udayan can reach out to you directly, or ask me anything about his work!";
    }

    const latestUserText = history[history.length - 1]?.text || '';

    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: formattedContents.slice(-6),
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 200,
        topP: 0.9,
      },
    };

    // Try models in cascade order with a 25s timeout so network calls never abort prematurely
    for (const model of this.models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate && candidate.trim().length > 0) {
            return candidate.trim();
          }
        } else {
          const errText = await response.text();
          logger.warn(`Model [${model}] returned status ${response.status}. Trying next...`, errText);
        }
      } catch (err: any) {
        logger.warn(`Network issue with model [${model}]: ${err?.message || err}. Trying next...`);
      }
    }

    // Dynamic contextual short fallback if internet is completely severed
    return this.getContextualFallback(latestUserText);
  }

  private getContextualFallback(latestMessage: string): string {
    const lower = latestMessage.toLowerCase();

    if (lower.includes('@') || lower.match(/\+?\d{9,13}/)) {
      return "Thank you for sharing your contact details! Udayan has received your message and will reach out to you directly shortly.";
    }

    if (lower.includes('cost') || lower.includes('price') || lower.includes('pricing') || lower.includes('rate') || lower.includes('budget') || lower.includes('quote') || lower.includes('how much')) {
      return "Project pricing is customized based on your specific scope and features. Feel free to drop your email here or reach out directly to Udayan at +91 89459 38993 or ghosh.udayan2000@gmail.com for a tailored quote!";
    }

    if (lower.includes('timeline') || lower.includes('how long') || lower.includes('time') || lower.includes('when')) {
      return "Turnaround is usually 1 to 3 weeks for websites and 3 to 6 weeks for custom applications. Please drop your email so Udayan can connect with you regarding your timeline!";
    }

    return `Thanks for reaching out! Udayan specializes in high-performance web development with Next.js, TypeScript, and Node.js. Feel free to share your email so he can reach out to you directly!`;
  }
}

export const aiAgentService = new AiAgentService();
