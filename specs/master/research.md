# Research: Phase 1 — Foundation

**Date**: 2026-03-29
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 1. JWT Secure Storage

**Decision**: `expo-secure-store`
**Rationale**: Native encrypted storage backed by Keychain (iOS) and Android Keystore. Available in Expo managed workflow without ejecting. Synchronous API is acceptable for auth bootstrap. 2048-byte value limit is sufficient for JWTs.
**Alternatives considered**:
- `AsyncStorage` — rejected: plaintext, not suitable for tokens (security principle VI)
- `react-native-keychain` — rejected: requires bare workflow / native module linking
- `mmkv` with encryption — rejected: overkill, adds native dependency

---

## 2. i18n Library

**Decision**: `react-i18next` + `i18next`
**Rationale**: Most mature i18n library for React/RN; supports namespaces, lazy loading, RTL detection hooks. Works natively with React 19. `expo-localization` provides the device locale for initial language detection.
**Alternatives considered**:
- `react-native-i18n` — rejected: unmaintained
- `lingui` — rejected: less community support in RN ecosystem
- Manual translation objects — rejected: doesn't scale past ~20 keys, no pluralization

---

## 3. RTL Layout Strategy

**Decision**: Use React Native's built-in `I18nManager.forceRTL()` + NativeWind `dir` prop + `useRTL` hook
**Rationale**: React Native has native RTL support via `I18nManager`. NativeWind 4 supports `dir="rtl"` on View components. A root `useLanguage` hook wraps this and propagates direction to the layout tree.
**Key constraint**: `I18nManager.forceRTL()` requires an app reload to take full effect on Android. Strategy: save language to storage → reload app via `expo-updates` or navigate to a "reloading" splash.
**Alternatives considered**:
- CSS `direction: rtl` only — rejected: doesn't flip RN layout engine (Yoga)
- Separate AR/EN component trees — rejected: violates DRY, doubles maintenance burden

---

## 4. OTP Input Component

**Decision**: Custom `OtpInput` component — 6 individual `TextInput` cells, auto-advance on digit entry
**Rationale**: No maintained library covers all RN versions + Expo + NativeWind. A 6-cell custom component is ~80 lines, fully testable, and matches backend's 6-digit numeric token exactly.
**Alternatives considered**:
- `react-native-otp-entry` — evaluated: OK but adds dependency, harder to style with NativeWind
- Single `TextInput` with `maxLength=6` — rejected: poor UX, hard to style as individual cells

---

## 5. Session Bootstrap (App Launch Routing)

**Decision**: Root `_layout.tsx` reads secure storage synchronously on mount → dispatches to Redux → Expo Router redirects based on `authSlice` state
**Rationale**: Expo Router's `<Redirect>` component and `router.replace()` provide clean declarative redirects. Reading from SecureStore on root mount (before any screen renders) avoids flash of wrong screen.
**Flow**:
```
App launches
  → root _layout reads SecureStore for JWT
  → if JWT exists & not expired → redirect to (app)/
  → if no JWT → check AsyncStorage for onboarding flag
      → if not seen → redirect to (onboarding)/
      → if seen → redirect to (auth)/
```
**Alternatives considered**:
- Context-based auth provider — rejected: adds indirection; Redux slice is simpler and already required
- Checking expiry client-side — accepted: JWT `exp` claim is decoded client-side to avoid unnecessary API calls; server re-validates on first protected request

---

## 6. API Base URL Configuration

**Decision**: `.env` file + `expo-constants` (`app.config.js` extra)
**Rationale**: Expo's `extra` field in `app.config.js` injects env vars at build time, accessible via `Constants.expoConfig.extra`. No native module required. Works in Expo Go and production builds.
**Dev value**: `http://localhost:8080/api/v1` (Spring Boot backend on local machine)
**Android emulator value**: `http://10.0.2.2:8080/api/v1` (Android emulator loopback)
**Alternatives considered**:
- `react-native-config` — rejected: requires bare workflow
- Hardcoding — rejected: violates security principle VI

---

## 7. Form Validation

**Decision**: `react-hook-form` + `zod` schemas
**Rationale**: react-hook-form is the de-facto standard for RN forms; minimal re-renders; zod provides type-safe schema validation that aligns with TypeScript. Both are lightweight and well-maintained.
**Alternatives considered**:
- `formik` — rejected: more verbose, slower re-render model
- Manual `useState` validation — rejected: doesn't scale, error-prone

---

## 8. Testing Strategy (Phase 1)

**Decision**: Jest + React Native Testing Library (RNTL) for unit/component tests
**Rationale**: Already part of Expo's default test setup. RNTL encourages testing by user behavior, not implementation. E2E (Detox/Maestro) is deferred — not needed for Phase 1 foundation validation.
**Coverage targets**: OtpInput, AuthInput, LanguageSwitcher components + authSlice reducers
**Alternatives considered**:
- Detox E2E now — deferred: setup overhead high; unit coverage sufficient for Phase 1
