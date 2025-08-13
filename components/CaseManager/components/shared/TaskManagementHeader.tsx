/**
 * Task Management Header - Example Integration with New Button Components
 * This shows how to replace existing button elements with our new shared Button components
 */
import React from 'react';
import { Plus, Search, Filter, Download, MoreVertical } from 'lucide-react';
import { 
  Button, 
  IconButton, 
  ButtonGroup, 
  DropdownButton,
  DropdownItem 
} from './index';

interface TaskManagementHeaderProps {
  onCreateTask: () => void;
  onSearch: (query: string) => void;
  onFilter: () => void;
  onExport: () => void;
  onBulkAction: (action: string) => void;
}

export const TaskManagementHeader: React.FC<TaskManagementHeaderProps> = ({
  onCreateTask,
  onSearch,
  onFilter,
  onExport,
  onBulkAction
}) => {
  const bulkActions: DropdownItem[] = [
    {
      key: 'mark-complete',
      label: 'Mark as Complete',
      onClick: () => onBulkAction('complete')
    },
    {
      key: 'assign',
      label: 'Assign to...',
      onClick: () => onBulkAction('assign')
    },
    {
      key: 'change-priority',
      label: 'Change Priority',
      onClick: () => onBulkAction('priority')
    },
    {
      key: 'divider',
      label: '',
      divider: true,
      onClick: () => {}
    },
    {
      key: 'delete',
      label: 'Delete Tasks',
      onClick: () => onBulkAction('delete')
    }
  ];

  const exportActions: DropdownItem[] = [
    {
      key: 'csv',
      label: 'Export as CSV',
      onClick: () => onExport()
    },
    {
      key: 'pdf',
      label: 'Export as PDF',
      onClick: () => onExport()
    },
    {
      key: 'excel',
      label: 'Export as Excel',
      onClick: () => onExport()
    }
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600">
      {/* Left side - Title and main actions */}
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Task Management
        </h2>
        
        <ButtonGroup>
          <Button 
            variant="primary" 
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreateTask}
          >
            New Task
          </Button>
          
          <IconButton 
            variant="secondary"
            icon={<Filter className="w-4 h-4" />}
            onClick={onFilter}
            aria-label="Filter tasks"
          />
        </ButtonGroup>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Export dropdown */}
        <DropdownButton
          variant="secondary"
          styleVariant="outline"
          items={exportActions}
          icon={<Download className="w-4 h-4" />}
        >
          Export
        </DropdownButton>

        {/* Bulk actions */}
        <DropdownButton
          variant="secondary"
          styleVariant="ghost"
          items={bulkActions}
          icon={<MoreVertical className="w-4 h-4" />}
          showArrow={false}
          aria-label="Bulk actions"
        />
      </div>
    </div>
  );
};

/**
 * Task Action Buttons - Example for task row actions
 */
interface TaskActionButtonsProps {
  taskId: string;
  status: string;
  onEdit: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({
  taskId,
  status,
  onEdit,
  onComplete,
  onDelete
}) => {
  const isCompleted = status === 'Complete';

  return (
    <ButtonGroup size="sm">
      <Button
        size="sm"
        variant={isCompleted ? "success" : "primary"}
        styleVariant="outline"
        onClick={() => onComplete(taskId)}
        disabled={isCompleted}
      >
        {isCompleted ? 'Completed' : 'Complete'}
      </Button>
      
      <Button
        size="sm"
        variant="secondary"
        styleVariant="ghost"
        onClick={() => onEdit(taskId)}
      >
        Edit
      </Button>
      
      <Button
        size="sm"
        variant="danger"
        styleVariant="ghost"
        onClick={() => onDelete(taskId)}
      >
        Delete
      </Button>
    </ButtonGroup>
  );
};

/**
 * Task Status Action Buttons - Example for quick status changes
 */
interface TaskStatusActionsProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const TaskStatusActions: React.FC<TaskStatusActionsProps> = ({
  currentStatus,
  onStatusChange
}) => {
  const statusOptions = [
    { key: 'todo', label: 'To Do', variant: 'secondary' as const },
    { key: 'in-progress', label: 'In Progress', variant: 'warning' as const },
    { key: 'complete', label: 'Complete', variant: 'success' as const },
    { key: 'blocked', label: 'Blocked', variant: 'danger' as const }
  ];

  return (
    <ButtonGroup connected>
      {statusOptions.map((option) => (
        <Button
          key={option.key}
          size="sm"
          variant={currentStatus === option.label ? option.variant : 'secondary'}
          styleVariant={currentStatus === option.label ? 'solid' : 'outline'}
          onClick={() => onStatusChange(option.label)}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default TaskManagementHeader;
