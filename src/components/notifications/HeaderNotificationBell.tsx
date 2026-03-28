import { useLanguage } from '@/contexts/NgonNguContext';
import {
  getMyNotifications,
  getMyUnreadNotificationCount,
  markAllMyNotificationsRead,
  markMyNotificationRead,
  markMyNotificationUnread,
  type NotificationItem,
} from '@/services/notificationService';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_LIMIT = 10;

export function HeaderNotificationBell() {
  const user = useAuthStore((state) => state.user);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const t =
    language === 'vi'
      ? {
          ariaBell: 'Thông báo',
          title: 'Thông báo',
          empty: 'Chưa có thông báo',
          loadMore: 'Xem thêm',
          markAllRead: 'Đánh dấu đã đọc tất cả',
          markUnread: 'Chưa đọc',
          loading: 'Đang tải…',
        }
      : {
          ariaBell: 'Notifications',
          title: 'Notifications',
          empty: 'No notifications yet',
          loadMore: 'Load more',
          markAllRead: 'Mark all as read',
          markUnread: 'Mark unread',
          loading: 'Loading…',
        };

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getMyUnreadNotificationCount();
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!user) return;
      if (append) setLoadingMore(true);
      else setLoadingList(true);
      try {
        const res = await getMyNotifications({ page: nextPage, limit: PAGE_LIMIT });
        const chunk = res.data?.items ?? [];
        const nextTotal = res.data?.total ?? 0;
        setTotal(nextTotal);
        setPage(nextPage);
        setItems((prev) => (append ? [...prev, ...chunk] : chunk));
      } finally {
        setLoadingList(false);
        setLoadingMore(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setItems([]);
      setIsOpen(false);
      return;
    }
    void refreshUnread();
  }, [user, refreshUnread]);

  useEffect(() => {
    if (!isOpen || !user) return;
    void loadPage(1, false);
    void refreshUnread();
  }, [isOpen, user, loadPage, refreshUnread]);

  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (!containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [isOpen]);

  const handleOpenToggle = () => {
    setIsOpen((v) => !v);
  };

  const handleMarkAllRead = async () => {
    if (!user || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllMyNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // giữ UI; có thể thử lại
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemActivate = async (n: NotificationItem) => {
    if (!user) return;
    try {
      if (!n.isRead) {
        await markMyNotificationRead(n.notificationId);
        setItems((prev) => prev.map((x) => (x.notificationId === n.notificationId ? { ...x, isRead: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // vẫn cho phép điều hướng nếu có URL
    }

    setIsOpen(false);
    const url = n.redirectUrl?.trim();
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    }
  };

  const handleMarkUnreadOnly = async (event: ReactMouseEvent, n: NotificationItem) => {
    event.stopPropagation();
    if (!user || !n.isRead) return;
    try {
      await markMyNotificationUnread(n.notificationId);
      setItems((prev) => prev.map((x) => (x.notificationId === n.notificationId ? { ...x, isRead: false } : x)));
      setUnreadCount((c) => c + 1);
    } catch {
      // bỏ qua
    }
  };

  const hasMore = items.length < total;

  if (!user) {
    return null;
  }

  const badge =
    unreadCount > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    ) : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.ariaBell}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        onClick={handleOpenToggle}
        type="button"
      >
        &#128276;
        {badge}
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-[min(100vw-2rem,380px)] rounded-2xl border border-slate-200 bg-white shadow-xl"
          role="dialog"
          aria-label={t.title}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-base font-bold text-slate-900">{t.title}</h2>
            <button
              className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
              disabled={markingAll || unreadCount === 0}
              onClick={() => void handleMarkAllRead()}
              type="button"
            >
              {t.markAllRead}
            </button>
          </div>

          <div className="max-h-[min(70vh,420px)] overflow-y-auto">
            {loadingList ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">{t.loading}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">{t.empty}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => (
                  <li key={n.notificationId}>
                    <div className={`flex items-stretch gap-1 ${n.isRead ? 'bg-white' : 'bg-sky-50/60'}`}>
                      <button
                        className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50"
                        onClick={() => void handleItemActivate(n)}
                        type="button"
                      >
                        <span className="text-sm font-semibold text-slate-900">{n.title}</span>
                        <span className="line-clamp-2 text-xs text-slate-600">{n.content}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </button>
                      {n.isRead ? (
                        <button
                          className="shrink-0 self-center px-2 py-1 text-[11px] font-semibold text-blue-700 transition hover:underline"
                          onClick={(e) => void handleMarkUnreadOnly(e, n)}
                          type="button"
                        >
                          {t.markUnread}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hasMore && !loadingList ? (
            <div className="border-t border-slate-100 p-2">
              <button
                className="w-full rounded-xl py-2 text-sm font-semibold text-blue-700 transition hover:bg-slate-50 disabled:opacity-50"
                disabled={loadingMore}
                onClick={() => void loadPage(page + 1, true)}
                type="button"
              >
                {loadingMore ? t.loading : t.loadMore}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
