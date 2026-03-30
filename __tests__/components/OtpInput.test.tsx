import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OtpInput } from '../../components/auth/OtpInput';

// Mock hooks used by OtpInput (none directly, but transitive deps need mocking)
jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => ({ isRTL: false, locale: 'en', switchLanguage: jest.fn() }),
}));

describe('OtpInput', () => {
  it('renders 6 input cells', () => {
    const onChange = jest.fn();
    const { getAllByDisplayValue, UNSAFE_getAllByType } = render(
      <OtpInput value="" onChange={onChange} />,
    );
    // 6 TextInputs with empty value
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    expect(inputs).toHaveLength(6);
  });

  it('calls onChange with current digits when a digit is entered', () => {
    const onChange = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <OtpInput value="" onChange={onChange} />,
    );
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '3');
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^3/));
  });

  it('handles paste of 6-digit string across all cells', () => {
    const onChange = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <OtpInput value="" onChange={onChange} />,
    );
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '123456');
    expect(onChange).toHaveBeenCalledWith('123456');
  });

  it('calls onChange with partial string when fewer than 6 digits entered', () => {
    const onChange = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <OtpInput value="" onChange={onChange} />,
    );
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    // onChange called twice, last call should start with '12'
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as string;
    expect(lastCall.startsWith('12')).toBe(true);
  });
});
