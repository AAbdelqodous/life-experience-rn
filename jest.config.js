module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    // Fix Expo SDK 54 + Jest: stub the entire winter runtime package to prevent
    // it from loading native-only modules (NativeSourceCode, dynamic import, etc.)
    '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter.js',
    '^expo/src/winter/runtime': '<rootDir>/__mocks__/expo-winter-runtime.js',
    '@ungap/structured-clone': '<rootDir>/__mocks__/structured-clone.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@reduxjs/toolkit|immer|react-i18next|i18next|@ungap/structured-clone)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/specs/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
