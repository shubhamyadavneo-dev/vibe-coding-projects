import React from 'react';

const getBoardIdFromPath = (pathname) => {
  const match = pathname.match(/^\/boards\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
};

const isReportsPath = (pathname) => {
  return pathname === '/reports/time' || pathname.startsWith('/reports/');
};

const NavItem = ({ active, onClick, children, icon }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200
        ${active
          ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/10 dark:text-blue-300'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
        }
        active:scale-[0.98]
      `}
    >
      {active && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-500" />
      )}
      {icon && (
        <div className={`flex h-5 w-5 items-center justify-center ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {icon}
        </div>
      )}
      <span className="flex-1">{children}</span>
    </button>
  );
};

const NavigationDrawer = ({ pathname, user, onNavigate, onLogout, closeDrawer }) => {
  const boardId = getBoardIdFromPath(pathname);
  const isReports = isReportsPath(pathname);

  const handleNavigation = (path) => {
    onNavigate(path);
    closeDrawer?.();
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-950 dark:to-slate-900/80">
      {/* Drawer header */}
      <div className="border-b border-slate-200/60 bg-gradient-to-r from-blue-50/50 to-white px-6 py-5 dark:border-slate-800/60 dark:from-blue-950/20 dark:to-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-slate-900 dark:text-white">Task Manager</div>
            <div className="truncate text-xs text-slate-600 dark:text-slate-400">Modern SaaS Workspace</div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1 px-4">
        <div className="px-2 pb-2 pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Navigation</div>
        </div>
        
        <NavItem 
          active={pathname === '/'} 
          onClick={() => handleNavigation('/')}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        >
          Dashboard
        </NavItem>
        
        <NavItem 
          active={isReports} 
          onClick={() => handleNavigation('/reports/time')}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        >
          Reports
        </NavItem>

        {boardId && (
          <>
            <div className="px-2 pb-2 pt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Board</div>
            </div>
            <div className="mx-2 rounded-xl border border-slate-200/60 bg-gradient-to-r from-blue-50/30 to-white/30 p-4 backdrop-blur-sm dark:border-slate-800/60 dark:from-blue-950/20 dark:to-slate-900/20">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">ACTIVE BOARD</div>
              <div className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{boardId}</div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>8-column workflow enabled</span>
              </div>
            </div>
          </>
        )}
      </nav>

  {/* User profile */}
      <div className="px-6 py-5">
        <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-400 text-white">
                <span className="text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</div>
                <div className="truncate text-xs text-slate-600 dark:text-slate-400">{user?.email || 'Signed in'}</div>
              </div>
            </div>
            <div className="flex h-2 w-2 rounded-full bg-green-500 shadow-sm" />
          </div>
        </div>
      </div>
      
      {/* Footer with logout */}
      <div className="border-t border-slate-200/60 px-6 py-5 dark:border-slate-800/60">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-gradient-to-r from-white to-red-50/50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-50 hover:shadow-md active:scale-[0.98] dark:border-red-900/40 dark:from-red-950/20 dark:to-red-950/10 dark:text-red-300 dark:hover:bg-red-950/30"
          aria-label="Logout"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Task Manager v1.0 • Modern SaaS
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;