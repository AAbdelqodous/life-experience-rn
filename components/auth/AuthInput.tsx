import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../../hooks/useLanguage';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, value, ...props }: AuthInputProps) {
  const { isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isRTL && styles.rtlText]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isRTL && styles.rtlInput,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor="#9CA3AF"
        textAlign={isRTL ? 'right' : 'left'}
        value={value ?? ''}
        {...props}
      />
      {error ? (
        <Text style={[styles.errorText, isRTL && styles.rtlText]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  rtlText: {
    textAlign: 'right',
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  rtlInput: {
    textAlign: 'right',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
