# Password Reset System - Complete Guide

## Overview

A complete password reset system that allows users to securely reset their passwords via email. Users request a reset link, receive it via email with a secure token, and can then set a new password.

---

## 🎯 How It Works

### Flow Diagram

```
User clicks "Forgot Password?"
       ↓
User enters email address
       ↓
Backend sends password reset email
with JWT token in link
       ↓
User clicks link:
http://example.com/reset-password?token=eyJhbGciOiJ...
       ↓
ResetPasswordPage extracts token
       ↓
User enters new password (twice for confirmation)
       ↓
Frontend calls /api/auth/reset-password with token & new password
       ↓
Backend verifies token & updates password
       ↓
User sees success message
       ↓
Auto-redirect to login (3 seconds)
```

---

## 📁 Components & Files

### New Components

#### 1. ForgotPasswordPage (198 lines)
**File:** `src/views/ForgotPasswordPage.js`

**Features:**
- ✅ Email input form for password reset request
- ✅ Calls backend to send reset email
- ✅ Shows loading spinner during submission
- ✅ Displays success state with instructions after email sent
- ✅ Beautiful UI matching existing design system
- ✅ Links back to login and register pages
- ✅ Option to resend reset link
- ✅ Toast notifications for feedback
- ✅ Error handling with Redux error slice

**States:**
- Input form (default)
- Loading state (while sending email)
- Success state (after email sent)

#### 2. ResetPasswordPage (317 lines)
**File:** `src/views/ResetPasswordPage.js`

**Features:**
- ✅ Reads token from URL query parameters
- ✅ Token validation on page load
- ✅ Password input with confirmation field
- ✅ Password strength validation (minimum 8 characters)
- ✅ Shows loading spinner while resetting
- ✅ Multiple states: verifying, valid, invalid, success
- ✅ Auto-redirect to login after successful reset (3 seconds)
- ✅ Beautiful UI with appropriate icons
- ✅ Toast notifications for feedback
- ✅ Error handling for expired/invalid tokens
- ✅ Link to request new reset link if token invalid

**States:**
- Verifying (checking token validity)
- Valid token (show reset form)
- Invalid token (show error with link to request new)
- Success (show success message and redirect)

### Updated Files

#### 1. config.js
**Added 2 endpoints:**

```javascript
auth: {
  // ... existing endpoints
  forgotPassword: {
    url: `${baseApiUrl}/api/auth/forgot-password`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
  resetPassword: {
    url: `${baseApiUrl}/api/auth/reset-password`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
}
```

#### 2. useAuth.js Hook
**Added 2 methods:**

```javascript
const forgotPassword = async (email) => {
  // Sends password reset email
  // Returns: { success: boolean, message: string }
}

const resetPassword = async (token, newPassword) => {
  // Resets password with token
  // Returns: { success: boolean, message: string }
}
```

#### 3. routes.js
**Added 2 routes:**

```javascript
{
  path: "/forgot-password",
  name: "Forgot Password",
  icon: "nc-icon nc-key-25",
  component: <ForgotPasswordPage />,
  layout: "/auth",
},
{
  path: "/reset-password",
  name: "Reset Password",
  icon: "nc-icon nc-lock-circle-open",
  component: <ResetPasswordPage />,
  layout: "/auth",
}
```

#### 4. AuthenticationPage.js
**Added "Forgot Password?" link:**

- Appears next to password label when in login mode
- Links to `/auth/forgot-password`
- Styled to match existing design

---

## 🔑 JWT Token Structure

The password reset token is a JWT containing:

```json
{
  "email": "user@example.com",
  "purpose": "password_reset",
  "iat": 1762586712,      // Issued at (Unix timestamp)
  "exp": 1762673112       // Expires at (Unix timestamp) - typically 1-24 hours later
}
```

