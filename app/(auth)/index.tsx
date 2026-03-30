import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

export default function AuthEntryScreen() {
  const { t } = useTranslation();
  const { reason } = useLocalSearchParams<{ reason?: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.langRow}>
        <LanguageSwitcher />
      </View>

      {reason === 'expired' && (
        <View style={styles.banner}>
          <AppText style={styles.bannerText}>{t('errors.sessionExpired')}</AppText>
        </View>
      )}

      <View style={styles.hero}>
        <View style={styles.logoPlaceholder} />
        <AppText style={styles.title}>{t('auth.entry.title')}</AppText>
        <AppText style={styles.subtitle}>{t('auth.entry.subtitle')}</AppText>
      </View>

      <View style={styles.buttons}>
        <AppButton
          title={t('auth.entry.signIn')}
          onPress={() => router.push('/(auth)/login')}
        />
        <AppButton
          title={t('auth.entry.createAccount')}
          variant="secondary"
          onPress={() => router.push('/(auth)/register')}
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  langRow: {
    marginTop: 56,
    alignItems: 'flex-end',
  },
  banner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  bannerText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6F4FE',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttons: {
    gap: 12,
  },
  secondaryBtn: {
    marginTop: 0,
  },
});
