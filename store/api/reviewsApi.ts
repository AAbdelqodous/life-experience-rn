import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  userId: number;
  userName: string;
  centerId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  centerId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewsQueryParams {
  page?: number;
  size?: number;
  centerId?: number;
  minRating?: number;
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
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

export interface CenterRatingSummary {
  centerId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
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
    getReviews: builder.query<ReviewsResponse, ReviewsQueryParams>({
      query: (params) => ({
        url: '/reviews',
        params,
      }),
    }),

    getMyReviews: builder.query<ReviewsResponse, ReviewsQueryParams>({
      query: (params) => ({
        url: '/reviews/my',
        params,
      }),
    }),

    getReviewById: builder.query<Review, number>({
      query: (id) => `/reviews/${id}`,
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
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
    }),

    getCenterRatingSummary: builder.query<CenterRatingSummary, number>({
      query: (centerId) => `/reviews/center/${centerId}/summary`,
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetMyReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetCenterRatingSummaryQuery,
} = reviewsApi;
