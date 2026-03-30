import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ar from './locales/ar.json';

export const STORAGE_KEY_LANGUAGE = '@app/language';
export type Locale = 'ar' | 'en';
export const DEFAULT_LOCALE: Locale = 'ar';

export async function getStoredLocale(): Promise<Locale> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {}
  return DEFAULT_LOCALE;
}

export async function initI18n(): Promise<void> {
  const locale = await getStoredLocale();

  await i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: locale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18next;
