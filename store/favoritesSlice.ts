import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface FavoritesFilterState {
  sortBy?: 'date' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface FavoritesState {
  filters: FavoritesFilterState;
  favoriteCenterIds: number[]; // Local cache of favorite center IDs
}

// ── Initial state ───────────────────────────────────────────────────────────────

const initialState: FavoritesState = {
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
  },
  favoriteCenterIds: [],
};

// ── Slice ───────────────────────────────────────────────────────────────────────

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavoritesFilters: (state, action: PayloadAction<Partial<FavoritesFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFavoritesFilters: (state) => {
      state.filters = {
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
    addToFavorites: (state, action: PayloadAction<number>) => {
      if (!state.favoriteCenterIds.includes(action.payload)) {
        state.favoriteCenterIds.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.favoriteCenterIds = state.favoriteCenterIds.filter(id => id !== action.payload);
    },
    setFavoriteCenterIds: (state, action: PayloadAction<number[]>) => {
      state.favoriteCenterIds = action.payload;
    },
  },
});

export const {
  setFavoritesFilters,
  clearFavoritesFilters,
  addToFavorites,
  removeFromFavorites,
  setFavoriteCenterIds,
} = favoritesSlice.actions;

// Selector to check if a center is in favorites
export const selectIsFavorite = createSelector(
  [(state: { favorites: FavoritesState }) => state.favorites.favoriteCenterIds, (_: { favorites: FavoritesState }, centerId: number) => centerId],
  (favoriteIds: number[], centerId: number) => favoriteIds.includes(centerId)
);

export default favoritesSlice.reducer;
