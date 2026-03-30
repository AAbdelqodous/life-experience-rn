// Fix Expo SDK 54 + Jest: pre-polyfill structuredClone so the Expo winter
// runtime's lazy getter never needs to call require('@ungap/structured-clone').
// This must be in setupFiles (runs before jest-expo preset's own setup.js).
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (v) => JSON.parse(JSON.stringify(v));
}

// Fix Expo SDK 54 + Jest: mock NativeSourceCode used by getBundleUrl.native
jest.mock('react-native/Libraries/NativeModules/specs/NativeSourceCode', () => ({
  getConstants: () => ({ scriptURL: 'http://localhost:8081/index.bundle' }),
}));
