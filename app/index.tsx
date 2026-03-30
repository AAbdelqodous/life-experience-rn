// Root index — the actual routing is handled by app/_layout.tsx bootstrap logic.
// This file exists only to satisfy Expo Router's route requirements.
// Bootstrap in _layout.tsx replaces this route before it renders.
export { default } from './(auth)/index';
