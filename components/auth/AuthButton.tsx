import React from 'react';
import { StyleSheet } from 'react-native';
import { AppButton } from '../ui/AppButton';
import type { PressableProps } from 'react-native';

interface AuthButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function AuthButton({ title, loading, disabled, variant = 'primary', ...props }: AuthButtonProps) {
  return (
    <AppButton
      title={title}
      loading={loading}
      disabled={disabled}
      variant={variant}
      style={styles.button}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginTop: 8,
  },
});
