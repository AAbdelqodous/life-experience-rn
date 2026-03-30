import { useCallback } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useAppDispatch, useAppSelector } from '../store';
import { setLocale } from '../store/uiSlice';
import i18n, { STORAGE_KEY_LANGUAGE, type Locale } from '../lib/i18n';

export function useLanguage() {
  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.ui.locale);
  const isRTL = useAppSelector((state) => state.ui.isRTL);

  const switchLanguage = useCallback(
    async (newLocale: Locale) => {
      await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, newLocale);
      await i18n.changeLanguage(newLocale);
      dispatch(setLocale(newLocale));
      I18nManager.forceRTL(newLocale === 'ar');
      // Reload required so the layout engine applies RTL
      if (Platform.OS === 'web') {
        window.location.reload();
      } else {
        await Updates.reloadAsync();
      }
    },
    [dispatch],
  );

  return { locale, isRTL, switchLanguage };
}
