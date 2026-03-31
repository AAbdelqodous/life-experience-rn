import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface CentersFilterState {
  categoryId?: number;
  city?: string;
  area?: string;
  searchQuery?: string;
  minRating?: number;
  isVerified?: boolean;
  isOpen?: boolean;
  sortBy?: 'rating' | 'distance' | 'name' | 'reviews';
  sortOrder?: 'asc' | 'desc';
}

interface CentersState {
  filters: CentersFilterState;
  selectedCenterId: number | null;
  recentSearches: string[];
}

// ── Initial state ───────────────────────────────────────────────────────────────

const initialState: CentersState = {
  filters: {
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  selectedCenterId: null,
  recentSearches: [],
};

// ── Slice ───────────────────────────────────────────────────────────────────────

const centersSlice = createSlice({
  name: 'centers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CentersFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'rating',
        sortOrder: 'desc',
      };
    },
    setSelectedCenterId: (state, action: PayloadAction<number | null>) => {
      state.selectedCenterId = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (!query) return;

      // Remove if already exists
      state.recentSearches = state.recentSearches.filter((s) => s !== query);
      // Add to front
      state.recentSearches.unshift(query);
      // Keep only last 10
      state.recentSearches = state.recentSearches.slice(0, 10);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter((s) => s !== action.payload);
    },
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedCenterId,
  addRecentSearch,
  clearRecentSearches,
  removeRecentSearch,
} = centersSlice.actions;

export default centersSlice.reducer;
