import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

// 10.0.2.2 is Android emulator's alias for host localhost — unusable in a browser.
// On web, rewrite it to localhost so the browser can reach the dev server.
function resolveApiUrl(url: string | undefined): string {
  const base = url ?? 'http://localhost:8080/api/v1';
  if (Platform.OS === 'web') {
    return base.replace('10.0.2.2', 'localhost');
  }
  return base;
}

export const API_BASE_URL: string = resolveApiUrl(configuredUrl);

// WebSocket URL - converts http:// to ws:// and https:// to wss://
function resolveWebSocketUrl(apiUrl: string): string {
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  // Remove /api/v1 suffix if present for WebSocket endpoint
  return wsUrl.replace(/\/api\/v1$/, '');
}

export const WS_BASE_URL: string = resolveWebSocketUrl(API_BASE_URL);
