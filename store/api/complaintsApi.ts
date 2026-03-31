import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../lib/constants/config';
import { RootState } from '../index';

// ── Types ───────────────────────────────────────────────────────────────────────

export enum ComplaintType {
  SERVICE_QUALITY = 'SERVICE_QUALITY',
  PRICING = 'PRICING',
  BEHAVIOR = 'BEHAVIOR',
  DELAY = 'DELAY',
  DAMAGED_ITEM = 'DAMAGED_ITEM',
  OTHER = 'OTHER',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Complaint {
  id: number;
  userId: number;
  bookingId?: number;
  centerId: number;
  centerNameAr: string;
  centerNameEn: string;
  type: ComplaintType;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  description: string;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateComplaintRequest {
  bookingId?: number;
  centerId: number;
  type: ComplaintType;
  description: string;
}

export interface ComplaintsQueryParams {
  page?: number;
  size?: number;
  status?: ComplaintStatus;
  type?: ComplaintType;
  centerId?: number;
  bookingId?: number;
  sortBy?: 'date' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ComplaintsResponse {
  content: Complaint[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── API slice ───────────────────────────────────────────────────────────────────

export const complaintsApi = createApi({
  reducerPath: 'complaintsApi',
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
    getMyComplaints: builder.query<ComplaintsResponse, ComplaintsQueryParams>({
      query: (params) => ({
        url: '/complaints',
        params,
      }),
    }),

    getComplaintById: builder.query<Complaint, number>({
      query: (id) => `/complaints/${id}`,
    }),

    createComplaint: builder.mutation<Complaint, CreateComplaintRequest>({
      query: (body) => ({
        url: '/complaints',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetMyComplaintsQuery,
  useGetComplaintByIdQuery,
  useCreateComplaintMutation,
} = complaintsApi;
