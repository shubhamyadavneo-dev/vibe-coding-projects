import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TaskForm from '../components/TaskForm';

const users = [
  { _id: 'user-1', name: 'Alice', email: 'alice@example.com' },
  { _id: 'user-2', name: 'Bob', email: 'bob@example.com' },
];

const existingTask = {
  _id: 'task-1',
  title: 'Improve modal layout',
  description: 'Refresh the task editor with a richer layout.',
  priority: 'high',
  status: 'In Progress',
  assignee: users[0],
  comments: [
    {
      _id: 'comment-1',
      body: 'Initial draft is ready.',
      author: users[0],
      createdAt: '2026-04-24T08:00:00.000Z',
    },
    {
      _id: 'comment-2',
      body: 'Need QA review next.',
      author: users[1],
      createdAt: '2026-04-24T09:00:00.000Z',
    },
  ],
  activityLog: [
    {
      _id: 'activity-1',
      message: 'Assignee changed from Unassigned to Alice',
      actor: users[1],
      createdAt: '2026-04-24T07:30:00.000Z',
      metadata: {},
    },
    {
      _id: 'activity-2',
      message: 'Comment added',
      actor: users[0],
      createdAt: '2026-04-24T08:15:00.000Z',
      metadata: {
        commentBody: 'Initial draft is ready.',
      },
    },
  ],
};

describe('TaskForm', () => {
  test('submits a new task with the selected values and null assignee when unassigned', () => {
    const onSave = jest.fn();
    const { container } = render(
      <TaskForm
        task={null}
        onSave={onSave}
        onCancel={jest.fn()}
        onAddComment={jest.fn()}
        onDeleteComment={jest.fn()}
        status="Todo"
        users={users}
        currentUserId="user-1"
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/enter task title/i), {
      target: { value: 'Ship improved task modal' },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/describe the goal, expected outcome, edge cases, and any acceptance notes/i),
      { target: { value: 'The modal should support comments and activity history.' } }
    );
    fireEvent.change(container.querySelector('select[name="status"]'), {
      target: { value: 'Done' },
    });
    fireEvent.change(container.querySelector('select[name="priority"]'), {
      target: { value: 'low' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    expect(onSave).toHaveBeenCalledWith({
      title: 'Ship improved task modal',
      description: 'The modal should support comments and activity history.',
      priority: 'low',
      status: 'Done',
      assignee: null,
    });
    expect(screen.getByText(/save the ticket first, then comments can be added here/i)).toBeInTheDocument();
  });

  test('saves comments and deletes own comments for an existing task', async () => {
    const onAddComment = jest.fn().mockResolvedValue({});
    const onDeleteComment = jest.fn().mockResolvedValue({});

    render(
      <TaskForm
        task={existingTask}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        status="Todo"
        users={users}
        currentUserId="user-1"
      />
    );

    const commentBox = screen.getByPlaceholderText(/add context, blockers, progress notes, or follow-up questions/i);

    fireEvent.change(commentBox, {
      target: { value: 'Looks good. Ready for release.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(onAddComment).toHaveBeenCalledWith('task-1', 'Looks good. Ready for release.');
    });
    await waitFor(() => {
      expect(commentBox).toHaveValue('');
    });

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDeleteComment).toHaveBeenCalledWith('task-1', 'comment-1');
    expect(screen.getByText(/assignee changed from unassigned to alice/i)).toBeInTheDocument();
    expect(screen.getAllByText(/initial draft is ready\./i)).toHaveLength(2);
  });

  test('clears the comment draft when comment cancel is clicked', async () => {
    render(
      <TaskForm
        task={existingTask}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onAddComment={jest.fn()}
        onDeleteComment={jest.fn()}
        status="Todo"
        users={users}
        currentUserId="user-1"
      />
    );

    const commentBox = screen.getByPlaceholderText(/add context, blockers, progress notes, or follow-up questions/i);

    fireEvent.change(commentBox, {
      target: { value: 'This should disappear.' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /cancel/i })[1]);

    await waitFor(() => {
      expect(commentBox).toHaveValue('');
    });
  });
});
