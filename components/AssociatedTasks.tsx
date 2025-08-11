import React from 'react';
import type { Task } from '../types';
import PlusIcon from './icons/PlusIcon';

interface AssociatedTasksProps {
  entityType: string;
  entityId: string | number;
  allTasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const AssociatedTasks: React.FC<AssociatedTasksProps> = ({ entityType, entityId, allTasks, onAddTask, onEditTask }) => {
  const associatedTasks = allTasks.filter(task => {
    const typeKey = `${entityType}_id` as keyof Task;
    // The types can be string or number, so == is safer than ===
    return task[typeKey] != null && task[typeKey] == entityId;
  });

  return (
    <div className="pt-4 mt-4 border-t dark:border-slate-600">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200">Associated Tasks</h4>
        <button onClick={onAddTask} className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          <PlusIcon className="w-4 h-4" /> Add Task
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {associatedTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks associated with this item.</p>
        ) : (
          associatedTasks.map(task => (
            <div key={task.id} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{task.title}</p>
                <p className="text-xs text-slate-500">{task.status} - Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <button onClick={() => onEditTask(task)} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssociatedTasks;