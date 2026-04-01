import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { STORAGE_KEY_LANGUAGE } from '../../../lib/i18n';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = async (language: 'en' | 'ar') => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const LanguageOption = ({ language, label }: { language: 'en' | 'ar'; label: string }) => (
    <TouchableOpacity
      style={[styles.languageOption, isRTL && styles.languageOptionRtl]}
      onPress={() => handleLanguageChange(language)}
      activeOpacity={0.7}
    >
      <View style={styles.languageInfo}>
        <AppText style={styles.languageLabel}>{label}</AppText>
      </View>
      {currentLanguage === language && (
        <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('settings.language'),
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
        <LanguageOption language="en" label="English" />
        <LanguageOption language="ar" label="العربية" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  languageOptionRtl: {
    flexDirection: 'row-reverse',
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A2E',
  },
});
