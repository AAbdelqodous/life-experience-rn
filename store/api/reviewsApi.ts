import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  rating: number;
  comment: string;
  centerId: number;
  centerNameAr: string;
  centerNameEn: string;
  userFirstname: string;
  userLastname: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  centerId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  centerId: number;
  rating: number;
  comment: string;
}

export interface ReviewsQueryParams {
  page?: number;
  size?: number;
}

export interface ReviewsResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── API slice ───────────────────────────────────────────────────────────────────

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
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
    getCenterReviews: builder.query<ReviewsResponse, { centerId: number; page?: number; size?: number }>({
      query: ({ centerId, page = 0, size = 10 }) => ({
        url: `/reviews/center/${centerId}`,
        params: { page, size },
      }),
    }),

    getMyReviews: builder.query<ReviewsResponse, ReviewsQueryParams>({
      query: (params) => ({
        url: '/reviews/my',
        params,
      }),
    }),

    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
    }),

    updateReview: builder.mutation<Review, { id: number; data: UpdateReviewRequest }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),

    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCenterReviewsQuery,
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
