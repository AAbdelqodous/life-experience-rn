import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthInput } from './AuthInput';
import type { TextInputProps } from 'react-native';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <AuthInput
        label={label}
        error={error}
        secureTextEntry={!visible}
        style={[{ paddingRight: 48 }, style]}
        {...props}
      />
      <Pressable
        style={styles.iconButton}
        onPress={() => setVisible((v) => !v)}
        hitSlop={8}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#6B7280"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    position: 'absolute',
    right: 14,
    bottom: 28,
  },
});
