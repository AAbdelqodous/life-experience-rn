import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { clearSession } from '../store/authSlice';
import { deleteJwt } from '../lib/secureStorage';

export function useAuth() {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.auth.session);
  const user = useAppSelector((state) => state.auth.user);

  const isAuthenticated = session !== null && session.expiresAt > Date.now();

  const isSessionExpired = useCallback((): boolean => {
    if (!session) return false;
    return session.expiresAt <= Date.now();
  }, [session]);

  const logout = useCallback(async () => {
    await deleteJwt();
    dispatch(clearSession());
  }, [dispatch]);

  return { session, user, isAuthenticated, isSessionExpired, logout };
}
