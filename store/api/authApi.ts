import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';

// ── Request types ──────────────────────────────────────────────────────────────

export interface RegistrationRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

// ── Response types ─────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
}

export interface ErrorResponse {
  businessErrorCode?: number;
  businessErrorDescription?: string;
  error?: string;
  validationErrors?: string[];
  errors?: Record<string, string>;
}

// ── API slice ──────────────────────────────────────────────────────────────────

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    register: builder.mutation<void, RegistrationRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<AuthResponse, AuthRequest>({
      query: (body) => ({
        url: '/auth/authenticate',
        method: 'POST',
        body,
      }),
    }),

    activateAccount: builder.query<void, string>({
      query: (token) => ({
        url: `/auth/activate-account?token=${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLazyActivateAccountQuery } = authApi;
