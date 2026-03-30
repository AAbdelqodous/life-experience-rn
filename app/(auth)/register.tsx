import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { AppText } from '../../components/ui/AppText';
import { useRegisterMutation } from '../../store/api/authApi';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const registerSchema = z.object({
  firstname: z.string().min(1, 'errors.required'),
  lastname: z.string().min(1, 'errors.required'),
  email: z.string().email('errors.invalidEmail'),
  password: z.string().min(8, 'errors.passwordTooShort'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { isConnected } = useNetworkStatus();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    if (!isConnected) {
      setError('root', { message: t('errors.noInternet') });
      return;
    }
    try {
      await register(data).unwrap();
      router.push({ pathname: '/(auth)/otp-verify', params: { email: data.email } });
    } catch (err: unknown) {
      const apiError = err as { data?: { validationErrors?: string[]; error?: string } };
      if (apiError?.data?.validationErrors?.length) {
        setError('root', { message: apiError.data.validationErrors.join(', ') });
      } else {
        setError('root', { message: t('errors.serverError') });
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <AppText style={styles.title}>{t('auth.register.title')}</AppText>

        {errors.root && (
          <View style={styles.errorBanner}>
            <AppText style={styles.errorBannerText}>{errors.root.message}</AppText>
          </View>
        )}

        <Controller
          control={control}
          name="firstname"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('auth.register.firstnameLabel')}
              placeholder={t('auth.register.firstnamePlaceholder')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.firstname ? t(errors.firstname.message!) : undefined}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="lastname"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('auth.register.lastnameLabel')}
              placeholder={t('auth.register.lastnamePlaceholder')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.lastname ? t(errors.lastname.message!) : undefined}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('auth.register.emailLabel')}
              placeholder={t('auth.register.emailPlaceholder')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.email ? t(errors.email.message!) : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label={t('auth.register.passwordLabel')}
              placeholder={t('auth.register.passwordPlaceholder')}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password ? t(errors.password.message!) : undefined}
              autoComplete="new-password"
            />
          )}
        />

        <AuthButton
          title={t('auth.register.submitButton')}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        />

        <View style={styles.footer}>
          <AppText style={styles.footerText}>{t('auth.register.alreadyHaveAccount')}</AppText>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <AppText style={styles.link}>{t('auth.register.signInLink')}</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#991B1B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  link: {
    fontSize: 14,
    color: '#1A73E8',
    fontWeight: '600',
  },
});
