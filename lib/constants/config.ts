import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
