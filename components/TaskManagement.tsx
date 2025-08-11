
import React, { useState, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Task, TeamMember } from '../types';
import TaskList from './TaskList';
import PlusIcon from './icons/PlusIcon';

interface TaskManagementProps {
    session: Session;
    team: TeamMember[];
    allTasks: Task[];
    onOpenTaskModal: (task?: Task | null) => void;
    onDeleteTask: (taskId: string) => void;
    onUpdateTask: (task: Task) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ session, team, allTasks, onOpenTaskModal, onDeleteTask, onUpdateTask }) => {
    const [filter, setFilter] = useState<'all' | 'my-tasks'>('all');

    const teamMemberForUser = useMemo(() => {
        return team.find(tm => tm.email.toLowerCase() === session.user.email?.toLowerCase());
    }, [team, session.user.email]);

    const filteredTasks = useMemo(() => {
        if (filter === 'my-tasks' && teamMemberForUser) {
            return allTasks.filter(t => t.assigned_to === teamMemberForUser.id);
        }
        return allTasks;
    }, [allTasks, filter, teamMemberForUser]);
    

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                     <button 
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'all' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        All Tasks
                    </button>
                    <button 
                        onClick={() => setFilter('my-tasks')}
                        disabled={!teamMemberForUser}
                        className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'my-tasks' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-600 dark:text-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={!teamMemberForUser ? "Your email is not associated with a team member." : ""}
                    >
                        My Tasks
                    </button>
                </div>
                <button
                    onClick={() => onOpenTaskModal()}
                    className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon className="w-5 h-5"/> Add Task
                </button>
            </div>
            <div 
                className="flex-grow overflow-x-auto" 
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    minHeight: '400px'
                }}
            >
                <TaskList title="To-Do" tasks={filteredTasks.filter(t => t.status === 'To-Do')} onEdit={onOpenTaskModal} onDelete={onDeleteTask} onUpdate={onUpdateTask} />
                <TaskList title="In Progress" tasks={filteredTasks.filter(t => t.status === 'In Progress')} onEdit={onOpenTaskModal} onDelete={onDeleteTask} onUpdate={onUpdateTask}/>
                <TaskList title="Done" tasks={filteredTasks.filter(t => t.status === 'Done')} onEdit={onOpenTaskModal} onDelete={onDeleteTask} onUpdate={onUpdateTask}/>
            </div>
        </div>
    );
};

export default TaskManagement;