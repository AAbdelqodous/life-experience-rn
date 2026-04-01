import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, View } from 'react-native';
import { AppText } from '../../../components/ui/AppText';

interface NotificationPreferences {
  bookingUpdates: boolean;
  newMessages: boolean;
  promotions: boolean;
  systemNotifications: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  bookingUpdates: true,
  newMessages: true,
  promotions: false,
  systemNotifications: true,
};

const STORAGE_KEY = 'notification_prefs';

export default function NotificationSettingsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  const ToggleRow = ({
    label,
    value,
    onToggle,
  }: {
    label: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={[styles.toggleRow, isRTL && styles.toggleRowRtl]}>
      <AppText style={styles.toggleLabel}>{label}</AppText>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
        thumbColor={value ? '#fff' : '#fff'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('settings.notifications'),
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1A1A2E',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <View style={styles.container}>
        <View style={styles.section}>
          <ToggleRow
            label={t('settings.bookingUpdates')}
            value={preferences.bookingUpdates}
            onToggle={(value) => savePreferences({ ...preferences, bookingUpdates: value })}
          />
          <ToggleRow
            label={t('settings.newMessages')}
            value={preferences.newMessages}
            onToggle={(value) => savePreferences({ ...preferences, newMessages: value })}
          />
          <ToggleRow
            label={t('settings.promotions')}
            value={preferences.promotions}
            onToggle={(value) => savePreferences({ ...preferences, promotions: value })}
          />
          <ToggleRow
            label={t('settings.systemNotifications')}
            value={preferences.systemNotifications}
            onToggle={(value) => savePreferences({ ...preferences, systemNotifications: value })}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  toggleRowRtl: {
    flexDirection: 'row-reverse',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1A1A2E',
  },
});
