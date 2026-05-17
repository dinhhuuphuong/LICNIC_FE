import { http, type PaginationResponse, type Response } from '@/services/http';

const CHATBOT_RAG_ASK_URL = '/chatbot-rag/ask';
const CHATBOT_RAG_CHATS_URL = '/chatbot-rag/chats';
const CHATBOT_RAG_ASK_STREAM_URL = '/chatbot-rag/ask/stream';

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

export type ChatbotRagStreamMeta = {
  session?: string;
  intent?: string;
  sources?: unknown[];
};

export type ChatbotRagStreamHandlers = {
  onMeta?: (payload: ChatbotRagStreamMeta) => void;
  onDelta?: (content: string) => void;
  onDone?: (payload: { intent?: string; sources?: unknown[] }) => void;
};

function resolveApiUrl(path: string): string {
  const endpoint = import.meta.env.VITE_ENDPOINT_API;
  if (path.startsWith('/')) return `${endpoint}${path}`;
  if (!path.startsWith('http')) return `${endpoint}/${path}`;
  return path;
}

function buildAskBody(question: string, session?: string | null): { question: string; session?: string } {
  const body: { question: string; session?: string } = { question };
  if (session != null && session.trim() !== '') {
    body.session = session.trim();
  }
  return body;
}

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'text/event-stream, application/x-ndjson, application/json',
    'Content-Type': 'application/json',
  };
  const accessToken = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function dispatchStreamEvent(eventType: string, data: string, handlers: ChatbotRagStreamHandlers) {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(data) as Record<string, unknown>;
  } catch {
    return;
  }

  const type =
    (eventType && eventType !== 'message' ? eventType : null) ??
    (typeof parsed.type === 'string' ? parsed.type : null) ??
    (typeof parsed.event === 'string' ? parsed.event : null);

  if (type === 'meta') {
    handlers.onMeta?.({
      session: typeof parsed.session === 'string' ? parsed.session : undefined,
      intent: typeof parsed.intent === 'string' ? parsed.intent : undefined,
      sources: Array.isArray(parsed.sources) ? parsed.sources : undefined,
    });
    return;
  }

  if (type === 'delta') {
    if (typeof parsed.content === 'string') handlers.onDelta?.(parsed.content);
    return;
  }

  if (type === 'done') {
    handlers.onDone?.({
      intent: typeof parsed.intent === 'string' ? parsed.intent : undefined,
      sources: Array.isArray(parsed.sources) ? parsed.sources : undefined,
    });
    return;
  }

  if (typeof parsed.content === 'string') {
    handlers.onDelta?.(parsed.content);
  } else if (typeof parsed.session === 'string' || typeof parsed.intent === 'string') {
    handlers.onMeta?.({
      session: typeof parsed.session === 'string' ? parsed.session : undefined,
      intent: typeof parsed.intent === 'string' ? parsed.intent : undefined,
      sources: Array.isArray(parsed.sources) ? parsed.sources : undefined,
    });
  }
}

function isDeltaPayload(eventType: string, data: string): boolean {
  if (eventType === 'delta') return true;
  try {
    const parsed = JSON.parse(data) as Record<string, unknown>;
    return (
      parsed.type === 'delta' ||
      parsed.event === 'delta' ||
      (typeof parsed.content === 'string' && parsed.type !== 'meta' && parsed.type !== 'done')
    );
  } catch {
    return false;
  }
}

async function consumeSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: ChatbotRagStreamHandlers,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';
  let eventType = '';
  let dataLines: string[] = [];

  const flush = async () => {
    if (dataLines.length === 0) return;
    const currentType = eventType;
    const payload = dataLines.join('\n');
    eventType = '';
    dataLines = [];

    const shouldYield = isDeltaPayload(currentType, payload);
    dispatchStreamEvent(currentType, payload, handlers);

    if (shouldYield) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      if (line === '') {
        await flush();
        continue;
      }
      if (line.startsWith('event:')) {
        await flush();
        eventType = line.slice(6).trim();
        continue;
      }
      if (line.startsWith('data:')) {
        if (dataLines.length > 0) {
          await flush();
        }
        dataLines.push(line.slice(5).trimStart());
        continue;
      }
      const trimmed = line.trim();
      if (trimmed.startsWith('{')) {
        const shouldYield = isDeltaPayload('message', trimmed);
        dispatchStreamEvent('message', trimmed, handlers);
        if (shouldYield) {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
        }
      }
    }
  }

  await flush();

  const tail = buffer.trim();
  if (tail.startsWith('{')) {
    const shouldYield = isDeltaPayload('message', tail);
    dispatchStreamEvent('message', tail, handlers);
    if (shouldYield) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
  }
}

export async function askChatbotRagStream(
  question: string,
  session: string | null | undefined,
  handlers: ChatbotRagStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(resolveApiUrl(CHATBOT_RAG_ASK_STREAM_URL), {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(buildAskBody(question, session)),
    signal,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const error = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(error.message ?? `Request failed with status ${response.status}`);
    }
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming is not supported by this browser.');
  }

  await consumeSseStream(reader, handlers);
}

export type ChatbotRagChatSummary = {
  session: string;
  firstQuestion: string;
  firstAnswer: string;
  firstCreatedAt: string;
  lastCreatedAt: string;
  messageCount: number;
};

export type ChatbotRagMessage = {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
};

export type ChatbotRagMessagesPage = {
  items: ChatbotRagMessage[];
  nextCursor: string | null;
  limit: number;
};

export async function getChatbotRagChats(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  return http<PaginationResponse<ChatbotRagChatSummary>>(`${CHATBOT_RAG_CHATS_URL}?${query}`, {
    method: 'GET',
    headers: { accept: '*/*' },
  });
}

export async function getChatbotRagChatMessages(
  session: string,
  params?: { limit?: number; cursor?: string },
) {
  const limit = params?.limit ?? 50;
  const query = new URLSearchParams({ limit: String(limit) });
  if (params?.cursor) query.set('cursor', params.cursor);
  return http<Response<ChatbotRagMessagesPage>>(
    `${CHATBOT_RAG_CHATS_URL}/${encodeURIComponent(session)}/messages?${query}`,
    {
      method: 'GET',
      headers: { accept: '*/*' },
    },
  );
}

export async function getAllChatbotRagChatMessages(session: string): Promise<ChatbotRagMessage[]> {
  const all: ChatbotRagMessage[] = [];
  let cursor: string | undefined;
  const limit = 50;

  while (true) {
    const res = await getChatbotRagChatMessages(session, { limit, cursor });
    const page = res.data;
    all.push(...page.items);
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }

  return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
