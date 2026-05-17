import { ChatMessageMarkdown } from '@/components/chatbot/ChatMessageMarkdown';
import { StatePanel } from '@/components/common/StatePanel';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getAllChatbotRagChatMessages,
  getChatbotRagChats,
  type ChatbotRagChatSummary,
} from '@/services/chatbotRagService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquare,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;
const chatsQueryKeyRoot = ['chatbot-rag', 'chats'] as const;

const primaryActionClassName =
  'inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700';
const paginationButtonClassName =
  'inline-flex h-9 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40';

function formatDateTime(value: string, isVi: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(isVi ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(text: string, maxLen: number): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trimEnd()}…`;
}

function PanelLoading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof MessageSquare;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function ChatHistoryList({
  items,
  selectedSession,
  isVi,
  onSelect,
}: {
  items: ChatbotRagChatSummary[];
  selectedSession: string | null;
  isVi: boolean;
  onSelect: (session: string) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyPanel
        icon={MessagesSquare}
        title={isVi ? 'Chưa có cuộc trò chuyện' : 'No conversations yet'}
        description={
          isVi
            ? 'Bắt đầu chat với trợ lý AI để lưu lịch sử tại đây.'
            : 'Start chatting with the AI assistant to see history here.'
        }
      />
    );
  }

  return (
    <ul className="space-y-1.5 p-2">
      {items.map((item) => {
        const isActive = item.session === selectedSession;
        return (
          <li key={item.session}>
            <button
              type="button"
              onClick={() => onSelect(item.session)}
              className={`group flex w-full flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-left transition ${
                isActive
                  ? 'border-blue-200 bg-blue-50 shadow-sm ring-1 ring-blue-100'
                  : 'border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm'
              }`}
            >
              <span
                className={`line-clamp-2 text-sm font-semibold leading-snug ${
                  isActive ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-900'
                }`}
              >
                {item.firstQuestion || (isVi ? '(Không có câu hỏi)' : '(No question)')}
              </span>
              <span className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                {truncateText(item.firstAnswer, 100)}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" aria-hidden />
                  {formatDateTime(item.lastCreatedAt, isVi)}
                </span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
                  {item.messageCount} {isVi ? 'tin' : 'msgs'}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChatHistoryListSkeleton() {
  return (
    <ul className="space-y-2 p-2" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-4">
          <div className="mb-2 h-3.5 w-4/5 rounded bg-slate-200" />
          <div className="mb-3 h-3 w-full rounded bg-slate-100" />
          <div className="h-2.5 w-1/3 rounded bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

function ChatSessionDetail({
  session,
  isVi,
  userName,
  avatarSrc,
  onAvatarError,
}: {
  session: string;
  isVi: boolean;
  userName: string;
  avatarSrc: string;
  onAvatarError: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['chatbot-rag', 'messages', session] as const,
    queryFn: () => getAllChatbotRagChatMessages(session),
  });

  if (isLoading) {
    return <PanelLoading label={isVi ? 'Đang tải tin nhắn…' : 'Loading messages…'} />;
  }

  if (isError) {
    return (
      <StatePanel
        tone="danger"
        className="m-4 rounded-2xl"
        title={isVi ? 'Không tải được tin nhắn' : 'Failed to load messages'}
        description={error instanceof Error ? error.message : String(error)}
        action={
          <button type="button" className={primaryActionClassName} onClick={() => void refetch()}>
            {isVi ? 'Thử lại' : 'Retry'}
          </button>
        }
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyPanel
        icon={MessageSquare}
        title={isVi ? 'Cuộc trò chuyện trống' : 'Empty conversation'}
        description={isVi ? 'Không có tin nhắn trong phiên này.' : 'There are no messages in this session.'}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-5">
      {data.map((msg, index) => (
        <article key={msg.id} className="space-y-3">
          {index > 0 ? (
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <time className="shrink-0 text-[11px] font-medium text-slate-400" dateTime={msg.createdAt}>
                {formatDateTime(msg.createdAt, isVi)}
              </time>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          ) : (
            <time className="block text-center text-[11px] font-medium text-slate-400" dateTime={msg.createdAt}>
              {formatDateTime(msg.createdAt, isVi)}
            </time>
          )}

          <div className="flex flex-row-reverse gap-2.5">
            <img
              src={avatarSrc}
              alt={userName}
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-blue-100"
              onError={onAvatarError}
            />
            <div className="max-w-[calc(100%-2.75rem)] rounded-2xl rounded-tr-md bg-blue-600 px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
              <ChatMessageMarkdown content={msg.question} role="user" />
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Bot className="h-4 w-4" aria-hidden />
            </div>
            <div className="max-w-[calc(100%-2.75rem)] rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm">
              <ChatMessageMarkdown content={msg.answer} role="assistant" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function LichSuTroLyAiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const initialAvatarSrc = useMemo(() => {
    if (!user?.avatar) return DEFAULT_AVATAR_URL;
    return user.avatar;
  }, [user?.avatar]);

  const [avatarSrc, setAvatarSrc] = useState(initialAvatarSrc);

  useEffect(() => {
    setAvatarSrc(initialAvatarSrc);
  }, [initialAvatarSrc]);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Lịch sử trợ lý AI' : 'NHA KHOA TẬN TÂM | AI chat history');

  const queryKey = useMemo(() => [...chatsQueryKeyRoot, page] as const, [page]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await getChatbotRagChats({ page, limit: PAGE_SIZE });
      return res.data;
    },
    enabled: !!user,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const selectedChat = useMemo(
    () => data?.items.find((item) => item.session === selectedSession) ?? null,
    [data?.items, selectedSession],
  );

  const handleSelectSession = (session: string) => {
    setSelectedSession(session);
    setMobileShowDetail(true);
  };

  const handleBackToList = () => {
    setMobileShowDetail(false);
  };

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={
          isVi ? 'Vui lòng đăng nhập để xem lịch sử trò chuyện.' : 'Please sign in to view chat history.'
        }
        action={
          <button type="button" className={primaryActionClassName} onClick={() => navigate(ROUTES.login)}>
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  const detailTitle = selectedChat
    ? truncateText(selectedChat.firstQuestion || (isVi ? 'Cuộc trò chuyện' : 'Conversation'), 48)
    : isVi
      ? 'Chọn một cuộc trò chuyện'
      : 'Select a conversation';

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Page header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-5 py-5 md:px-6">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </Link>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-inner">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white md:text-2xl">
                {isVi ? 'Lịch sử trò chuyện' : 'Chat history'}
              </h1>
              <p className="mt-0.5 text-sm text-blue-100">
                {isVi
                  ? 'Xem lại các cuộc trò chuyện với trợ lý AI của bạn.'
                  : 'Review your past conversations with the AI assistant.'}
              </p>
            </div>
          </div>
        </div>
        {data && data.total > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 bg-slate-50/80 px-5 py-2.5 text-xs text-slate-600 md:px-6">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MessagesSquare className="h-3.5 w-3.5 text-blue-600" aria-hidden />
              {data.total} {isVi ? 'cuộc trò chuyện' : 'conversations'}
            </span>
            {isFetching && !isLoading ? (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                {isVi ? 'Đang cập nhật…' : 'Updating…'}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {isError ? (
        <StatePanel
          tone="danger"
          className="rounded-2xl"
          title={isVi ? 'Không tải được danh sách' : 'Failed to load list'}
          description={error instanceof Error ? error.message : String(error)}
          action={
            <button type="button" className={primaryActionClassName} onClick={() => void refetch()}>
              {isVi ? 'Thử lại' : 'Retry'}
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5">
          <div className="grid min-h-[min(72vh,680px)] md:grid-cols-[minmax(0,300px)_1fr]">
            {/* Sidebar */}
            <aside
              className={`flex flex-col border-slate-200 bg-slate-50/50 md:border-r ${
                mobileShowDetail ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
                <MessageSquare className="h-4 w-4 text-blue-600" aria-hidden />
                <span className="text-sm font-bold text-slate-800">
                  {isVi ? 'Cuộc trò chuyện' : 'Conversations'}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {isLoading ? (
                  <ChatHistoryListSkeleton />
                ) : (
                  <ChatHistoryList
                    items={data?.items ?? []}
                    selectedSession={selectedSession}
                    isVi={isVi}
                    onSelect={handleSelectSession}
                  />
                )}
              </div>

              {data && data.total > PAGE_SIZE ? (
                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2.5">
                  <button
                    type="button"
                    className={paginationButtonClassName}
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label={isVi ? 'Trang trước' : 'Previous page'}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">{isVi ? 'Trước' : 'Prev'}</span>
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className={paginationButtonClassName}
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label={isVi ? 'Trang sau' : 'Next page'}
                  >
                    <span className="hidden sm:inline">{isVi ? 'Sau' : 'Next'}</span>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : null}
            </aside>

            {/* Detail */}
            <section className={`flex min-h-0 flex-col ${!mobileShowDetail ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
                  onClick={handleBackToList}
                  aria-label={isVi ? 'Quay lại danh sách' : 'Back to list'}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{detailTitle}</p>
                  {selectedChat ? (
                    <p className="truncate text-xs text-slate-500">
                      {formatDateTime(selectedChat.lastCreatedAt, isVi)}
                      <span className="mx-1.5" aria-hidden>
                        ·
                      </span>
                      {selectedChat.messageCount} {isVi ? 'tin nhắn' : 'messages'}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 scroll-smooth">
                {selectedSession ? (
                  <ChatSessionDetail
                    session={selectedSession}
                    isVi={isVi}
                    userName={user.name}
                    avatarSrc={avatarSrc}
                    onAvatarError={() => setAvatarSrc(DEFAULT_AVATAR_URL)}
                  />
                ) : (
                  <EmptyPanel
                    icon={Bot}
                    title={isVi ? 'Chưa chọn cuộc trò chuyện' : 'No conversation selected'}
                    description={
                      isVi
                        ? 'Chọn một mục bên trái để xem chi tiết tin nhắn.'
                        : 'Pick a conversation on the left to view messages.'
                    }
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
