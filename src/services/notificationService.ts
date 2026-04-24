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

export type CreateNotificationPayload = {
  userId?: number;
  patientId?: number;
  recipientUserId?: number;
  title: string;
  content: string;
  type: NotificationType;
  redirectUrl?: string;
};

export type CreateNotificationResponse = Response<NotificationItem>;

type NotificationPostErrorDetail = {
  status: number;
  statusText: string;
  responseBodyText: string;
  responseBodyJson?: unknown;
};

class NotificationPostError extends Error {
  detail: NotificationPostErrorDetail;

  constructor(detail: NotificationPostErrorDetail) {
    super(`POST /notifications failed: ${detail.status} ${detail.statusText}`);
    this.name = 'NotificationPostError';
    this.detail = detail;
  }
}

let hasLoggedForbiddenNotificationPost = false;

async function postNotificationRaw(payload: CreateNotificationPayload): Promise<CreateNotificationResponse> {
  const endpoint = import.meta.env.VITE_ENDPOINT_API as string;
  const url = `${endpoint}${NOTIFICATIONS_URL}`;

  const headers = new Headers({
    'Content-Type': 'application/json',
    accept: '*/*',
  });

  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const rawText = await response.text().catch(() => '');
  let parsedJson: unknown;
  if (rawText) {
    try {
      parsedJson = JSON.parse(rawText) as unknown;
    } catch {
      parsedJson = undefined;
    }
  }

  if (!response.ok) {
    throw new NotificationPostError({
      status: response.status,
      statusText: response.statusText,
      responseBodyText: rawText,
      responseBodyJson: parsedJson,
    });
  }

  if (parsedJson) return parsedJson as CreateNotificationResponse;
  throw new NotificationPostError({
    status: response.status,
    statusText: response.statusText || 'Invalid success payload',
    responseBodyText: rawText,
  });
}

export function createNotification(payload: CreateNotificationPayload) {
  return postNotificationRaw(payload);
}

export async function createNotificationBestEffort(payload: CreateNotificationPayload): Promise<boolean> {
  const candidates: CreateNotificationPayload[] = [
    payload,
    {
      ...payload,
      recipientUserId: payload.userId,
    },
    {
      ...payload,
      type: 'system',
    },
    {
      ...payload,
      type: 'system',
      recipientUserId: payload.userId,
    },
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const item = candidates[i];
    try {
      await createNotification(item);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        if (error instanceof NotificationPostError) {
          console.error('[notifications] POST /notifications failed', {
            attempt: i + 1,
            payload: item,
            status: error.detail.status,
            statusText: error.detail.statusText,
            responseBodyJson: error.detail.responseBodyJson,
            responseBodyText: error.detail.responseBodyText,
          });

          // AuthZ/AuthN failed: retrying alternative payload shapes is pointless.
          if (error.detail.status === 401 || error.detail.status === 403) {
            if (!hasLoggedForbiddenNotificationPost) {
              console.warn('[notifications] POST /notifications is forbidden for current role/token. Stop retrying.');
              hasLoggedForbiddenNotificationPost = true;
            }
            return false;
          }
        } else {
          console.error('[notifications] POST /notifications failed (unknown error)', {
            attempt: i + 1,
            payload: item,
            error,
          });
        }
      } else if (error instanceof NotificationPostError && (error.detail.status === 401 || error.detail.status === 403)) {
        return false;
      }
    }
  }

  return false;
}
