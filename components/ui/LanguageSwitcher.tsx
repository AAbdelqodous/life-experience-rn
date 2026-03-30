import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { locale, switchLanguage } = useLanguage();
  const { t } = useTranslation();

  function handlePress() {
    switchLanguage(locale === 'ar' ? 'en' : 'ar');
  }

  return (
    <Pressable style={styles.button} onPress={handlePress} hitSlop={8}>
      <Text style={styles.text}>{t('language.switchTo')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1A73E8',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A73E8',
  },
});
