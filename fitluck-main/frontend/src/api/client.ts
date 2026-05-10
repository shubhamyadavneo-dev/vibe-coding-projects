import axios from 'axios'
import { authStorage } from '../utils/storage'
import type { ApiError } from '../types/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: auto-refresh access token on 401 ───────────────
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const flushQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  )
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh on 401 and when we haven't already retried
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }

    const refreshToken = authStorage.getRefreshToken()
    if (!refreshToken) {
      authStorage.clearSession()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue requests that arrive while a refresh is already in-flight
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await api.post<{ accessToken: string }>(
        '/auth/refresh',
        { refreshToken }
      )
      const newAccessToken = data.accessToken
      authStorage.setSession(
        newAccessToken,
        refreshToken,
        authStorage.getUser()
      )
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      flushQueue(null, newAccessToken)
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      flushQueue(refreshError)
      authStorage.clearSession()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data
    if (data?.message) return data.message
    if (data?.errors?.length) return data.errors.map((item) => item.message).join(', ')
  }
  return 'Something went wrong'
}
