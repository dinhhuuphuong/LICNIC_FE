import { ChatMessageMarkdown } from '@/components/chatbot/ChatMessageMarkdown';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { askChatbotRagStream } from '@/services/chatbotRagService';
import { useAuthStore } from '@/stores/authStore';
import { Bot, History, Loader2, Send, Sparkles, SquarePen, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';

type ChatRole = 'user' | 'assistant';

type ChatTurn = {
  role: ChatRole;
  content: string;
};

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Bot className="h-4 w-4" aria-hidden />
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm">
        <span className="flex gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
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
  const inputRef = useRef<HTMLInputElement>(null);
  const sendingLockRef = useRef(false);
  /** Session từ API; tin đầu không gửi, tin sau gửi lại giá trị `data.session` của lần gọi trước. */
  const ragSessionRef = useRef<string | null>(null);

  const initialAvatarSrc = useMemo(() => {
    if (!user?.avatar) return DEFAULT_AVATAR_URL;
    return user.avatar;
  }, [user?.avatar]);

  const [avatarSrc, setAvatarSrc] = useState(initialAvatarSrc);

  useEffect(() => {
    setAvatarSrc(initialAvatarSrc);
  }, [initialAvatarSrc]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen, isSending]);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 150);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const send = useCallback(
    async (textOverride?: string) => {
      const trimmed = (textOverride ?? input).trim();
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

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      try {
        let assistantText = '';

        await askChatbotRagStream(trimmed, ragSessionRef.current, {
          onMeta: (meta) => {
            if (meta.session?.trim()) {
              ragSessionRef.current = meta.session.trim();
            }
          },
          onDelta: (chunk) => {
            assistantText += chunk;
            flushSync(() => {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role !== 'assistant') return prev;
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            });
          },
        });

        if (!assistantText.trim()) {
          throw new Error(isVi ? 'Phản hồi không hợp lệ từ máy chủ.' : 'Invalid response from server.');
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && !last.content) return prev.slice(0, -2);
          return prev.slice(0, -1);
        });
        setInput(trimmed);
      } finally {
        sendingLockRef.current = false;
        setIsSending(false);
      }
    },
    [input, isVi, messages],
  );

  const startNewChat = useCallback(() => {
    if (isSending) return;
    setMessages([]);
    setInput('');
    setError(null);
    ragSessionRef.current = null;
    inputRef.current?.focus();
  }, [isSending]);

  if (!user) return null;

  const title = isVi ? 'Trợ lý AI' : 'AI assistant';
  const subtitle = isVi ? 'Hỗ trợ thông tin phòng khám' : 'Clinic information support';
  const placeholder = isVi ? 'Nhập câu hỏi…' : 'Ask something…';
  const sendLabel = isVi ? 'Gửi' : 'Send';
  const newChatLabel = isVi ? 'Cuộc trò chuyện mới' : 'New chat';
  const historyLabel = isVi ? 'Lịch sử chat' : 'Chat history';
  const thinkingLabel = isVi ? 'Đang trả lời…' : 'Thinking…';
  const emptyGreeting = isVi
    ? 'Chào bạn! Tôi có thể giúp gì về phòng khám hôm nay?'
    : 'Hi! How can I help you with the clinic today?';

  const quickPrompts = isVi
    ? ['Giờ làm việc của phòng khám?', 'Đặt lịch khám như thế nào?', 'Các dịch vụ đang có?']
    : ['Clinic opening hours?', 'How do I book an appointment?', 'What services are available?'];

  const showTypingIndicator =
    isSending &&
    messages[messages.length - 1]?.role === 'assistant' &&
    !messages[messages.length - 1]?.content;

  const headerIconBtnClass =
    'flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {isOpen ? (
        <div
          className="pointer-events-auto flex min-h-[min(560px,calc(100vh-6rem))] max-h-[min(560px,calc(100vh-6rem))] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5"
          role="dialog"
          aria-label={title}
        >
          {/* Header */}
          <div className="shrink-0 bg-linear-to-r from-blue-600 to-blue-700 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-inner">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className="truncate text-sm font-bold text-white">{title}</h2>
                <p className="truncate text-xs text-blue-100">{subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Link
                  to={ROUTES.chatHistory}
                  className={headerIconBtnClass}
                  title={historyLabel}
                  aria-label={historyLabel}
                  onClick={() => setIsOpen(false)}
                >
                  <History className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  className={headerIconBtnClass}
                  onClick={startNewChat}
                  disabled={isSending}
                  title={newChatLabel}
                  aria-label={newChatLabel}
                >
                  <SquarePen className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={headerIconBtnClass}
                  onClick={() => setIsOpen(false)}
                  title={isVi ? 'Đóng' : 'Close'}
                  aria-label={isVi ? 'Đóng' : 'Close'}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-3 py-4 scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center px-2 pt-6 pb-2 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25">
                  <Bot className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="max-w-[260px] text-sm leading-relaxed text-slate-600">{emptyGreeting}</p>
                <div className="mt-5 flex w-full flex-col gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSending}
                      onClick={() => void send(prompt)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => {
                const isLastAssistantStreaming =
                  isSending && i === messages.length - 1 && m.role === 'assistant';
                const isEmptyAssistant = m.role === 'assistant' && !m.content;
                if (isEmptyAssistant) return null;

                const isUser = m.role === 'user';

                return (
                  <div
                    key={`${m.role}-${i}`}
                    className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                        isUser ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                      }`}
                      aria-hidden
                    >
                      {isUser ? (
                        <img
                          src={avatarSrc}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          onError={() => setAvatarSrc(DEFAULT_AVATAR_URL)}
                        />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[calc(100%-2.75rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'rounded-tr-md bg-blue-600 text-white'
                          : 'rounded-tl-md border border-slate-100 bg-white text-slate-800'
                      }`}
                    >
                      <ChatMessageMarkdown
                        content={m.content}
                        role={m.role}
                        isStreaming={isLastAssistantStreaming}
                      />
                    </div>
                  </div>
                );
              })
            )}
            {showTypingIndicator ? <TypingIndicator label={thinkingLabel} /> : null}
          </div>

          {error ? (
            <div className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2.5 text-xs leading-relaxed text-red-700">
              {error}
            </div>
          ) : null}

          {/* Input */}
          <div className="shrink-0 border-t border-slate-100 bg-white p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 pl-3.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
              <input
                ref={inputRef}
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
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                disabled={isSending || !input.trim()}
                onClick={() => void send()}
                aria-label={sendLabel}
                title={sendLabel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`pointer-events-auto grid h-14 w-14 place-items-center rounded-full text-white shadow-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          isOpen
            ? 'bg-slate-700 shadow-slate-900/25 hover:bg-slate-800'
            : 'bg-linear-to-br from-blue-600 to-blue-700 shadow-blue-900/30 hover:from-blue-700 hover:to-blue-800'
        }`}
        aria-label={isOpen ? (isVi ? 'Thu gọn' : 'Minimize') : title}
        aria-expanded={isOpen}
        title={isOpen ? (isVi ? 'Thu gọn' : 'Minimize') : title}
      >
        {isOpen ? <X className="h-6 w-6" strokeWidth={2} aria-hidden /> : <Bot className="h-7 w-7" strokeWidth={2} aria-hidden />}
      </button>
    </div>
  );
}
