import React, { useState, useEffect } from 'react';

const BoardForm = ({ board, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    columns: ['Backlog', 'Analysis', 'Ready', 'Development', 'Review', 'Testing', 'Staging', 'Done']
  });

  const [newColumn, setNewColumn] = useState('');

  useEffect(() => {
    if (board) {
      setFormData({
        name: board.name || '',
        description: board.description || '',
        columns: board.columns || ['Backlog', 'Analysis', 'Ready', 'Development', 'Review', 'Testing', 'Staging', 'Done']
      });
    }
  }, [board]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddColumn = () => {
    if (newColumn.trim() && !formData.columns.includes(newColumn.trim())) {
      setFormData(prev => ({
        ...prev,
        columns: [...prev.columns, newColumn.trim()]
      }));
      setNewColumn('');
    }
  };

  const handleRemoveColumn = (columnToRemove) => {
    if (formData.columns.length <= 1) {
      alert('Board must have at least one column');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col !== columnToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Board name is required');
      return;
    }
    if (formData.columns.length === 0) {
      alert('Board must have at least one column');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">
        {board ? 'Edit Board' : 'Create New Board'}
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Board Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="Enter board name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="Enter board description"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Columns
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {formData.columns.map((column, index) => (
            <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
              <span className="font-medium truncate">{column}</span>
              <button
                type="button"
                onClick={() => handleRemoveColumn(column)}
                className="text-red-600 hover:text-red-800 text-sm whitespace-nowrap"
                disabled={formData.columns.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex">
          <input
            type="text"
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="New column name"
          />
          <button
            type="button"
            onClick={handleAddColumn}
            className="rounded-r-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Add
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Add custom columns for your board. Default columns are Backlog, Analysis, Ready, Development, Review, Testing, Staging, Done.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {board ? 'Update Board' : 'Create Board'}
        </button>
      </div>
    </form>
  );
};

export default BoardForm;