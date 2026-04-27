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
import Header from './components/Header';
import NavigationDrawer from './components/NavigationDrawer';
import Backdrop from './components/Backdrop';

const getBoardIdFromPath = (pathname) => {
  const match = pathname?.match(/^\/boards\/([^/]+)\/?$/);
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


function KanbanShell() {
  const { user, logout } = useAuth();
  const { currentBoard, fetchBoard, clearCurrentBoard, loading, error, updateBoard, deleteBoard } = useKanban();
  const [pathname, setPathname] = React.useState(() => window.location.pathname);
  const [showBoardForm, setShowBoardForm] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
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
    setDrawerOpen(false);
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      {/* Modern SaaS Drawer Navigation System */}
      <Backdrop isOpen={drawerOpen} onClick={closeDrawer} zIndex={40} />
      
      {/* Navigation Drawer - Fixed overlay that slides in */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavigationDrawer
          pathname={pathname}
          user={user}
          onNavigate={navigateTo}
          onLogout={logout}
          closeDrawer={closeDrawer}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Main content area - no permanent sidebar */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Modern SaaS Header */}
          <Header
            isDrawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            pathname={pathname}
            boardId={boardId}
            isReports={isReports}
            goToDashboard={goToDashboard}
            goToReports={goToReports}
          />

          <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
            {isReports ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:p-6">
                <ReportPage />
              </div>
            ) : !boardId ? (
              <BoardSelector onBoardSelect={openBoardRoute} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/30 sm:p-5">
                {/* <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  {/* <div className="flex flex-wrap items-center gap-3">
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
                </div> */}

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
                    <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-950">
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
