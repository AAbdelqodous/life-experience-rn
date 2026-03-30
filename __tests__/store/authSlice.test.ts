import authReducer, {
  setSession,
  setUser,
  clearSession,
  setAuthError,
  decodeJwt,
  AuthState,
} from '../../store/authSlice';

// A real-ish JWT with known payload:
// { "sub": "test@example.com", "fullName": "Ahmed Al-Sayed", "exp": 9999999999 }
const MOCK_JWT =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(
    JSON.stringify({
      sub: 'test@example.com',
      fullName: 'Ahmed Al-Sayed',
      exp: 9999999999,
      iat: 1700000000,
    }),
  ).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') +
  '.signature';

const initialState: AuthState = {
  session: null,
  user: null,
  status: 'idle',
  error: null,
};

describe('authSlice', () => {
  describe('setSession', () => {
    it('stores token and expiresAt, clears error', () => {
      const session = { token: 'abc', expiresAt: 9999999999000 };
      const state = authReducer(initialState, setSession(session));
      expect(state.session).toEqual(session);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('stores user info', () => {
      const user = { email: 'a@b.com', firstname: 'Ahmed', lastname: 'Al', fullName: 'Ahmed Al' };
      const state = authReducer(initialState, setUser(user));
      expect(state.user).toEqual(user);
    });
  });

  describe('clearSession', () => {
    it('resets session, user, status and error to initial values', () => {
      const populated: AuthState = {
        session: { token: 'tok', expiresAt: 123 },
        user: { email: 'a@b.com', firstname: 'A', lastname: 'B', fullName: 'A B' },
        status: 'succeeded',
        error: null,
      };
      const state = authReducer(populated, clearSession());
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
    });
  });

  describe('setAuthError', () => {
    it('sets status to failed and stores error message', () => {
      const state = authReducer(initialState, setAuthError('Incorrect credentials'));
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Incorrect credentials');
    });
  });

  describe('decodeJwt', () => {
    it('extracts fullName from JWT payload', () => {
      const { user } = decodeJwt(MOCK_JWT);
      expect(user.fullName).toBe('Ahmed Al-Sayed');
    });

    it('splits fullName into firstname and lastname', () => {
      const { user } = decodeJwt(MOCK_JWT);
      expect(user.firstname).toBe('Ahmed');
      expect(user.lastname).toBe('Al-Sayed');
    });

    it('extracts email from sub claim', () => {
      const { user } = decodeJwt(MOCK_JWT);
      expect(user.email).toBe('test@example.com');
    });

    it('converts exp seconds to milliseconds for expiresAt', () => {
      const { expiresAt } = decodeJwt(MOCK_JWT);
      expect(expiresAt).toBe(9999999999000);
    });

    it('returns expiresAt far in the future for a non-expired token', () => {
      const { expiresAt } = decodeJwt(MOCK_JWT);
      expect(expiresAt).toBeGreaterThan(Date.now());
    });
  });
});
