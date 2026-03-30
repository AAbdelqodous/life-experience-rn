# Quickstart: Phase 1 — Foundation

**Date**: 2026-03-29

A reference for implementing Phase 1. Read alongside `plan.md` and `data-model.md`.

---

## New Dependencies to Install

```bash
npx expo install expo-secure-store @react-native-async-storage/async-storage
npx expo install expo-localization
npm install react-i18next i18next
npm install @reduxjs/toolkit react-redux
npm install react-hook-form zod @hookform/resolvers
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

---

## Key Patterns

### 1. Session Bootstrap (Root Layout)

```tsx
// app/_layout.tsx
// On mount: read JWT from SecureStore → dispatch to Redux → Expo Router handles redirect
```

The root layout runs before any screen renders. It:
1. Reads JWT from `expo-secure-store`
2. If valid (non-expired): dispatches `setSession()` to Redux → `(app)/` group renders
3. If none/expired: checks AsyncStorage `hasSeenOnboarding`
4. Routes to `(onboarding)/` or `(auth)/` accordingly

### 2. RTK Query Auth Endpoints

```typescript
// store/api/authApi.ts
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    register: builder.mutation<void, RegistrationRequest>({...}),
    login: builder.mutation<AuthResponse, AuthRequest>({...}),
    activateAccount: builder.query<void, string>({...}), // token param
  }),
});
```

### 3. i18n Setup

```typescript
// lib/i18n/index.ts
i18next
  .use(initReactI18next)
  .init({
    resources: { ar: { translation: arTranslations }, en: { translation: enTranslations } },
    lng: storedLocale ?? 'ar',   // Arabic default
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
```

All translation keys follow dot notation: `auth.login.title`, `auth.register.emailLabel`, `errors.noInternet`, etc.

### 4. Language Switching

Language switch → saves to AsyncStorage → calls `i18n.changeLanguage()` → `I18nManager.forceRTL(isArabic)` → app reloads (required for RN RTL engine).

```typescript
// hooks/useLanguage.ts
const switchLanguage = async (locale: Locale) => {
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, locale);
  await i18n.changeLanguage(locale);
  I18nManager.forceRTL(locale === 'ar');
  // Reload to apply RTL to native layout engine
  await Updates.reloadAsync(); // or RNRestart.Restart()
};
```

### 5. OTP Input UX

- 6 `TextInput` cells, each accepting one digit
- Auto-focus next cell on digit entry
- Auto-focus previous cell on backspace
- Paste handler splits 6-digit string across all cells
- `keyboardType="numeric"`, `maxLength={1}` per cell

### 6. Form Validation with Zod

```typescript
const registerSchema = z.object({
  firstname: z.string().min(1, 'required'),
  lastname: z.string().min(1, 'required'),
  email: z.string().email('invalidEmail'),
  password: z.string().min(8, 'passwordTooShort'),
});
```

Error message values are i18n keys — resolved to translated strings at render time.

---

## File Creation Order

Follow this order to avoid import errors:

1. `lib/constants/config.ts` — API_BASE_URL
2. `lib/secureStorage.ts` — JWT helpers
3. `lib/i18n/` — i18next init + translation JSONs
4. `store/authSlice.ts` + `store/api/authApi.ts` + `store/index.ts`
5. `hooks/useAuth.ts` + `hooks/useLanguage.ts`
6. `components/ui/` — AppText, AppButton, LanguageSwitcher
7. `components/auth/` — AuthInput, PasswordInput, OtpInput, AuthButton
8. `components/onboarding/` — OnboardingSlide, OnboardingDots
9. `app/_layout.tsx` — root layout with session bootstrap
10. `app/(onboarding)/` — onboarding screens
11. `app/(auth)/` — auth screens
12. `app/(app)/_layout.tsx` — protected layout with auth guard
13. `__tests__/` — component and slice tests

---

## Environment Setup

Create `.env` in project root (gitignored):
```
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1
```

Reference in `app.config.js`:
```javascript
extra: {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
}
```

Access in code:
```typescript
// lib/constants/config.ts
import Constants from 'expo-constants';
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:8080/api/v1';
```

---

## Testing Checklist

Before marking Phase 1 complete, verify:

- [ ] Fresh install → onboarding appears
- [ ] Skip onboarding → auth entry screen
- [ ] Relaunch after onboarding → no onboarding shown
- [ ] Register with valid data → 202 → OTP screen
- [ ] Enter correct OTP → account activated → home screen
- [ ] Enter wrong OTP → error shown, retry available
- [ ] Login with valid credentials → home screen
- [ ] Login with wrong credentials → error message in active language
- [ ] Login with unverified account → redirected to OTP screen
- [ ] Close app after login → reopen → straight to home (session persisted)
- [ ] Wait for token expiry (or manually invalidate) → redirect to login
- [ ] Log out → auth entry screen, SecureStore cleared
- [ ] Switch to Arabic → all text in Arabic, RTL layout
- [ ] Switch to English → all text in English, LTR layout
- [ ] Restart after Arabic → Arabic still active
- [ ] All 5 screens render without console errors in both locales
