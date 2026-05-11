import { useLanguage } from '@/contexts/NgonNguContext';
import { askChatbotRag } from '@/services/chatbotRagService';
import { useAuthStore } from '@/stores/authStore';
import { Bot } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';

type ChatRole = 'user' | 'assistant';

type ChatTurn = {
  role: ChatRole;
  content: string;
};

const markdownLink: Components['a'] = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline">
    {children}
  </a>
);

const markdownComponents: Partial<Components> = {
  a: markdownLink,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="[&>p]:m-0">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes('language-'));
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded px-1 py-px font-mono text-[0.9em]" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 max-w-full overflow-x-auto rounded-lg p-2.5 font-mono text-[0.85em] leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => <blockquote className="my-2 border-l-2 pl-2 italic opacity-95">{children}</blockquote>,
  h1: ({ children }) => <h1 className="mb-2 text-base font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 text-sm font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 text-sm font-semibold">{children}</h3>,
};

function ChatMessageMarkdown({ content, role }: { content: string; role: ChatRole }) {
  const prose =
    role === 'user'
      ? '[&_a]:text-blue-100 [&_code]:bg-blue-800/75 [&_code]:text-white [&_pre]:bg-blue-900/55 [&_pre]:text-blue-50 [&_blockquote]:border-blue-200/70 [&_blockquote]:text-blue-50'
      : '[&_a]:text-blue-700 [&_code]:bg-slate-200 [&_code]:text-slate-900 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_blockquote]:border-slate-300 [&_blockquote]:text-slate-700';

  return (
    <div className={`min-w-0 wrap-break-word ${prose}`}>
      <Markdown components={markdownComponents}>{content}</Markdown>
    </div>
  );
}

export function OpenRouterChatbot() {
  const user = useAuthStore((s) => s.user);
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sendingLockRef = useRef(false);
  /** Session từ API; tin đầu không gửi, tin sau gửi lại giá trị `data.session` của lần gọi trước. */
  const ragSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen, isSending]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sendingLockRef.current) return;

    const accessToken = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      setError(isVi ? 'Bạn cần đăng nhập để dùng trợ lý.' : 'Please sign in to use the assistant.');
      return;
    }

    const nextMessages: ChatTurn[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    sendingLockRef.current = true;
    setIsSending(true);

    try {
      const parsed = await askChatbotRag(trimmed, ragSessionRef.current);

      if (parsed.error != null && parsed.error !== '') {
        throw new Error(typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error));
      }

      const assistantText = parsed.data?.answer;
      if (typeof assistantText !== 'string' || !assistantText.trim()) {
        throw new Error(isVi ? 'Phản hồi không hợp lệ từ máy chủ.' : 'Invalid response from server.');
      }

      const nextSession = parsed.data?.session;
      if (typeof nextSession === 'string' && nextSession.trim() !== '') {
        ragSessionRef.current = nextSession.trim();
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      sendingLockRef.current = false;
      setIsSending(false);
    }
  }, [input, isVi, messages]);

  if (!user) return null;

  const title = isVi ? 'Trợ lý AI' : 'AI assistant';
  const placeholder = isVi ? 'Nhập câu hỏi…' : 'Ask something…';
  const sendLabel = isVi ? 'Gửi' : 'Send';

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      {isOpen ? (
        <div className="pointer-events-auto flex min-h-[520px] max-h-[min(520px,calc(100vh-8rem))] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold text-slate-800">{title}</span>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/80"
              onClick={() => setIsOpen(false)}
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-slate-500">
                {isVi ? 'Chào bạn! Bạn cần hỗ trợ gì về phòng khám?' : 'Hi! How can I help you today?'}
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto bg-blue-600 text-white'
                      : 'mr-auto border border-slate-100 bg-slate-50 text-slate-800'
                  }`}
                >
                  <ChatMessageMarkdown content={m.content} role={m.role} />
                </div>
              ))
            )}
            {isSending ? (
              <p className="text-center text-xs text-slate-400">{isVi ? 'Đang trả lời…' : 'Thinking…'}</p>
            ) : null}
          </div>

          {error ? (
            <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
          ) : null}

          <div className="border-t border-slate-100 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={placeholder}
                disabled={isSending}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500/30 focus:border-blue-400 focus:ring-2 disabled:bg-slate-50"
              />
              <button
                type="button"
                disabled={isSending || !input.trim()}
                onClick={() => void send()}
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-label={title}
        title={title}
      >
        <Bot className="h-7 w-7" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
