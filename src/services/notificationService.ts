import { http, type PaginationResponse, type Response } from '@/services/http';

const NOTIFICATIONS_URL = '/notifications';

export const NOTIFICATION_TYPES = [
  'appointment_reminder',
  'appointment_confirmed',
  'appointment_cancelled',
  'payment_success',
  'new_message',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationItem = {
  notificationId: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type: NotificationType;
  redirectUrl?: string | null;
};

export type FindMyNotificationsParams = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
};

function buildMyNotificationsQuery(params?: FindMyNotificationsParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', String(params.page));
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.isRead !== undefined) search.set('isRead', params.isRead ? 'true' : 'false');
  if (params.type) search.set('type', params.type);
  const q = search.toString();
  return q ? `?${q}` : '';
}

export type MyNotificationsListResponse = PaginationResponse<NotificationItem>;

export function getMyNotifications(params?: FindMyNotificationsParams) {
  const query = buildMyNotificationsQuery(params);
  return http<MyNotificationsListResponse>(`${NOTIFICATIONS_URL}/me${query}`, {
    headers: { accept: '*/*' },
  });
}

export type UnreadCountResponse = Response<{ unreadCount: number }>;

export function getMyUnreadNotificationCount() {
  return http<UnreadCountResponse>(`${NOTIFICATIONS_URL}/me/unread-count`, {
    headers: { accept: '*/*' },
  });
}

export type MarkNotificationReadResponse = Response<NotificationItem>;

export function markMyNotificationRead(notificationId: number) {
  return http<MarkNotificationReadResponse>(`${NOTIFICATIONS_URL}/me/${notificationId}/read`, {
    method: 'PATCH',
    headers: { accept: '*/*' },
  });
}

export type MarkNotificationUnreadResponse = Response<NotificationItem>;

export function markMyNotificationUnread(notificationId: number) {
  return http<MarkNotificationUnreadResponse>(`${NOTIFICATIONS_URL}/me/${notificationId}/unread`, {
    method: 'PATCH',
    headers: { accept: '*/*' },
  });
}

export type MarkAllReadResponse = Response<{ affected: number }>;

export function markAllMyNotificationsRead() {
  return http<MarkAllReadResponse>(`${NOTIFICATIONS_URL}/me/read-all`, {
    method: 'PATCH',
    headers: { accept: '*/*' },
  });
}
