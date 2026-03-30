import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
}

export function OtpInput({ value, onChange }: OtpInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const [digits, setDigits] = useState<string[]>(
    value.split('').slice(0, OTP_LENGTH).concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH),
  );

  function updateDigits(index: number, char: string) {
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    const code = newDigits.join('');
    onChange(code);
    return newDigits;
  }

  function handleChange(index: number, text: string) {
    // Handle paste — text can be 6 chars
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newDigits = pasted.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
      setDigits(newDigits);
      onChange(newDigits.join(''));
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    updateDigits(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      updateDigits(index - 1, '');
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[styles.cell, digit ? styles.filledCell : null]}
          value={digit}
          onChangeText={(text) => handleChange(index, text)}
          onKeyPress={(e) => handleKeyPress(index, e)}
          keyboardType="numeric"
          maxLength={OTP_LENGTH} // Allow paste of full code into first cell
          selectTextOnFocus
          textAlign="center"
          returnKeyType="done"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
  },
  filledCell: {
    borderColor: '#1A73E8',
    backgroundColor: '#EFF6FF',
  },
});
