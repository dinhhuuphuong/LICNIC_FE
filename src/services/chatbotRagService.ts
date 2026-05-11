import { http, type Response } from '@/services/http';

const CHATBOT_RAG_ASK_URL = '/chatbot-rag/ask';

export type ChatbotRagPayload = {
  intent: string;
  answer: string;
  sources: unknown[];
  serviceSources: unknown[];
  webSources: unknown[];
  serviceCategoryId: number | null;
  serviceCategoryName: string | null;
  serviceId: number | null;
  serviceName: string | null;
  /** Server-issued id; gửi lại ở các tin nhắn tiếp theo trong cùng cuộc hội thoại. */
  session?: string | null;
};

export type AskChatbotRagResponse = Response<ChatbotRagPayload>;

export async function askChatbotRag(question: string, session?: string | null): Promise<AskChatbotRagResponse> {
  const body: { question: string; session?: string } = { question };
  if (session != null && session.trim() !== '') {
    body.session = session.trim();
  }

  return http<AskChatbotRagResponse>(CHATBOT_RAG_ASK_URL, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
