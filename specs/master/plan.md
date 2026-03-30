# Implementation Plan: Phase 1 — Foundation

**Branch**: `master` | **Date**: 2026-03-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/master/spec.md`

---

## Summary

Phase 1 establishes the full foundation of the React Native customer app: navigation shell, onboarding flow, user authentication (register → OTP → login), JWT session management, bilingual support (Arabic RTL / English LTR), and secure storage. All subsequent phases depend on this foundation being correct. The implementation uses Expo Router for file-based navigation, Redux Toolkit + RTK Query for state and API calls, react-i18next for localization, and expo-secure-store for encrypted JWT storage.

---

## Technical Context

**Language/Version**: TypeScript 5.9, React Native 0.81.5, React 19.1
**Primary Dependencies**: Expo 54, Expo Router 6, NativeWind 4, Redux Toolkit, RTK Query, react-i18next, expo-secure-store, expo-async-storage
**Storage**: expo-secure-store (JWT), AsyncStorage via @react-native-async-storage (preferences: language, onboarding flag)
**Testing**: Jest + React Native Testing Library (unit/component), Detox (E2E — deferred to later phase)
**Target Platform**: iOS 16+, Android API 28+ (Android 9+)
**Project Type**: Mobile app (Expo managed workflow)
**Performance Goals**: Login flow completes in < 30s; language switch renders in < 300ms; app cold start < 3s on mid-range Android
**Constraints**: Offline-capable onboarding; JWT stored encrypted; zero hardcoded UI strings; RTL layout for Arabic
**Scale/Scope**: Phase 1 = 5 screens; full app ~30 screens across 7 phases

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Spec-Driven | Spec written and approved before this plan | ✅ PASS |
| II. Bilingual First | All 5 screens will use i18n keys; RTL/LTR layouts planned | ✅ PASS |
| III. Component-Driven UI | Screens decomposed into reusable components; NativeWind for styling | ✅ PASS |
| IV. API Contract Adherence | RTK Query endpoints typed against backend contract; base URL from env config | ✅ PASS |
| V. Offline-Awareness | Onboarding is local-only; auth forms show "no connection" when offline | ✅ PASS |
| VI. Security & Privacy | JWT in expo-secure-store; no PII logged; session cleared on logout/expiry | ✅ PASS |

**Gate result**: ALL PASS — proceed to Phase 0.

---

## Project Structure

### Documentation (this feature)

```text
specs/master/
├── spec.md          ✅ Phase 1 feature specification
├── plan.md          ✅ This file
├── research.md      ✅ Phase 0 output
├── data-model.md    ✅ Phase 1 output
├── contracts/       ✅ Phase 1 output
│   └── auth-api.md
├── quickstart.md    ✅ Phase 1 output
└── tasks.md         🔜 Created by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── (auth)/                        # Auth group — unauthenticated screens
│   ├── _layout.tsx                # Auth stack navigator
│   ├── index.tsx                  # Auth entry (Sign In / Create Account)
│   ├── register.tsx               # Registration form
│   ├── otp-verify.tsx             # OTP verification
│   └── login.tsx                  # Login form
├── (onboarding)/
│   ├── _layout.tsx
│   └── index.tsx                  # Onboarding slides
├── (app)/                         # Protected group — authenticated screens
│   ├── _layout.tsx                # Tab/stack navigator + auth guard
│   └── index.tsx                  # Home placeholder (Phase 2)
├── _layout.tsx                    # Root layout — session bootstrap, i18n init
├── globals.css                    # NativeWind global styles
└── index.tsx                      # Entry redirect (checks session → route)

components/
├── auth/
│   ├── AuthButton.tsx
│   ├── AuthInput.tsx
│   ├── OtpInput.tsx               # 6-cell numeric OTP input
│   └── PasswordInput.tsx          # Input with show/hide toggle
├── onboarding/
│   ├── OnboardingSlide.tsx
│   └── OnboardingDots.tsx
└── ui/
    ├── AppText.tsx                # i18n-aware Text wrapper
    ├── AppButton.tsx
    └── LanguageSwitcher.tsx

store/
├── index.ts                       # Redux store setup
├── authSlice.ts                   # JWT token, user info, session state
├── api/
│   └── authApi.ts                 # RTK Query: register, login, activateAccount

lib/
├── secureStorage.ts               # Wrapper: get/set/delete JWT
├── i18n/
│   ├── index.ts                   # i18next init, language detection
│   ├── locales/
│   │   ├── ar.json                # Arabic translations
│   │   └── en.json                # English translations
└── constants/
    └── config.ts                  # API_BASE_URL from env

hooks/
├── useAuth.ts                     # Session state + logout helper
└── useLanguage.ts                 # Language toggle + RTL helper

__tests__/
├── components/
│   ├── OtpInput.test.tsx
│   ├── AuthInput.test.tsx
│   └── LanguageSwitcher.test.tsx
└── store/
    └── authSlice.test.ts
```

**Structure Decision**: Expo Router file-based routing with route groups — `(auth)` for unauthenticated screens, `(app)` for protected screens, `(onboarding)` for first-run flow. Root `_layout.tsx` handles session bootstrap and initial route decision.

---

## Complexity Tracking

> No constitution violations — table not required.
