import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface UserFavorite {
  id: number;
  userId: number;
  centerId: number;
  centerNameAr: string;
  centerNameEn: string;
  centerDescriptionAr?: string;
  centerDescriptionEn?: string;
  centerAddress: {
    street: string;
    city: string;
    area: string;
  };
  centerPhone: string;
  centerAverageRating: number;
  centerReviewCount: number;
  centerImageUrl?: string;
  createdAt: string;
}

export interface FavoritesQueryParams {
  page?: number;
  size?: number;
  sortBy?: 'date' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface FavoritesResponse {
  content: UserFavorite[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── API slice ───────────────────────────────────────────────────────────────────

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  tagTypes: ['Favorite'],
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
    getMyFavorites: builder.query<UserFavorite[], void>({
      query: () => '/favorites/my',
      providesTags: ['Favorite'],
    }),

    addFavorite: builder.mutation<UserFavorite, number>({
      query: (centerId) => ({
        url: '/favorites',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centerId }),
      }),
      invalidatesTags: ['Favorite'],
    }),

    removeFavorite: builder.mutation<void, number>({
      query: (centerId) => ({
        url: `/favorites/center/${centerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorite'],
    }),

    isFavorite: builder.query<boolean, number>({
      query: (centerId) => `/favorites/check/${centerId}`,
    }),
  }),
});

export const {
  useGetMyFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useIsFavoriteQuery,
  useLazyIsFavoriteQuery,
} = favoritesApi;
