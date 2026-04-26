import React, { useEffect, useMemo, useState } from 'react';

const formatDateTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const getPriorityTone = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const TaskForm = ({ task, onSave, onCancel, onAddComment, onDeleteComment, status, users, currentUserId, columns }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: status || 'Todo',
    assignee: '',
    estimatedHours: 0,
    actualHours: 0
  });
  const [commentDraft, setCommentDraft] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || status || 'Todo',
        assignee: task.assignee?._id || '',
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0
      });
    } else {
      setFormData(prev => ({
        ...prev,
        status: status || 'Todo',
        assignee: '',
        estimatedHours: 0,
        actualHours: 0
      }));
    }
  }, [task, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    onSave({
      ...formData,
      title: formData.title.trim(),
      assignee: formData.assignee || null
    });
  };

  const activityItems = useMemo(() => {
    if (!task?.activityLog?.length) {
      return [];
    }

    return [...task.activityLog].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [task]);

  const comments = useMemo(() => {
    if (!task?.comments?.length) {
      return [];
    }

    return [...task.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [task]);

  const availableStatuses = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) {
      return columns;
    }
    return ['Todo', 'In Progress', 'Done'];
  }, [columns]);

  const handleSaveComment = async () => {
    if (!task?._id || !commentDraft.trim()) {
      return;
    }

    setIsSavingComment(true);
    try {
      await onAddComment(task._id, commentDraft.trim());
      setCommentDraft('');
    } finally {
      setIsSavingComment(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[32px]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-primary-900 px-6 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
              {task ? 'Update Ticket' : 'Create Ticket'}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              {task ? task.title || 'Edit task details' : 'Design a richer ticket'}
            </h2>
            <p className="max-w-2xl text-sm text-white/70">
              Keep the core ticket details on the left and collaboration history on the right so updates feel more like a real work item panel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
              Status: {formData.status}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityTone(formData.priority)}`}>
              Priority: {formData.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-h-[60vh] grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit} className="border-r border-slate-200 bg-white px-6 py-6 sm:px-8">
          {/* <div className="grid gap-5 md:grid-cols-2"> */}
            <div className="md:col-span-2">
              <label className="label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input rounded-2xl px-4 py-3"
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[180px] rounded-2xl px-4 py-3"
                placeholder="Describe the goal, expected outcome, edge cases, and any acceptance notes"
                rows="7"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input rounded-2xl px-4 py-3"
              >
                {availableStatuses.map((nextStatus) => (
                  <option key={nextStatus} value={nextStatus}>
                    {nextStatus}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input rounded-2xl px-4 py-3"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Assignee</label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="input rounded-2xl px-4 py-3"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>


          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary rounded-full px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary rounded-full px-5"
            >
              {task ? 'Update Ticket' : 'Create Ticket'}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-6 sm:px-8">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
                  <p className="text-sm text-slate-500">Discuss changes directly on the ticket.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {comments.length}
                </span>
              </div>

              {task ? (
                <>
                  <div className="space-y-3">
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      className="input min-h-[110px] rounded-2xl px-4 py-3"
                      placeholder="Add context, blockers, progress notes, or follow-up questions"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setCommentDraft('')}
                        className="btn-secondary rounded-full px-4"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveComment}
                        disabled={isSavingComment || !commentDraft.trim()}
                        className="btn-primary rounded-full px-4 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingComment ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 max-h-[240px] space-y-3 overflow-y-auto pr-1">
                    {comments.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                        No comments yet.
                      </p>
                    )}
                    {comments.map((comment) => (
                      <article key={comment._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{comment.author?.name || 'Unknown user'}</p>
                            <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
                          </div>
                          {comment.author?._id === currentUserId && (
                            <button
                              type="button"
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                              onClick={() => onDeleteComment(task._id, comment._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{comment.body}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Save the ticket first, then comments can be added here.
                </p>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Time</h3>
                <p className="text-sm text-slate-500">Capture estimates and actuals without leaving the ticket panel.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Estimated Hours</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    className="input rounded-2xl px-4 py-3"
                    placeholder="0"
                    min="0"
                    max="1000"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="label">Actual Hours</label>
                  <input
                    type="number"
                    name="actualHours"
                    value={formData.actualHours}
                    onChange={handleChange}
                    className="input rounded-2xl px-4 py-3"
                    placeholder="0"
                    min="0"
                    max="1000"
                    step="0.5"
                  />
                </div>
              </div>
            </section>

            {/* <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">History</h3>
                <p className="text-sm text-slate-500">Tracks assignee updates and comment activity over time.</p>
              </div>

              <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                {!task && (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Activity history will appear after the ticket is created.
                  </p>
                )}
                {task && activityItems.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No history yet.
                  </p>
                )}
                {activityItems.map((item) => (
                  <article key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.message}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.actor?.name || 'System'} • {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    {item.metadata?.commentBody && (
                      <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                        {item.metadata.commentBody}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
