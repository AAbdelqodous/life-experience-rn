import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface ChatFilterState {
  unreadOnly?: boolean;
  sortBy?: 'date' | 'unread';
  sortOrder?: 'asc' | 'desc';
}

interface ChatState {
  filters: ChatFilterState;
  activeConversationId: number | null;
  unreadConversationsCount: number;
}

// ── Initial state ───────────────────────────────────────────────────────────────

const initialState: ChatState = {
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
  },
  activeConversationId: null,
  unreadConversationsCount: 0,
};

// ── Slice ───────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatFilters: (state, action: PayloadAction<Partial<ChatFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearChatFilters: (state) => {
      state.filters = {
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
    setActiveConversationId: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
    },
    setUnreadConversationsCount: (state, action: PayloadAction<number>) => {
      state.unreadConversationsCount = action.payload;
    },
    incrementUnreadConversations: (state) => {
      state.unreadConversationsCount = Math.min(
        state.unreadConversationsCount + 1,
        999 // Reasonable upper bound
      );
    },
    decrementUnreadConversations: (state) => {
      state.unreadConversationsCount = Math.max(0, state.unreadConversationsCount - 1);
    },
    clearUnreadConversations: (state) => {
      state.unreadConversationsCount = 0;
    },
  },
});

export const {
  setChatFilters,
  clearChatFilters,
  setActiveConversationId,
  setUnreadConversationsCount,
  incrementUnreadConversations,
  decrementUnreadConversations,
  clearUnreadConversations,
} = chatSlice.actions;

export default chatSlice.reducer;
