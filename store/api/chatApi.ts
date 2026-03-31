import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export enum SenderType {
  USER = 'USER',
  CENTER = 'CENTER',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export interface Conversation {
  id: number;
  userId: number;
  centerId: number;
  centerNameAr: string;
  centerNameEn: string;
  centerImageUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: SenderType;
  senderName: string;
  type: MessageType;
  content: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  type?: MessageType;
  imageUrl?: string;
}

export interface ConversationsQueryParams {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
  sortBy?: 'date' | 'unread';
  sortOrder?: 'asc' | 'desc';
}

export interface ConversationsResponse {
  content: Conversation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MessagesQueryParams {
  page?: number;
  size?: number;
  sortBy?: 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface MessagesResponse {
  content: Message[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── API slice ───────────────────────────────────────────────────────────────────

export const chatApi = createApi({
  reducerPath: 'chatApi',
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
    getMyConversations: builder.query<ConversationsResponse, ConversationsQueryParams>({
      query: (params) => ({
        url: '/conversations',
        params,
      }),
    }),

    getConversationById: builder.query<Conversation, number>({
      query: (id) => `/conversations/${id}`,
    }),

    getMessages: builder.query<MessagesResponse, { conversationId: number; params?: MessagesQueryParams }>({
      query: ({ conversationId, params }) => ({
        url: `/conversations/${conversationId}/messages`,
        params,
      }),
    }),

    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
    }),

    markMessagesAsRead: builder.mutation<void, number>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: 'POST',
      }),
    }),

    createConversation: builder.mutation<Conversation, number>({
      query: (centerId) => ({
        url: '/conversations',
        method: 'POST',
        body: { centerId },
      }),
    }),
  }),
});

export const {
  useGetMyConversationsQuery,
  useGetConversationByIdQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useCreateConversationMutation,
} = chatApi;
