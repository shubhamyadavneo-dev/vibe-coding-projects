import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon for dark mode (switch to light)
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for light mode (switch to dark)
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

const Header = ({ isDrawerOpen, toggleDrawer, pathname, boardId, isReports, goToDashboard, goToReports }) => {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left side: Hamburger menu and title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={toggleDrawer}
            aria-label={isDrawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isDrawerOpen}
          >
            <div className="relative h-5 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-full transform rounded-full bg-current transition-all duration-300 ${isDrawerOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'translate-y-0'}`} />
              <span className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 transform rounded-full bg-current transition-all duration-300 ${isDrawerOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute bottom-0 left-0 h-0.5 w-full transform rounded-full bg-current transition-all duration-300 ${isDrawerOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : 'translate-y-0'}`} />
            </div>
          </button>
          
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {isReports ? 'Reports' : boardId ? 'Board' : 'Dashboard'}
            </div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
              {isReports
                ? 'Time tracking & insights'
                : boardId
                  ? `Route: /boards/${boardId}`
                  : 'Choose a board to start working'}
            </div>
          </div>
        </div>

        {/* Right side: Theme toggle and logout button */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-50 hover:shadow-md active:scale-95 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60"
            aria-label="Logout"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;