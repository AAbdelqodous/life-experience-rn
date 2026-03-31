import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText } from './AppText';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: () => void;
  showClearButton?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  onClear,
  onSubmit,
  showClearButton = true,
}: SearchBarProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, isFocused && styles.focused]}>
      <AppText style={styles.searchIcon}>🔍</AppText>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || t('search.placeholder')}
        placeholderTextColor="#9E9E9E"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {showClearButton && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <AppText style={styles.clearIcon}>✕</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: '#2196F3',
    backgroundColor: '#fff',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9E9E9E',
  },
});
