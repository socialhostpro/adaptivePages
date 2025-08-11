
import React from 'react';
import type { Task, TaskStatus, TaskSubtask } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface TaskListProps {
    title: string;
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onUpdate: (task: Task) => void;
}

const getCardClasses = (task: Task): { bg: string, border: string } => {
    const isOverdue = task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
    if (isOverdue && task.status !== 'Done') {
        return { bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-red-400 dark:border-red-600' };
    }
    switch (task.status) {
        case 'To-Do': return { bg: 'bg-orange-100 dark:bg-orange-900/50', border: 'border-orange-400 dark:border-orange-600' };
        case 'In Progress': return { bg: 'bg-blue-100 dark:bg-blue-900/50', border: 'border-blue-400 dark:border-blue-600' };
        case 'Done': return { bg: 'bg-green-100 dark:bg-green-900/50', border: 'border-green-400 dark:border-green-600' };
        default: return { bg: 'bg-white dark:bg-slate-800', border: 'dark:border-slate-700' };
    }
};

const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (taskId: string) => void; onUpdate: (task: Task) => void; }> = ({ task, onEdit, onDelete, onUpdate }) => {
    
    const handleStatusChange = (newStatus: TaskStatus) => {
        onUpdate({ ...task, status: newStatus });
    };

    const handleSubtaskToggle = (subtaskId: string) => {
        const newSubtasks = (task.subtasks || []).map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        onUpdate({ ...task, subtasks: newSubtasks });
    };

    const cardClasses = getCardClasses(task);

    return (
        <div className={`p-4 rounded-lg shadow-sm border ${cardClasses.bg} ${cardClasses.border} group`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 pr-2">{task.title}</h4>
                <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="text-xs font-semibold p-1 rounded-md border-0 bg-transparent dark:bg-slate-800/50 focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
            {task.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{task.description}</p>}
            {task.due_date && <p className="text-xs text-slate-500 mt-2">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
            
            {(task.subtasks || []).length > 0 && (
                <div className="mt-3 pt-3 border-t dark:border-slate-700/50 space-y-2">
                    <h5 className="text-xs font-bold text-slate-500">Sub-tasks</h5>
                    {(task.subtasks || []).map(st => (
                        <label key={st.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <input type="checkbox" checked={st.completed} onChange={() => handleSubtaskToggle(st.id)} className="w-4 h-4 rounded" />
                            <span className={st.completed ? 'line-through text-slate-400' : ''}>{st.text}</span>
                        </label>
                    ))}
                </div>
            )}

            <div className="mt-3 pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(task)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><EditIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
                <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><TrashIcon className="w-4 h-4 text-red-500" /></button>
            </div>
        </div>
    );
};


const TaskList: React.FC<TaskListProps> = ({ title, tasks, onEdit, onDelete, onUpdate }) => {
    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 px-2">{title} ({tasks.length})</h3>
            <div className="space-y-4 overflow-y-auto flex-grow pr-1">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onUpdate={onUpdate} />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
