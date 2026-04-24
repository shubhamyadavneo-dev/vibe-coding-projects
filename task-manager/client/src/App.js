import React from 'react';
import { KanbanProvider } from './context/KanbanContext';
import { useKanban } from './context/KanbanContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Board from './components/Board';
import BoardSelector from './components/BoardSelector';
import BoardForm from './components/BoardForm';
import AuthForm from './components/AuthForm';

const getBoardIdFromPath = (pathname) => {
  const match = pathname.match(/^\/boards\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
};

function KanbanShell() {
  const { user, logout } = useAuth();
  const { currentBoard, fetchBoard, clearCurrentBoard, loading, error, updateBoard, deleteBoard } = useKanban();
  const [pathname, setPathname] = React.useState(() => window.location.pathname);
  const [showBoardForm, setShowBoardForm] = React.useState(false);
  const boardId = getBoardIdFromPath(pathname);

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
  }, []);

  const openBoardRoute = React.useCallback((nextBoardId) => {
    console.log({nextBoardId});
    
    navigateTo(`/boards/${encodeURIComponent(nextBoardId)}`);
  }, [navigateTo]);

  const goToDashboard = React.useCallback(() => {
    clearCurrentBoard();
    navigateTo('/');
  }, [clearCurrentBoard, navigateTo]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500 rounded-xl shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
                <p className="text-gray-600 mt-1">Boards dashboard with task tracking and drag & drop.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{user?.name}</span>
              </div>
              <button className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        {!boardId && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg">
            <BoardSelector onBoardSelect={openBoardRoute} />
          </div>
        )}

        {boardId && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-50 to-transparent p-1">
            <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-3 sm:p-5">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={goToDashboard}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Back to Dashboard
                  </button>
                  {/* <button
                    onClick={() => setShowBoardForm(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-300 bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Edit Board
                  </button>
                  <button
                    onClick={handleDeleteBoard}
                    className="inline-flex items-center gap-2 rounded-full border border-danger-300 bg-danger-600 px-4 py-2 text-sm font-medium text-white hover:bg-danger-700"
                  >
                    Delete Board
                  </button> */}
                  <p className="text-sm text-slate-500">
                    {/* {currentBoard ? `Board route: /boards/${currentBoard._id}` : `Board route: /boards/${boardId}`} */}
                  </p>
                </div>
                {loading && (
                  <div className="text-sm text-slate-500">Loading board...</div>
                )}
              </div>

              {loading && !currentBoard ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                  Loading board...
                </div>
              ) : !loading && error && !currentBoard ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                  <p className="text-lg font-semibold">Unable to load this board.</p>
                  <p className="mt-2 text-sm">{error}</p>
                </div>
              ) : (
                <Board onBoardDeleted={goToDashboard} />
              )}

              {/* Board Form Modal */}
              {showBoardForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                    <BoardForm
                      board={currentBoard}
                      onSave={handleSaveBoard}
                      onCancel={() => setShowBoardForm(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-gray-700 font-medium">
                Kanban Board &copy; {new Date().getFullYear()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded">MERN Stack</span>
                <span className="px-2 py-1 bg-gray-100 rounded">React 19</span>
                <span className="px-2 py-1 bg-gray-100 rounded">@dnd-kit</span>
                <span className="px-2 py-1 bg-gray-100 rounded">Tailwind CSS</span>
              </div>
            </div>

            <div className="text-gray-500 text-sm">
              <p>{boardId ? 'This page is scoped to the selected board route.' : 'Choose a board from the dashboard to open its dedicated page.'}</p>
            </div>
          </div>
        </div>
      </footer>
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
