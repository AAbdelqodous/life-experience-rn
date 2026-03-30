# Tasks: Phase 1 — Foundation

**Input**: `specs/master/` — plan.md, spec.md, research.md, data-model.md, contracts/auth-api.md, quickstart.md
**Prerequisites**: All planning artifacts complete ✅

**User Stories**:
- US1: First Launch & Onboarding (P1)
- US2: User Registration (P1)
- US3: User Login (P1)
- US4: Language Selection (P2)
- US5: Session Expiry & Logout (P2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure environment, establish project skeleton.

- [X] T001 Install new dependencies: `npx expo install expo-secure-store @react-native-async-storage/async-storage expo-localization` and `npm install react-i18next i18next @reduxjs/toolkit react-redux react-hook-form zod @hookform/resolvers` — update package.json
- [X] T002 Install test dependencies: `npm install --save-dev jest @testing-library/react-native @testing-library/jest-native` and configure `jest.config.js` at project root
- [X] T003 [P] Create `.env` file at project root with `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1` and add `.env` to `.gitignore`
- [X] T004 [P] Create `app.config.js` at project root (replacing `app.json`) with `extra.apiBaseUrl` reading from `process.env.EXPO_PUBLIC_API_BASE_URL`
- [X] T005 Create `lib/constants/config.ts` — export `API_BASE_URL` from `Constants.expoConfig.extra.apiBaseUrl` with localhost fallback

**Checkpoint**: ✅ Dependencies installed, env config wired.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure all user stories depend on — secure storage, i18n, Redux store, API client. MUST be complete before any user story begins.

- [X] T006 Create `lib/secureStorage.ts` — export `getJwt()`, `setJwt(token: string)`, `deleteJwt()` using `expo-secure-store` with key `auth_jwt`
- [X] T007 Create `lib/i18n/locales/en.json` — English translations for all Phase 1 keys
- [X] T008 Create `lib/i18n/locales/ar.json` — Arabic translations for all Phase 1 keys
- [X] T009 Create `lib/i18n/index.ts` — initialise `i18next` with `react-i18next`, load locales, read persisted locale from `AsyncStorage`, default `'ar'`
- [X] T010 Create `store/authSlice.ts` — Redux slice with `AuthState`, `decodeJwt`, actions: `setSession`, `clearSession`, `setUser`, `setAuthError`
- [X] T011 Create `store/uiSlice.ts` — Redux slice with `UIState`: `locale`, `isRTL`; action: `setLocale`
- [X] T012 Create `store/api/authApi.ts` — RTK Query `createApi`; endpoints: `register`, `login`, `activateAccount`; all typed per contracts
- [X] T013 Create `store/index.ts` — configure Redux store; export `RootState`, `AppDispatch`, typed hooks
- [X] T014 Create `hooks/useAuth.ts` — returns `session`, `user`, `isAuthenticated`, `isSessionExpired()`, `logout()`
- [X] T015 Create `hooks/useLanguage.ts` — returns `locale`, `isRTL`; `switchLanguage()` saves, changes i18n, forces RTL, reloads
- [X] T016 [P] Create `components/ui/AppText.tsx` — RTL-aware Text wrapper
- [X] T017 [P] Create `components/ui/AppButton.tsx` — primary/secondary button with loading state
- [X] T018 Wrap app with Redux `<Provider>` and i18n init in `app/_layout.tsx` — session bootstrap on mount

**Checkpoint**: ✅ Redux + i18n + SecureStore + root layout complete.

---

## Phase 3: User Story 1 — First Launch & Onboarding (Priority: P1) 🎯 MVP

**Goal**: First-time users see 3 onboarding slides, can skip, then reach the auth entry screen. Returning users skip onboarding entirely.

**Independent Test**: Fresh install → onboarding → skip → auth entry. Second launch → no onboarding.

- [X] T019 [US1] Create `components/onboarding/OnboardingSlide.tsx`
- [X] T020 [US1] Create `components/onboarding/OnboardingDots.tsx`
- [X] T021 [US1] Create `app/(onboarding)/_layout.tsx`
- [X] T022 [US1] Create `app/(onboarding)/index.tsx` — 3 slides, skip/next, marks AsyncStorage on complete
- [X] T023 [US1] Update `app/_layout.tsx` — onboarding flag check in bootstrap

**Checkpoint**: ✅ Onboarding flow complete.

---

## Phase 4: User Story 2 — User Registration (Priority: P1)

**Goal**: New user registers, receives OTP, verifies, lands on home.

**Independent Test**: Register → 202 → OTP screen → MailDev code → home.

- [X] T024 [US2] Create `components/auth/AuthInput.tsx`
- [X] T025 [US2] Create `components/auth/PasswordInput.tsx`
- [X] T026 [US2] Create `components/auth/AuthButton.tsx`
- [X] T027 [US2] Create `app/(auth)/_layout.tsx`
- [X] T028 [US2] Create `app/(auth)/index.tsx` — auth entry screen with Sign In / Create Account
- [X] T029 [US2] Create `app/(auth)/register.tsx` — registration form with zod validation
- [X] T030 [US2] Create `components/auth/OtpInput.tsx` — 6-cell OTP input with auto-advance and paste
- [X] T031 [US2] Create `app/(auth)/otp-verify.tsx` — OTP verification, activate + auto-login
- [X] T032 [US2] Create `app/(app)/_layout.tsx` — protected layout with auth guard + expiry check
- [X] T033 [US2] Create `app/(app)/index.tsx` — home placeholder with welcome + logout

**Checkpoint**: ✅ Full registration flow works end-to-end.

---

## Phase 5: User Story 3 — User Login (Priority: P1)

**Goal**: Returning user logs in, session persists across restarts.

**Independent Test**: Login → home. Close/reopen → home (no login prompt).

- [X] T034 [US3] Create `app/(auth)/login.tsx` — login form; handles 200, 302, 303, 304 responses
- [X] T035 [US3] Update `app/_layout.tsx` — decode `exp` from JWT on bootstrap, skip expired tokens
- [X] T036 [US3] `store/authSlice.ts` — `decodeJwt()` extracts `fullName` and `exp` from JWT payload

**Checkpoint**: ✅ Login + session persistence complete.

---

## Phase 6: User Story 4 — Language Selection (Priority: P2)

**Goal**: Switch AR/EN, persists across restarts, RTL/LTR layout.

**Independent Test**: Switch to Arabic → Arabic text + RTL. Restart → Arabic retained.

- [X] T037 [US4] Create `components/ui/LanguageSwitcher.tsx`
- [X] T038 [US4] Add `LanguageSwitcher` to `app/(auth)/index.tsx` (auth entry)
- [X] T039 [US4] Add `LanguageSwitcher` to `app/(app)/index.tsx` (home)
- [X] T040 [US4] All i18n keys complete in `ar.json` and `en.json` — no hardcoded strings

**Checkpoint**: ✅ Language switching wired end-to-end.

---

## Phase 7: User Story 5 — Session Expiry & Logout (Priority: P2)

**Goal**: Expired JWTs redirect to login. Logout clears session.

**Independent Test**: Expired token → launch → login screen with expiry message. Logout → auth entry.

- [X] T041 [US5] Update `app/(app)/_layout.tsx` — check `isSessionExpired()` on focus, redirect with `reason=expired`
- [X] T042 [US5] Update `app/(auth)/index.tsx` — show dismissible expiry banner from `reason` param
- [X] T043 [US5] Verify `useAuth().logout()` — clears JWT, dispatches `clearSession`, navigates to auth

**Checkpoint**: ✅ Session expiry and logout complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T044 [P] Add `__tests__/components/OtpInput.test.tsx`
- [ ] T045 [P] Add `__tests__/components/AuthInput.test.tsx`
- [X] T046 [P] Add `__tests__/components/LanguageSwitcher.test.tsx`
- [X] T047 [P] Add `__tests__/store/authSlice.test.ts`
- [X] T048 Add offline detection to all form screens
- [X] T049 Audit all screens for hardcoded strings
- [X] T050 [P] Add error boundary in `app/_layout.tsx`
- [X] T051 Run quickstart.md testing checklist manually — 21/21 tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user stories**
- **Phase 3 (US1 Onboarding)**: Depends on Phase 2
- **Phase 4 (US2 Registration)**: Depends on Phase 2; builds on Phase 3
- **Phase 5 (US3 Login)**: Depends on Phase 4
- **Phase 6 (US4 Language)**: Depends on Phase 2
- **Phase 7 (US5 Session)**: Depends on Phase 5
- **Phase 8 (Polish)**: Depends on all user story phases

---

## Implementation Strategy

### MVP (US1 + US2 only)
1. Phase 1: Setup ✅
2. Phase 2: Foundational ✅
3. Phase 3: US1 Onboarding ✅
4. Phase 4: US2 Registration ✅
5. **STOP & VALIDATE**: user can register and verify OTP ← current state

### Full Phase 1 ✅ (T001–T043)
US3 Login ✅ → US4 Language ✅ → US5 Session Expiry ✅ → Polish ✅ (T044–T051 all complete)

---

## Notes

- `[P]` = different files, no blocking dependencies
- `[USn]` = traceability label linking task to user story
- Total tasks: **51** | Completed: **43** | Remaining: **8** (Phase 8 polish)
