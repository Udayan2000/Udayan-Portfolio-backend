import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { chatSessionService } from '../services/chat-session.service';
import { aiAgentService, ChatMessageItem } from '../services/ai-agent.service';

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, message, visitorName, visitorEmail } = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    throw ApiError.badRequest('sessionId string is required');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw ApiError.badRequest('message cannot be empty');
  }

  const cleanMessage = message.trim();
  const session = chatSessionService.getOrCreateSession(sessionId, visitorName, visitorEmail);

  // 1. Auto-detect and extract email and phone numbers if mentioned in the message
  chatSessionService.extractContactInfo(sessionId, cleanMessage);

  // 2. Add the incoming user message to session history
  const userMsg = chatSessionService.addMessage(sessionId, 'user', cleanMessage);

  // 3. If human takeover is active, pause AI and notify Udayan
  if (session.isHumanActive) {
    chatSessionService.dispatchNotifications(session, cleanMessage, undefined);

    return res.status(200).json(
      ApiResponse.success(
        {
          sessionId,
          userMessage: userMsg,
          reply: "Udayan is currently active in this chat and is reviewing your message. He'll respond directly here in a moment!",
          isHumanActive: true,
          role: 'human',
        },
        'Message delivered to human operator'
      )
    );
  }

  // 4. Generate real, context-aware AI response tailored to the client's message
  const historyForAi: ChatMessageItem[] = session.messages.map((m) => ({
    role: m.role,
    text: m.text,
  }));

  const aiReplyText = await aiAgentService.generateReply(historyForAi);

  // 5. Add model message to history
  const modelMsg = chatSessionService.addMessage(sessionId, 'model', aiReplyText);

  // 6. Dispatch complete, high-priority notification (with client message, AI reply, and contact info)
  chatSessionService.dispatchNotifications(session, cleanMessage, aiReplyText);

  return res.status(200).json(
    ApiResponse.success(
      {
        sessionId,
        userMessage: userMsg,
        reply: aiReplyText,
        modelMessage: modelMsg,
        isHumanActive: false,
        role: 'model',
      },
      'AI response generated'
    )
  );
});

export const getSessionHistory = asyncHandler(async (req: Request, res: Response) => {
  const paramId = req.params.sessionId;
  const sessionId = typeof paramId === 'string' ? paramId : Array.isArray(paramId) ? paramId[0] : '';

  if (!sessionId) {
    throw ApiError.badRequest('sessionId parameter is required');
  }

  const session = chatSessionService.getSession(sessionId);

  return res.status(200).json(
    ApiResponse.success(
      {
        sessionId,
        messages: session ? session.messages : [],
        isHumanActive: session ? session.isHumanActive : false,
        visitorName: session?.visitorName,
        visitorEmail: session?.visitorEmail,
      },
      'Session history retrieved'
    )
  );
});

export const toggleTakeover = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, isHumanActive, replyMessage } = req.body;

  if (!sessionId) {
    throw ApiError.badRequest('sessionId is required');
  }

  chatSessionService.setHumanActive(sessionId, !!isHumanActive);

  let humanMsg = null;
  if (replyMessage && typeof replyMessage === 'string' && replyMessage.trim().length > 0) {
    humanMsg = chatSessionService.addMessage(sessionId, 'human', replyMessage.trim());
  }

  return res.status(200).json(
    ApiResponse.success(
      {
        sessionId,
        isHumanActive: !!isHumanActive,
        humanMessage: humanMsg,
      },
      `Human takeover set to ${!!isHumanActive}`
    )
  );
});

export const listSessions = asyncHandler(async (_req: Request, res: Response) => {
  const sessions = chatSessionService.getAllSessions();
  return res.status(200).json(
    ApiResponse.success(sessions, `Retrieved ${sessions.length} active chat sessions`, 200, {
      total: sessions.length,
    })
  );
});
