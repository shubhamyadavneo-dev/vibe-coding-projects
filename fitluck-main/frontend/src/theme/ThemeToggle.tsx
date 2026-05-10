import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      onClick={toggleTheme}
      className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 bg-white text-stone-700 transition hover:border-lime-300 hover:bg-lime-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-lime-600 dark:hover:bg-stone-700"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}