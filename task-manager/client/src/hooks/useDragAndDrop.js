import { useCallback } from 'react';
import { useKanban } from '../context/KanbanContext';

export const useDragAndDrop = () => {
  const { reorderTasks, currentBoard, tasks, getTasksByStatus } = useKanban();

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    console.log({currentBoard});


    if (!over || !currentBoard) return;

    const activeId = active.id;
    const overId = over.id;

    // Extract task ID and column ID from the draggable IDs
    const activeTaskId = activeId.startsWith('task-') ? activeId.replace('task-', '') : null;
    const overColumnId = overId.startsWith('column-') ? overId.replace('column-', '') : null;
    const overTaskId = overId.startsWith('task-') ? overId.replace('task-', '') : null;

    // If dragging a task over another task
    if (activeTaskId && overTaskId) {
      const activeTask = tasks.find((task) => task._id === activeTaskId);
      const overTask = tasks.find((task) => task._id === overTaskId);
      if (!activeTask || !overTask) return;

      const activeStatus = activeTask.status;
      const overStatus = overTask.status;
      const sourceTasks = getTasksByStatus(activeStatus);
      const destinationTasks = getTasksByStatus(overStatus);
      const activeIndex = sourceTasks.findIndex((task) => task._id === activeTaskId);
      const overIndex = destinationTasks.findIndex((task) => task._id === overTaskId);
      if (activeIndex < 0 || overIndex < 0) return;
    
      // If dragging within the same column
      if (activeStatus === overStatus) {
        if (activeIndex === overIndex) return;

        await reorderTasks({
          taskId: activeTaskId,
          sourceStatus: activeStatus,
          destinationStatus: overStatus,
          sourceIndex: activeIndex,
          destinationIndex: overIndex,
          boardId: currentBoard?._id
        });
      } else {
        // Dragging to a different column
        await reorderTasks({
          taskId: activeTaskId,
          sourceStatus: activeStatus,
          destinationStatus: overStatus,
          sourceIndex: activeIndex,
          destinationIndex: overIndex,
          boardId: currentBoard?._id
        });
      }
    }
    
    // If dragging a task over a column (empty column)
    else if (activeTaskId && overColumnId) {
      const activeTask = tasks.find((task) => task._id === activeTaskId);
      if (!activeTask) return;

      const activeStatus = activeTask.status;
      const sourceTasks = getTasksByStatus(activeStatus);
      const destinationTasks = getTasksByStatus(overColumnId);
      const activeIndex = sourceTasks.findIndex((task) => task._id === activeTaskId);
      if (activeIndex < 0) return;

      // If dropping into the same column, do nothing
      if (activeStatus === overColumnId) return;

      // Move to the end of the target column
      await reorderTasks({
        taskId: activeTaskId,
        sourceStatus: activeStatus,
        destinationStatus: overColumnId,
        sourceIndex: activeIndex,
        destinationIndex: destinationTasks.length,
        boardId: currentBoard?._id
      });
    }
  }, [reorderTasks, currentBoard, tasks, getTasksByStatus]);

  return { handleDragEnd };
};