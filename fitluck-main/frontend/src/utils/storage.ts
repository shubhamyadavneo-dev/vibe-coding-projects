const accessKey = 'fitluck.accessToken'
const refreshKey = 'fitluck.refreshToken'
const userKey = 'fitluck.user'

const cookieDays = 7

const setCookie = (name: string, value: string) => {
  const maxAge = cookieDays * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

const getCookie = (name: string) => {
  const prefix = `${name}=`
  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length)
}

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export const authStorage = {
  getAccessToken: () => localStorage.getItem(accessKey) || decodeURIComponent(getCookie(accessKey) || ''),
  getRefreshToken: () => localStorage.getItem(refreshKey) || decodeURIComponent(getCookie(refreshKey) || ''),
  getUser: <T,>() => {
    const raw = localStorage.getItem(userKey) || decodeURIComponent(getCookie(userKey) || '')
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  setSession: (accessToken: string, refreshToken: string, user: unknown) => {
    const serializedUser = JSON.stringify(user)
    localStorage.setItem(accessKey, accessToken)
    localStorage.setItem(refreshKey, refreshToken)
    localStorage.setItem(userKey, serializedUser)
    setCookie(accessKey, accessToken)
    setCookie(refreshKey, refreshToken)
    setCookie(userKey, serializedUser)
  },
  clearSession: () => {
    localStorage.removeItem(accessKey)
    localStorage.removeItem(refreshKey)
    localStorage.removeItem(userKey)
    clearCookie(accessKey)
    clearCookie(refreshKey)
    clearCookie(userKey)
  },
}
