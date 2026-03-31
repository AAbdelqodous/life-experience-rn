import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationPriority, NotificationType } from './api/notificationsApi';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface NotificationsFilterState {
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  sortBy?: 'date' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

interface NotificationsState {
  filters: NotificationsFilterState;
  unreadCount: number;
  lastReadTimestamp: number | null;
}

// ── Initial state ───────────────────────────────────────────────────────────────

const initialState: NotificationsState = {
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
  },
  unreadCount: 0,
  lastReadTimestamp: null,
};

// ── Slice ───────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsFilters: (state, action: PayloadAction<Partial<NotificationsFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearNotificationsFilters: (state) => {
      state.filters = {
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
      state.lastReadTimestamp = Date.now();
    },
    setLastReadTimestamp: (state, action: PayloadAction<number>) => {
      state.lastReadTimestamp = action.payload;
    },
  },
});

export const {
  setNotificationsFilters,
  clearNotificationsFilters,
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  markAllAsRead,
  setLastReadTimestamp,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
