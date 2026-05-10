import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
    // Default to light theme
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    console.log(`Setting theme to ${theme}, root classes: ${root.classList}`)
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    console.log(`After update, root classes: ${root.classList}`)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    console.log('Toggle theme, current:', theme)
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      console.log('Next theme:', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}