Example URL with token:
```
http://example.com/auth/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Security Features

### Token Security
- ✅ JWT tokens with expiration (typically 1-24 hours)
- ✅ Tokens are single-use (invalidated after successful reset)
- ✅ Token includes email and purpose for validation
- ✅ Backend validates token signature and expiration

### Password Security
- ✅ Minimum 8 character requirement (frontend validation)
- ✅ Password confirmation to prevent typos
- ✅ Backend should hash passwords (bcrypt/argon2)
- ✅ HttpOnly cookies for authentication (not token storage)

### User Experience Security
- ✅ No disclosure if email exists (same success message)
- ✅ Token validation happens server-side
- ✅ Clear error messages for expired tokens
- ✅ Rate limiting should be implemented on backend

---

## 🎨 UI/UX Features

### Consistent Design
- Matches existing authentication pages design
- Uses TextLogo component
- Consistent form styling and spacing
- Tailwind CSS for responsive design

### User Feedback
- Loading spinners during async operations
- Toast notifications for success messages
- Error messages via Redux error slice
- Clear instructions at each step

### State Management
- Multiple UI states for each step
- Smooth transitions between states
- Auto-redirect after success
- Option to go back or retry

### Accessibility
- Proper form labels
- Semantic HTML
- Focus states on interactive elements
- Disabled state for loading buttons

---

## 📱 Routes

### Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/auth/login` | AuthenticationPage | Login with "Forgot password?" link |
| `/auth/forgot-password` | ForgotPasswordPage | Request password reset |
| `/auth/reset-password?token=...` | ResetPasswordPage | Reset password with token |

### Backend API Endpoints

| Endpoint | Method | Request Body | Response |
|----------|--------|--------------|----------|
| `/api/auth/forgot-password` | POST | `{ email }` | `{ message }` |
| `/api/auth/reset-password` | POST | `{ token, newPassword }` | `{ message }` |

---

## 💻 Usage Examples

### User Flow

#### Step 1: Request Password Reset
```javascript
// User goes to /auth/login
// Clicks "Forgot password?" link
// Redirected to /auth/forgot-password
// Enters email: user@example.com
// Clicks "Send Reset Link"
```

#### Step 2: Receive Email
```
Subject: Password Reset Request

Click the link below to reset your password:
http://example.com/auth/reset-password?token=eyJhbGciOiJ...

This link expires in 24 hours.
```

#### Step 3: Reset Password
```javascript
// User clicks link in email
// Redirected to /auth/reset-password?token=...
// Page validates token exists
// User enters new password (twice)
// Clicks "Reset Password"
// Success! Auto-redirect to login
```

### Integration with useAuth Hook

```javascript
import useAuth from '../variables/hooks/useAuth';

function MyComponent() {
  const { forgotPassword, resetPassword, isLoading } = useAuth();

  // Request password reset
  const handleForgotPassword = async (email) => {
    const result = await forgotPassword(email);
    if (result.success) {
      // Show success message
    }
  };

  // Reset password with token
  const handleResetPassword = async (token, newPassword) => {
    const result = await resetPassword(token, newPassword);
    if (result.success) {
      // Redirect to login
    }
  };
}
```

---

## 🔧 Backend Implementation Requirements

### Forgot Password Endpoint

```javascript
// POST /api/auth/forgot-password
// Request: { email: "user@example.com" }

1. Check if email exists in database
2. Generate JWT token with:
   - email
   - purpose: "password_reset"
   - expiration (1-24 hours)
3. Store token hash in database (optional for single-use)
4. Send email with reset link
5. Return success message (same message even if email not found)
```

### Reset Password Endpoint

```javascript
// POST /api/auth/reset-password
// Request: { token: "eyJ...", newPassword: "newpass123" }

1. Verify JWT token:
   - Valid signature
   - Not expired
   - Purpose matches "password_reset"
2. Extract email from token
3. Validate new password strength
4. Hash new password
5. Update user password in database
6. Invalidate token (if using database storage)
7. Optional: Send confirmation email
8. Return success message
```

---

## ✅ Features Checklist

