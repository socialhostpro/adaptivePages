'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, MoreHorizontal, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { StatusBadge, DateDisplay, PermissionGate } from './common';
import { Select, Input, Checkbox } from './shared/FormComponents';
import { CaseTask } from '../types';
import { getCurrentUser } from '../utils/permissions';

// Mock data
const mockTasks: CaseTask[] = [
  {
    id: 'task-1',
    caseId: 'CASE-2025-000317',
    title: 'Request medical records from Hospital A',
    description: 'Need complete medical records from patient\'s visit on November 1st',
    status: 'In Progress',
    priority: 'High',
    assigneeId: 'para-1',
    assigneeName: 'Maria Garcia',
    dueAt: '2025-01-20T00:00:00Z',
    notes: 'Called hospital, waiting for records department callback',
    watchers: ['atty-1'],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-12T14:30:00Z'
  },
  {
    id: 'task-2',
    caseId: 'CASE-2025-000317',
    title: 'Draft discovery requests',
    description: 'Prepare interrogatories and document requests for opposing party',
    status: 'Todo',
    priority: 'Medium',
    assigneeId: 'atty-1',
    assigneeName: 'Sarah Wilson',
    dueAt: '2025-01-25T00:00:00Z',
    notes: '',
    watchers: [],
    createdAt: '2025-01-08T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z'
  },
  {
    id: 'task-3',
    caseId: 'CASE-2025-000317',
    title: 'Schedule client deposition',
    description: 'Coordinate with opposing counsel for client deposition scheduling',
    status: 'Blocked',
    priority: 'High',
    assigneeId: 'para-1',
    assigneeName: 'Maria Garcia',
    dueAt: '2025-01-18T00:00:00Z',
    notes: 'Waiting for opposing counsel availability',
    watchers: ['atty-1'],
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-10T09:15:00Z'
  },
  {
    id: 'task-4',
    caseId: 'CASE-2025-000317',
    title: 'File motion for summary judgment',
    description: 'Complete motion for summary judgment based on medical evidence',
    status: 'Done',
    priority: 'High',
    assigneeId: 'atty-1',
    assigneeName: 'Sarah Wilson',
    dueAt: '2025-01-15T00:00:00Z',
    notes: 'Filed successfully on 1/14/25',
    watchers: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-14T16:45:00Z'
  }
];

interface TaskManagementProps {
  caseId: string;
}

export function TaskManagement({ caseId }: TaskManagementProps) {
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const user = getCurrentUser();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, [caseId]);

  const statuses = ['Todo', 'In Progress', 'Blocked', 'Done', 'Canceled'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const assignees = [...new Set(tasks.map(task => task.assigneeId).filter(Boolean))]
    .map(id => {
      const task = tasks.find(t => t.assigneeId === id);
      return { id, name: task?.assigneeName || 'Unknown' };
    });
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesAssignee = !assigneeFilter || task.assigneeId === assigneeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<string, CaseTask[]>);

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on tasks:`, selectedTasks);
    setSelectedTasks([]);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const isOverdue = (dueAt: string) => {
    return new Date(dueAt) < new Date() && !['Done', 'Canceled'].includes('status');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {tasks.length} total tasks • {tasks.filter(t => t.status === 'Done').length} completed
        </p>
      </div>
      
      <div className="flex space-x-2">
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm font-medium border ${
              viewMode === 'list' 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            } rounded-l-md`}
            title="List view"
          >
            List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-2 text-sm font-medium border-t border-r border-b ${
              viewMode === 'kanban' 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            } rounded-r-md`}
            title="Kanban view"
          >
            Kanban
          </button>
        </div>          <PermissionGate permission="manage_tasks" userRole={user.role}>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <Input
                type="search"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10"
                aria-label="Search tasks"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statuses.map(status => ({ value: status, label: status }))}
              placeholder="All Status"
              aria-label="Filter by status"
            />
            
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={priorities.map(priority => ({ value: priority, label: priority }))}
              placeholder="All Priority"
              aria-label="Filter by priority"
            />
            
            <Select
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              options={assignees.map(assignee => ({ value: assignee.id, label: assignee.name }))}
              placeholder="All Assignees"
              aria-label="Filter by assignee"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <PermissionGate permission="manage_tasks" userRole={user.role}>
                <button
                  onClick={() => handleBulkAction('assign')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  <User className="h-4 w-4 mr-1" />
                  Assign
                </button>
                
                <button
                  onClick={() => handleBulkAction('status')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  Change Status
                </button>
                
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  Delete
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>
      )}

      {/* Task Views */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all tasks"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleSelectTask(task.id)}
                      aria-label={`Select ${task.title}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                        )}
                        {task.notes && (
                          <div className="text-xs text-gray-400 mt-1 italic">{task.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PermissionGate permission="manage_tasks" userRole={user.role} fallback={
                      <StatusBadge status={task.status} type="task" />
                    }>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-sm border-0 bg-transparent focus:ring-0 font-medium"
                        title="Change status"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </PermissionGate>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={task.priority} type="priority" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assigneeName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.dueAt ? (
                      <div className={isOverdue(task.dueAt) ? 'text-red-600' : 'text-gray-500'}>
                        <DateDisplay date={task.dueAt} />
                        {isOverdue(task.dueAt) && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No due date</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <PermissionGate permission="manage_tasks" userRole={user.role}>
                      <button className="text-gray-400 hover:text-gray-600" title="More actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || priorityFilter || assigneeFilter
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by creating your first task.'}
              </p>
              <PermissionGate permission="manage_tasks" userRole={user.role}>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </button>
                </div>
              </PermissionGate>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map(status => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">{status}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {tasksByStatus[status]?.length || 0}
                </span>
              </div>
              
              <div className="space-y-3">
                {tasksByStatus[status]?.map(task => (
                  <div key={task.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex-1">{task.title}</h4>
                      <StatusBadge status={task.priority} type="priority" />
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>{task.assigneeName || 'Unassigned'}</span>
                      {task.dueAt && (
                        <span className={isOverdue(task.dueAt) ? 'text-red-600 dark:text-red-400' : ''}>
                          <DateDisplay date={task.dueAt} />
                        </span>
                      )}
                    </div>
                    
                    {task.notes && (
                      <div className="mt-2 text-xs text-gray-400 dark:text-slate-500 italic">{task.notes}</div>
                    )}
                  </div>
                ))}
                
                {tasksByStatus[status]?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400">No {status.toLowerCase()} tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            <p className="text-sm text-gray-500 mb-4">
              Task creation form would be implemented here with fields for title, description, 
              assignee, due date, priority, and other task metadata.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
