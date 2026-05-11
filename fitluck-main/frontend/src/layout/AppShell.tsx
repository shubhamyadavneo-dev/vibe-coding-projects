import {
  Activity,
  BarChart3,
  Calculator,
  CalendarDays,
  Camera,
  Dumbbell,
  Home,
  Library,
  LogOut,
  Menu,
  TrendingUp,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ThemeToggle } from '../theme/ThemeToggle'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/exercises', label: 'Exercises', icon: Library },
  { to: '/calculators', label: 'Calculators', icon: Calculator },
  { to: '/progress-photos', label: 'Progress Photos', icon: Camera },
]

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/plan': 'Plan',
  '/workout': 'Workout',
  '/progress': 'Progress',
  '/analytics': 'Analytics',
  '/exercises': 'Exercises',
  '/calculators': 'Calculators',
  '/progress-photos': 'Progress Photos',
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, user } = useAuth()

  return (
    <aside className="flex h-full flex-col bg-stone-950 text-white dark:bg-stone-950">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-lime-400 text-stone-950 dark:text-stone-100">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black">FITLUCK</p>
            <p className="text-xs font-semibold text-lime-200">Train with intent</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  isActive ? 'bg-lime-400 text-stone-950 dark:text-stone-100' : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-white/5 p-3">
          <p className="text-sm font-bold">{user?.name || 'Athlete'}</p>
          <p className="truncate text-xs text-stone-400">{user?.email}</p>
        </div>
        <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-300 hover:bg-white/10">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'Fitluck'

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-stone-950/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-80 max-w-[86vw]">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-100/90 px-4 py-3 backdrop-blur md:px-8 dark:border-stone-700 dark:bg-stone-950/90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-lg border border-stone-200 bg-white lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">Fitluck</p>
                <h1 className="text-xl font-black text-stone-950 dark:text-stone-100 dark:text-stone-100">{title}</h1>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <ThemeToggle />
              <div className="hidden items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-sm font-bold text-lime-800 sm:flex dark:border-lime-800 dark:bg-lime-900 dark:text-lime-200">
                <span className="h-2 w-2 rounded-full bg-lime-500" />
                Active
              </div>
            </div>
            <button type="button" aria-label="Close navigation" className="hidden">
              <X />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