### User Features
- [x] Forgot password link on login page
- [x] Email input form for password reset
- [x] Email sent confirmation screen
- [x] Password reset form with token validation
- [x] Password confirmation field
- [x] Password strength requirements
- [x] Success confirmation with auto-redirect
- [x] Error handling for invalid/expired tokens
- [x] Option to request new reset link

### Technical Features
- [x] JWT token-based reset flow
- [x] Token extraction from URL params
- [x] Frontend validation
- [x] Backend API integration
- [x] Redux state management
- [x] Toast notifications
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] Consistent UI/UX

### Security Features
- [x] Token expiration handling
- [x] No email disclosure
- [x] Password confirmation
- [x] Minimum password length
- [x] Token purpose validation
- [ ] Backend: Rate limiting (implement on backend)
- [ ] Backend: Password hashing (implement on backend)
- [ ] Backend: Token single-use (implement on backend)

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Click "Forgot password?" from login page
- [ ] Enter valid email and submit
- [ ] Check email inbox for reset link
- [ ] Click reset link in email
- [ ] Verify token is extracted from URL
- [ ] Enter new password (too short) - should show error
- [ ] Enter mismatched passwords - should show error
- [ ] Enter valid matching passwords - should succeed
- [ ] Verify auto-redirect to login after 3 seconds
- [ ] Login with new password - should work
- [ ] Try using expired token - should show error
- [ ] Try using invalid token - should show error
- [ ] Request new reset link after token expired

### Edge Cases

- [ ] Submit with empty email
- [ ] Submit with invalid email format
- [ ] Use reset link twice (should fail second time)
- [ ] Wait for token to expire, then try to use
- [ ] Close browser and reopen reset link
- [ ] Test on mobile devices
- [ ] Test with slow network connection

---

## 🎓 Learning Resources

### Similar Patterns in Codebase
- Email Verification (`VerifyEmailPage.js`) - Similar token-based flow
- Authentication (`AuthenticationPage.js`) - Form handling and validation
- User Profile (`UserProfile.js`) - Password change (for authenticated users)

### Technologies Used
- React 18+ with Hooks (useState, useEffect)
- React Router (useNavigate, useSearchParams)
- Axios (HTTP requests)
- Redux (state management)
- Tailwind CSS (styling)
- JWT (token-based authentication)

---

## 🚀 Future Enhancements

### Possible Improvements
- [ ] Add password strength meter
- [ ] Show password requirements checklist
- [ ] Add "Show/Hide password" toggle
- [ ] Email rate limiting (max 3 requests per hour)
- [ ] Multi-language support
- [ ] SMS-based password reset option
- [ ] Two-factor authentication integration
- [ ] Password history (prevent reusing old passwords)
- [ ] Account recovery questions
- [ ] Notification of password change to user

---

## 📞 Support

If you encounter any issues:

1. **Token not working?**
   - Check if token is expired
   - Verify backend is validating correctly
   - Request a new reset link

2. **Email not received?**
   - Check spam/junk folder
   - Verify email address is correct
   - Check backend email service logs

3. **UI issues?**
   - Clear browser cache
   - Check console for errors
   - Verify all dependencies installed

---

## ✅ Implementation Summary

**Files Created:**
- `src/views/ForgotPasswordPage.js` (198 lines)
- `src/views/ResetPasswordPage.js` (317 lines)
- `PASSWORD_RESET_GUIDE.md` (this file)

**Files Modified:**
- `src/config.js` (added 2 endpoints)
- `src/variables/hooks/useAuth.js` (added 2 methods)
- `src/routes.js` (added 2 routes)
- `src/views/AuthenticationPage.js` (added forgot password link)

**Backend Requirements:**
- POST `/api/auth/forgot-password` endpoint
- POST `/api/auth/reset-password` endpoint
- Email service for sending reset links
- JWT token generation and validation

---

**Status: ✅ FRONTEND COMPLETE**

The password reset system frontend is fully implemented and ready to use! Just make sure your backend implements the required endpoints. 🎉

