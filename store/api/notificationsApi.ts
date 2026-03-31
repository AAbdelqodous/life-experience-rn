import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  priority: NotificationPriority;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  isRead: boolean;
  actionUrl?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationsQueryParams {
  page?: number;
  size?: number;
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  sortBy?: 'date' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationsResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

// ── API slice ───────────────────────────────────────────────────────────────────

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.session?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMyNotifications: builder.query<NotificationsResponse, NotificationsQueryParams>({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
    }),

    getNotificationById: builder.query<Notification, number>({
      query: (id) => `/notifications/${id}`,
    }),

    markAsRead: builder.mutation<Notification, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
    }),

    deleteNotification: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/notifications/unread-count',
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetUnreadCountQuery,
} = notificationsApi;
