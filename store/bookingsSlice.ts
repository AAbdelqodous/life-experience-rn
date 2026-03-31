import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookingStatus, ServiceType } from './api/bookingsApi';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface BookingFilterState {
  status?: BookingStatus;
  serviceType?: ServiceType;
  centerId?: number;
  sortBy?: 'date' | 'status' | 'price';
  sortOrder?: 'asc' | 'desc';
}

interface BookingsState {
  filters: BookingFilterState;
  selectedBookingId: number | null;
  activeBookingStep: number; // For booking flow: 0=service, 1=date, 2=confirm
}

// ── Initial state ───────────────────────────────────────────────────────────────

const initialState: BookingsState = {
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
  },
  selectedBookingId: null,
  activeBookingStep: 0,
};

// ── Slice ───────────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookingFilters: (state, action: PayloadAction<Partial<BookingFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBookingFilters: (state) => {
      state.filters = {
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
    setSelectedBookingId: (state, action: PayloadAction<number | null>) => {
      state.selectedBookingId = action.payload;
    },
    setActiveBookingStep: (state, action: PayloadAction<number>) => {
      state.activeBookingStep = action.payload;
    },
    resetBookingFlow: (state) => {
      state.activeBookingStep = 0;
      state.selectedBookingId = null;
    },
  },
});

export const {
  setBookingFilters,
  clearBookingFilters,
  setSelectedBookingId,
  setActiveBookingStep,
  resetBookingFlow,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
