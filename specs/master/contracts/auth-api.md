# Contract: Auth API

**Consumer**: React Native customer app (Phase 1)
**Provider**: Spring Boot backend (`/api/v1/auth/**`)
**Date**: 2026-03-29

---

## Endpoints

### POST /api/v1/auth/register

**Purpose**: Create a new unverified user account and send OTP email.

**Request**:
```
Content-Type: application/json

{
  "firstname": "Ahmed",
  "lastname": "Al-Sayed",
  "email": "ahmed@example.com",
  "password": "Secure123!"
}
```

**Success Response**:
```
HTTP 202 Accepted
(empty body)
```

**Error Responses**:
```
HTTP 400 Bad Request — validation failure
{
  "validationErrors": ["firstname: must not be blank", ...]
}

HTTP 403 Forbidden — email already registered
{
  "businessErrorCode": 304,
  "businessErrorDescription": "Username and / or password is incorrect"
}
```

**Mobile behavior on 202**: Show OTP verification screen, pass email as route param.
**Mobile behavior on 400**: Display `validationErrors` inline on form fields.

---

### GET /api/v1/auth/activate-account?token={otp}

**Purpose**: Verify 6-digit OTP and activate the user account.

**Request**:
```
GET /api/v1/auth/activate-account?token=123456
(no body, no auth header)
```

**Success Response**:
```
HTTP 200 OK
(empty body)
```

**Error Responses**:
```
HTTP 400 Bad Request — invalid or expired token
{
  "error": "Token has expired. A new token has been sent to the same email address"
}
```

**Mobile behavior on 200**: Immediately call login with stored credentials → navigate to home.
**Mobile behavior on 400 (expired)**: Show "A new code has been sent to your email" banner; clear OTP input.
**Mobile behavior on 400 (invalid)**: Show "Incorrect code, please try again" inline error.

---

### POST /api/v1/auth/authenticate

**Purpose**: Authenticate a user and receive a JWT.

**Request**:
```
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "Secure123!"
}
```

**Success Response**:
```
HTTP 200 OK
Content-Type: application/json

{
  "token": "<JWT string>"
}
```

**Error Responses**:
```
HTTP 403 Forbidden — bad credentials
{
  "businessErrorCode": 304,
  "businessErrorDescription": "Username and / or password is incorrect"
}

HTTP 403 Forbidden — account locked
{
  "businessErrorCode": 302,
  "businessErrorDescription": "Account locked"
}

HTTP 403 Forbidden — account disabled (OTP not verified)
{
  "businessErrorCode": 303,
  "businessErrorDescription": "Account disabled"
}
```

**Mobile behavior on 200**: Decode JWT → store in SecureStore → dispatch to Redux → navigate to (app)/.
**Mobile behavior on 403/303**: Redirect to OTP verification screen (account not yet activated).
**Mobile behavior on 403/302**: Show "Your account has been locked. Please contact support." dialog.
**Mobile behavior on 403/304**: Show "Incorrect email or password." inline error.

---

## JWT Structure

The JWT contains the following claims (decoded client-side, never verified client-side):

```json
{
  "sub": "ahmed@example.com",
  "fullName": "Ahmed Al-Sayed",
  "authorities": [{"authority": "ROLE_USER"}],
  "iat": 1711700000,
  "exp": 1711786400
}
```

**Expiry**: `exp - iat` = 86400s (2.4 hours per backend config).
**Client usage**: Extract `fullName` for display; extract `exp` to set `session.expiresAt`.

---

## Authentication Header

All protected endpoints (Phase 2+) require:
```
Authorization: Bearer <JWT>
```

RTK Query `prepareHeaders` will attach this from `authSlice.session.token` for all protected endpoints.

---

## Error Handling Matrix

| HTTP Status | businessErrorCode | Mobile Action |
|-------------|-------------------|---------------|
| 202 | — | Navigate to OTP screen |
| 200 (login) | — | Store JWT, navigate to home |
| 400 | — | Show validation errors on form |
| 403 | 302 | Show "account locked" dialog |
| 403 | 303 | Redirect to OTP verify screen |
| 403 | 304 | Show "incorrect credentials" error |
| 5xx | — | Show generic "server error, try again" toast |
| Network error | — | Show "no internet connection" banner |
