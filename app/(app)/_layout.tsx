import React, { useEffect } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function AppLayout() {
  const { isAuthenticated, isSessionExpired, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isSessionExpired()) {
      logout().then(() => {
        router.replace({ pathname: '/(auth)/', params: { reason: 'expired' } });
      });
    } else if (!isAuthenticated) {
      router.replace('/(auth)/');
    }
  }, [pathname, isAuthenticated, isSessionExpired, logout]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
