import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
}

export interface Session {
  token: string;
  expiresAt: number; // Unix timestamp ms
}

export interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  user: null,
  status: 'idle',
  error: null,
};

/**
 * Decodes the JWT payload (base64) to extract user info and expiry.
 * Does NOT verify the signature — server handles that.
 */
export function decodeJwt(token: string): { user: AuthUser; expiresAt: number } {
  const [, payload] = token.split('.');
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

  const fullName: string = decoded.fullName ?? '';
  const parts = fullName.trim().split(' ');
  const firstname = parts[0] ?? '';
  const lastname = parts.slice(1).join(' ');

  return {
    user: {
      email: decoded.sub ?? '',
      firstname,
      lastname,
      fullName,
    },
    expiresAt: (decoded.exp as number) * 1000, // Convert seconds → ms
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearSession(state) {
      state.session = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { setSession, setUser, clearSession, setAuthError } = authSlice.actions;
export default authSlice.reducer;
