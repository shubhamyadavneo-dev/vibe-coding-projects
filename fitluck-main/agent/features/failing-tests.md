# Frontend Test Fix — Agent Prompt

## Problem
The frontend test suite is failing due to a TypeScript error in `src/auth/AuthContext.tsx`.

## Error
```
src/auth/AuthContext.tsx:45:32 - error TS2739: Type '{ user: User | null; isAuthenticated: boolean; login: ...; register: ...; logout: ...; }' is missing the following properties from type 'AuthContextValue': forgotPassword, resetPassword
```

## Root Cause
The `AuthContextValue` interface defines `forgotPassword` and `resetPassword` as required methods, but the `value` object passed to `AuthContext.Provider` is missing these two methods.

---

## Fix Instructions

### Step 1 — Open `src/auth/AuthContext.tsx`

Find the `AuthContextValue` interface. It should look something like this:

```tsx
interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (values: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>      // ← required but missing from value
  resetPassword: (token: string, password: string) => Promise<void>  // ← required but missing from value
}
```

### Step 2 — Find the `value` object (around line 45)

It currently looks like this (missing forgotPassword and resetPassword):

```tsx
const value = {
  user,
  isAuthenticated,
  login,
  register,
  logout,
  // forgotPassword is missing ❌
  // resetPassword is missing ❌
}

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
```

### Step 3 — Add the missing functions

Add `forgotPassword` and `resetPassword` implementations inside the AuthProvider component, then add them to the value object.

Here is the complete fixed `AuthContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth' // adjust import path to match your project

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (values: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const isAuthenticated = !!user

  // Login
  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }

  // Register
  const register = async (values: { name: string; email: string; password: string }) => {
    await authApi.register(values)
  }

  // Logout
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await authApi.logout(refreshToken)
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  // Forgot Password ← ADD THIS
  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email)
  }

  // Reset Password ← ADD THIS
  const resetPassword = async (token: string, password: string) => {
    await authApi.resetPassword({ token, password })
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,   // ← ADD THIS
    resetPassword,    // ← ADD THIS
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
```

---

## Step 4 — Check your API layer

Make sure your `src/api/auth.ts` (or wherever your API calls live) has `forgotPassword` and `resetPassword` methods:

```ts
// src/api/auth.ts
import axios from './axios' // your axios instance

export const authApi = {
  login: (data: { email: string; password: string }) =>
    axios.post('/auth/login', data).then(res => res.data),

  register: (data: { name: string; email: string; password: string }) =>
    axios.post('/auth/register', data).then(res => res.data),

  logout: (refreshToken: string) =>
    axios.post('/auth/logout', { refreshToken }).then(res => res.data),

  forgotPassword: (email: string) =>
    axios.post('/auth/forgot-password', { email }).then(res => res.data),

  resetPassword: (data: { token: string; password: string }) =>
    axios.post('/auth/reset-password', data).then(res => res.data),
}
```

---

## Step 5 — Fix test mocks

If your tests mock `useAuth`, update the mock to include the missing methods:

```tsx
// In any test file that mocks useAuth
jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),   // ← ADD THIS
    resetPassword: jest.fn(),    // ← ADD THIS
  }),
}))
```

---

## Step 6 — If you have a mock AuthProvider for tests

Update it too:

```tsx
// src/tests/mocks/MockAuthProvider.tsx
import React from 'react'
import AuthContext from '../../auth/AuthContext'

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),   // ← ADD THIS
    resetPassword: jest.fn(),    // ← ADD THIS
  }

  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## Step 7 — Run tests

```bash
npm test
```

Expected result:
```
PASS  src/layout/__tests__/AppShell.test.tsx
Test Suites: X passed
Tests:       X passed
```

---

## Important Notes

- Do NOT change the `AuthContextValue` interface — the interface is correct
- The fix is to ADD the missing implementations to the provider, not remove them from the interface
- If `authApi.forgotPassword` or `authApi.resetPassword` don't exist in your API layer, add them as shown in Step 4
- If tests use `renderWithProviders` or similar helper, make sure that helper's mock also includes both methods

---

## Checklist
```
□ forgotPassword function added inside AuthProvider
□ resetPassword function added inside AuthProvider  
□ Both added to the value object
□ authApi has forgotPassword and resetPassword methods
□ All test mocks updated to include both methods
□ npm test passes with 0 failures
```