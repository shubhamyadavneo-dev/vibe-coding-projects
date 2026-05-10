import { createContext } from 'react'
import type { User } from '../types/api'

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (values: { name: string; email: string; password: string }) => Promise<string>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<string>
  resetPassword: (token: string, newPassword: string) => Promise<string>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
