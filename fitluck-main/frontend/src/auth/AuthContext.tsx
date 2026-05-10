import { useMemo, useState } from 'react'
import { api } from '../api/client'
import { authStorage } from '../utils/storage'
import type { LoginResponse, User } from '../types/api'
import { AuthContext } from './AuthContextBase'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser<User>())

  const login = async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    authStorage.setSession(data.accessToken, data.refreshToken, data.user)
    setUser(data.user)
  }

  const register = async (values: { name: string; email: string; password: string }) => {
    const { data } = await api.post<{ message: string }>('/auth/register', values)
    return data.message
  }

  const logout = async () => {
    const refreshToken = authStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch {
        // Local sign-out should still succeed if the refresh token was already invalidated.
      }
    }
    authStorage.clearSession()
    setUser(null)
  }

  const forgotPassword = async (email: string) => {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return data.message
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', { token, password: newPassword })
    return data.message
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && authStorage.getAccessToken()),
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
