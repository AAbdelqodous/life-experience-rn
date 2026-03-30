import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Locale } from '../lib/i18n';

export interface UIState {
  locale: Locale;
  isRTL: boolean;
}

const initialState: UIState = {
  locale: 'ar',
  isRTL: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
      state.isRTL = action.payload === 'ar';
    },
  },
});

export const { setLocale } = uiSlice.actions;
export default uiSlice.reducer;
