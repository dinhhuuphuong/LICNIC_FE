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
};

export type AskChatbotRagResponse = Response<ChatbotRagPayload>;

export async function askChatbotRag(question: string): Promise<AskChatbotRagResponse> {
  return http<AskChatbotRagResponse>(CHATBOT_RAG_ASK_URL, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
}
