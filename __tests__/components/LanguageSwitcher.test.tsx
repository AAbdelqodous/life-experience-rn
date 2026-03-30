import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockSwitchLanguage = jest.fn();

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    locale: 'ar',
    isRTL: true,
    switchLanguage: mockSwitchLanguage,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'language.switchTo': 'English',
        'language.current': 'ع',
      };
      return translations[key] ?? key;
    },
  }),
}));

import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockSwitchLanguage.mockClear();
  });

  it('displays the switchTo label from i18n', () => {
    const { getByText } = render(<LanguageSwitcher />);
    expect(getByText('English')).toBeTruthy();
  });

  it('calls switchLanguage with "en" when current locale is "ar"', () => {
    const { getByText } = render(<LanguageSwitcher />);
    fireEvent.press(getByText('English'));
    expect(mockSwitchLanguage).toHaveBeenCalledWith('en');
  });

  it('calls switchLanguage with "en" when locale is "ar" (toggle logic)', () => {
    // The module-level mock sets locale to 'ar', so pressing should call switchLanguage('en')
    const { getByText } = render(<LanguageSwitcher />);
    fireEvent.press(getByText('English'));
    // Already verified in the previous test; confirming it was called with 'en'
    expect(mockSwitchLanguage).toHaveBeenCalledWith('en');
  });
});
