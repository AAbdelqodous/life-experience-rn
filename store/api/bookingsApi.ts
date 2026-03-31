import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum ServiceType {
  CAR = 'CAR',
  ELECTRONICS = 'ELECTRONICS',
  HOME_APPLIANCE = 'HOME_APPLIANCE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  KNET = 'KNET',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum CancelledBy {
  USER = 'USER',
  CENTER = 'CENTER',
  SYSTEM = 'SYSTEM',
}

export interface Booking {
  id: number;
  userId: number;
  centerId: number;
  centerNameAr: string;
  centerNameEn: string;
  serviceType: ServiceType;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  cancelledBy?: CancelledBy;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  centerId: number;
  serviceType: ServiceType;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateBookingRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
}

export interface CancelBookingRequest {
  reason: string;
}

export interface BookingsQueryParams {
  page?: number;
  size?: number;
  status?: BookingStatus;
  serviceType?: ServiceType;
  centerId?: number;
  sortBy?: 'date' | 'status' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface BookingsResponse {
  content: Booking[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── API slice ───────────────────────────────────────────────────────────────────

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
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
    getMyBookings: builder.query<BookingsResponse, BookingsQueryParams>({
      query: (params) => ({
        url: '/bookings/my',
        params,
      }),
    }),

    getBookingById: builder.query<Booking, number>({
      query: (id) => `/bookings/${id}`,
    }),

    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
    }),

    updateBooking: builder.mutation<Booking, { id: number; data: UpdateBookingRequest }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    cancelBooking: builder.mutation<void, { id: number; data: CancelBookingRequest }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}/cancel`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;
