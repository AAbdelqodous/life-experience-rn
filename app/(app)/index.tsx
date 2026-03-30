import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LanguageSwitcher />
      </View>
      <View style={styles.content}>
        <AppText style={styles.welcome}>
          {t('home.welcome', { name: user?.fullName ?? '' })}
        </AppText>
      </View>
      <AppButton
        title={t('home.logout')}
        variant="secondary"
        onPress={logout}
        style={styles.logoutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 56,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A2E',
  },
  logoutBtn: {
    marginBottom: 16,
  },
});
