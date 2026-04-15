import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

export enum MediaCategory {
  DIAGNOSTICS = 'DIAGNOSTICS',
  PARTS = 'PARTS',
  WORK_IN_PROGRESS = 'WORK_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface BookingMedia {
  id: number;
  url: string;
  category: MediaCategory;
  categoryDisplayNameAr: string;
  categoryDisplayNameEn: string;
  caption?: string;
  createdAt: string;
}

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.session?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    getBookingMedia: builder.query<BookingMedia[], { bookingId: number; category?: MediaCategory }>({
      query: ({ bookingId, category }) => ({
        url: `bookings/${bookingId}/media`,
        params: category ? { category } : undefined,
      }),
      providesTags: (result, error, { bookingId }) => [{ type: 'Media', id: bookingId }],
    }),
  }),
});

export const { useGetBookingMediaQuery } = mediaApi;
