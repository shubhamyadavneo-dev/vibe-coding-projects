import React, { useState, useEffect, useCallback } from 'react';
import { useKanban } from '../context/KanbanContext';
import BoardForm from './BoardForm';

const BoardSelector = ({ onBoardSelect }) => {
  const {
    boards,
    currentBoard,
    fetchBoards,
    fetchBoard,
    createBoard,
    deleteBoard,
    loading,
    error,
    clearError
  } = useKanban();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [detailsBoard, setDetailsBoard] = useState(null);

  const loadBoards = useCallback(async () => {
    try {
      await fetchBoards();
    } catch (err) {
      console.error('Failed to load boards:', err);
    }
  }, [fetchBoards]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleSelectBoard = async (boardId) => {
    setLocalLoading(true);
    try {      
      await fetchBoard(boardId);
      if (onBoardSelect) {
        onBoardSelect(boardId);
      }
    } catch (err) {
      console.error('Failed to load board:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCreateBoard = async (boardData) => {
    try {
      await createBoard(boardData);
      setShowCreateForm(false);
      await loadBoards();
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board? All tasks will be deleted.')) {
      try {
        await deleteBoard(boardId);
        await loadBoards();
      } catch (err) {
        console.error('Failed to delete board:', err);
      }
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Boards Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Choose a board to open and manage its tasks.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          + New Board
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
          <div className="flex justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        </div>
      )}

      {(loading || localLoading) && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading boards...</p>
        </div>
      )}

      {!loading && boards.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No boards found. Create your first board to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Board
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board._id}
            className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${currentBoard && currentBoard._id === board._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white'
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{board.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{board.description || 'No description'}</p>
              </div>
              <button
                onClick={(e) => handleDeleteBoard(board._id, e)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete board"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="mr-4">
                Columns: {board.columns?.length || 3}
              </span>
              <span>
                Created: {new Date(board.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              {currentBoard && currentBoard._id === board._id ? (
                <div className="text-sm text-blue-600 font-medium">
                  Active board
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  View details or open
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsBoard(board)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectBoard(board._id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentBoard && currentBoard._id === board._id
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                >
                  {currentBoard && currentBoard._id === board._id ? 'Open Board' : 'Open Board'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {detailsBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{detailsBoard.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{detailsBoard.description || 'No description available.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsBoard(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">Columns:</span> {detailsBoard.columns?.join(', ') || 'Backlog, Analysis, Ready, Development, Review, Testing, Staging, Done'}</p>
              <p><span className="font-semibold text-slate-800">Created:</span> {new Date(detailsBoard.createdAt).toLocaleDateString()}</p>
              {currentBoard && currentBoard._id === detailsBoard._id && (
                <p className="font-medium text-blue-600">This board is currently active.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailsBoard(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  setDetailsBoard(null);
                  console.log("Details board::", detailsBoard);

                  await handleSelectBoard(detailsBoard._id);
                }}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Open Board
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <BoardForm
              board={null}
              onSave={handleCreateBoard}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSelector;
