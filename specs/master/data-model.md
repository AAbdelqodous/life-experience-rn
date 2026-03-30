# Data Model: Phase 1 — Foundation

**Date**: 2026-03-29

---

## Client-Side Entities

These are the data shapes the mobile app works with. They map to backend API responses but are not identical (no password fields, no internal backend fields).

---

### AuthUser

Represents the currently logged-in user held in Redux state.

```typescript
interface AuthUser {
  email: string;
  firstname: string;
  lastname: string;
  // Derived
  fullName: string; // `${firstname} ${lastname}`
}
```

**Source**: Decoded from JWT `fullName` claim on login. Not stored to disk — reconstructed from JWT on each boot.

---

### Session

Represents the authentication session held in Redux and persisted to SecureStore.

```typescript
interface Session {
  token: string;        // Raw JWT string
  expiresAt: number;    // Unix timestamp ms — decoded from JWT `exp` claim
}
```

**Validation rules**:
- `token`: non-empty string
- `expiresAt`: must be > `Date.now()` to be considered valid

**State transitions**:
```
null (no session)
  → ACTIVE  (login / registration success)
  → EXPIRED (expiresAt < Date.now())
  → null    (logout / token cleared)
```

---

### LanguagePreference

Persisted to AsyncStorage.

```typescript
type Locale = 'ar' | 'en';

interface LanguagePreference {
  locale: Locale;       // Default: 'ar'
  isRTL: boolean;       // true when locale === 'ar'
}
```

---

### OnboardingState

Persisted to AsyncStorage.

```typescript
interface OnboardingState {
  hasSeenOnboarding: boolean;  // Default: false
}
```

---

## Redux State Shape

```typescript
// store/authSlice.ts
interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// store/uiSlice.ts (new in Phase 1)
interface UIState {
  locale: Locale;
  isRTL: boolean;
}
```

---

## API Request / Response Shapes

These match the backend DTOs exactly (see CLAUDE.md).

### RegistrationRequest
```typescript
interface RegistrationRequest {
  firstname: string;    // required, non-empty
  lastname: string;     // required, non-empty
  email: string;        // required, valid email format
  password: string;     // required, min 8 characters
}
```
**Response**: `202 Accepted` (no body — OTP sent via email)

### AuthRequest (Login)
```typescript
interface AuthRequest {
  email: string;
  password: string;
}
```
**Response**: `200 OK`
```typescript
interface AuthResponse {
  token: string;  // JWT
}
```

### ActivateAccountRequest
```typescript
// Query param only — no body
// GET /api/v1/auth/activate-account?token=123456
interface ActivateAccountParams {
  token: string;  // 6-digit numeric OTP
}
```
**Response**: `200 OK` (no body on success)

### ErrorResponse
```typescript
interface ErrorResponse {
  businessErrorCode?: number;
  businessErrorDescription?: string;
  error?: string;
  validationErrors?: string[];
  errors?: Record<string, string>;
}
```

---

## AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  LANGUAGE: '@app/language',           // Locale string: 'ar' | 'en'
  ONBOARDING_SEEN: '@app/onboarding',  // Boolean string: 'true' | 'false'
} as const;
```

---

## SecureStore Keys

```typescript
const SECURE_KEYS = {
  JWT: 'auth_jwt',  // Raw JWT string
} as const;
```
