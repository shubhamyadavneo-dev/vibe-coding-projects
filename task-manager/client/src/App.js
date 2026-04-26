import React from 'react';
import { KanbanProvider } from './context/KanbanContext';
import { useKanban } from './context/KanbanContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Board from './components/Board';
import BoardSelector from './components/BoardSelector';
import BoardForm from './components/BoardForm';
import AuthForm from './components/AuthForm';
import ReportPage from './components/ReportPage';

const getBoardIdFromPath = (pathname) => {
  const match = pathname.match(/^\/boards\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
};

const isReportsPath = (pathname) => {
  return pathname === '/reports/time' || pathname.startsWith('/reports/');
};

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Night' : 'Day';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" />
      {label} mode
    </button>
  );
}

function NavItem({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition',
        active
          ? 'bg-primary-50 text-primary-800 dark:bg-primary-500/10 dark:text-primary-200'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Sidebar({ pathname, user, onNavigate, onLogout }) {
  const boardId = getBoardIdFromPath(pathname);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">Task Manager</div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">Kanban workspace</div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="rounded-xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold">{user?.name || 'Signed in'}</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-success-500" />
          </div>
          <div className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{user?.email || 'Online'}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <NavItem active={pathname === '/'} onClick={() => onNavigate('/')}>
          Dashboard
        </NavItem>
        <NavItem active={isReportsPath(pathname)} onClick={() => onNavigate('/reports/time')}>
          Reports
        </NavItem>
        {boardId && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-3 text-xs shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current board</div>
            <div className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{boardId}</div>
          </div>
        )}
      </nav>

      <div className="px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function KanbanShell() {
  const { user, logout } = useAuth();
  const { currentBoard, fetchBoard, clearCurrentBoard, loading, error, updateBoard, deleteBoard } = useKanban();
  const [pathname, setPathname] = React.useState(() => window.location.pathname);
  const [showBoardForm, setShowBoardForm] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const boardId = getBoardIdFromPath(pathname);
  const isReports = isReportsPath(pathname);

  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    if (!boardId) {
      clearCurrentBoard();
      return;
    }

    clearCurrentBoard();
    fetchBoard(boardId).catch(() => {});
  }, [boardId, clearCurrentBoard, fetchBoard]);

  const navigateTo = React.useCallback((nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setPathname(nextPath);
    }
    setSidebarOpen(false);
  }, []);

  const openBoardRoute = React.useCallback((nextBoardId) => {
    console.log({nextBoardId});
    
    navigateTo(`/boards/${encodeURIComponent(nextBoardId)}`);
  }, [navigateTo]);

  const goToDashboard = React.useCallback(() => {
    clearCurrentBoard();
    navigateTo('/');
  }, [clearCurrentBoard, navigateTo]);

  const goToReports = React.useCallback(() => {
    navigateTo('/reports/time');
  }, [navigateTo]);

  const handleSaveBoard = async (boardData) => {
    await updateBoard(currentBoard._id, boardData);
    setShowBoardForm(false);
  };

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board? All tasks will be deleted.')) {
      await deleteBoard(currentBoard._id);
      goToDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[280px] transform border-r border-slate-200 bg-white shadow-xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar pathname={pathname} user={user} onNavigate={navigateTo} onLogout={logout} />
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[280px] flex-shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 lg:block">
          <Sidebar pathname={pathname} user={user} onNavigate={navigateTo} onLogout={logout} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
            <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
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

              <div className="flex items-center gap-2">
                <ThemeToggleButton />
                <button
                  className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
                  onClick={goToReports}
                >
                  Reports
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
            {isReports ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:p-6">
                <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={goToDashboard}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Time Report</h2>
                  </div>
                </div>
                <ReportPage />
              </div>
            ) : !boardId ? (
              <BoardSelector onBoardSelect={openBoardRoute} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/30 sm:p-5">
                <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={goToDashboard}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Back to Dashboard
                    </button>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{boardId}</div>
                  </div>
                  {loading && <div className="text-sm text-slate-500 dark:text-slate-400">Loading board...</div>}
                </div>

                {loading && !currentBoard ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    Loading board...
                  </div>
                ) : !loading && error && !currentBoard ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                    <p className="text-lg font-semibold">Unable to load this board.</p>
                    <p className="mt-2 text-sm">{error}</p>
                  </div>
                ) : (
                  <Board onBoardDeleted={goToDashboard} />
                )}

                {showBoardForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-950">
                      <BoardForm board={currentBoard} onSave={handleSaveBoard} onCancel={() => setShowBoardForm(false)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">Checking session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <KanbanProvider>
      <KanbanShell />
    </KanbanProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
