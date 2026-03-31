import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { authApi } from './api/authApi';
import { bookingsApi } from './api/bookingsApi';
import { centersApi } from './api/centersApi';
import { chatApi } from './api/chatApi';
import { complaintsApi } from './api/complaintsApi';
import { favoritesApi } from './api/favoritesApi';
import { notificationsApi } from './api/notificationsApi';
import { profileApi } from './api/profileApi';
import { reviewsApi } from './api/reviewsApi';
import authReducer from './authSlice';
import bookingsReducer from './bookingsSlice';
import centersReducer from './centersSlice';
import chatReducer from './chatSlice';
import favoritesReducer from './favoritesSlice';
import notificationsReducer from './notificationsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    centers: centersReducer,
    bookings: bookingsReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    [authApi.reducerPath]: authApi.reducer,
    [centersApi.reducerPath]: centersApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [favoritesApi.reducerPath]: favoritesApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [complaintsApi.reducerPath]: complaintsApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      centersApi.middleware,
      bookingsApi.middleware,
      reviewsApi.middleware,
      favoritesApi.middleware,
      notificationsApi.middleware,
      chatApi.middleware,
      complaintsApi.middleware,
      profileApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
