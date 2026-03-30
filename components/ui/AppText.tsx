import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useLanguage } from '../../hooks/useLanguage';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

export function AppText({ children, style, ...props }: AppTextProps) {
  const { isRTL } = useLanguage();

  return (
    <Text
      style={[styles.base, isRTL && styles.rtl, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    writingDirection: 'auto',
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
