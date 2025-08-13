/**
 * KanbanBoard Component - For task or workflow visualization
 * Part of the AdaptivePages Shared Component System
 */

import React, { useState, useCallback, useRef } from 'react';

// Types
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  tags?: Array<{
    label: string;
    color?: string;
  }>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  attachments?: number;
  comments?: number;
  metadata?: Record<string, any>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  limit?: number;
  collapsed?: boolean;
}

export interface KanbanBoardProps {
  // Data
  columns: KanbanColumn[];
  
  // Events
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onCardClick?: (card: KanbanCard) => void;
  onColumnAdd?: () => void;
  onColumnEdit?: (columnId: string) => void;
  onColumnDelete?: (columnId: string) => void;
  onCardAdd?: (columnId: string) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
  
  // Features
  editable?: boolean;
  collapsible?: boolean;
  
  // Styling
  className?: string;
  
  // AI Integration
  aiAgentId?: string;
}

export interface KanbanCardProps {
  card: KanbanCard;
  columnId: string;
  index: number;
  onMove?: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onClick?: (card: KanbanCard) => void;
  onEdit?: (card: KanbanCard) => void;
  onDelete?: (cardId: string) => void;
  editable?: boolean;
  dragging?: boolean;
}

// Priority colors
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
    case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
    case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
    default: return 'border-l-gray-300 bg-white dark:bg-gray-800';
  }
};

// Format date
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `${days}d left`;
  return `${Math.abs(days)}d overdue`;
};

function KanbanCardComponent({
  card,
  columnId,
  index,
  onMove,
  onClick,
  onEdit,
  onDelete,
  editable = false,
  dragging = false
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card.id,
      fromColumnId: columnId,
      fromIndex: index
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, [card.id, columnId, index]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick?.(card);
  }, [onClick, card]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(card);
  }, [onEdit, card]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(card.id);
  }, [onDelete, card.id]);

  const isOverdue = card.dueDate && card.dueDate < new Date();

  return (
    <div
      ref={dragRef}
      draggable={editable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`kanban-card p-4 mb-3 border-l-4 rounded-md shadow-sm cursor-pointer transition-all duration-200 ${
        getPriorityColor(card.priority)
      } ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:shadow-md'} ${
        dragging ? 'transform-gpu' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-5 line-clamp-2">
          {card.title}
        </h3>
        {editable && (
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Edit card"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete card"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
          {card.description}
        </p>
      )}

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : {}}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Due Date */}
      {card.dueDate && (
        <div className={`text-xs mb-3 ${
          isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'
        }`}>
          📅 {formatDate(card.dueDate)}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center">
          {card.assignee && (
            <div className="flex items-center space-x-2">
              {card.assignee.avatar ? (
                <img
                  src={card.assignee.avatar}
                  alt={card.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                  {card.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {card.assignee.name}
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
          {card.attachments && card.attachments > 0 && (
            <span className="flex items-center space-x-1">
              <span>📎</span>
              <span>{card.attachments}</span>
            </span>
          )}
          {card.comments && card.comments > 0 && (
            <span className="flex items-center space-x-1">
              <span>💬</span>
              <span>{card.comments}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumnComponent({
  column,
  onCardMove,
  onCardClick,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  onColumnEdit,
  onColumnDelete,
  editable
}: {
  column: KanbanColumn;
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardAdd?: (columnId: string) => void;
  onCardEdit?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string) => void;
  onColumnEdit?: (columnId: string) => void;
  onColumnDelete?: (columnId: string) => void;
  editable?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [collapsed, setCollapsed] = useState(column.collapsed || false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only remove drag over state if leaving the column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { cardId, fromColumnId, fromIndex } = dragData;
      
      if (fromColumnId !== column.id) {
        // Calculate drop index based on drop position
        const dropIndex = column.cards.length;
        onCardMove?.(cardId, fromColumnId, column.id, dropIndex);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [column.id, column.cards.length, onCardMove]);

  const isLimitExceeded = column.limit && column.cards.length >= column.limit;

  return (
    <div
      className={`kanban-column bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-96 w-80 flex-shrink-0 ${
        isDragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {collapsed ? '▶️' : '▼'}
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            {column.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
            )}
            <span>{column.title}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({column.cards.length}{column.limit ? `/${column.limit}` : ''})
            </span>
          </h2>
        </div>
        
        {editable && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onCardAdd?.(column.id)}
              disabled={isLimitExceeded}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add card"
            >
              ➕
            </button>
            <button
              onClick={() => onColumnEdit?.(column.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Edit column"
            >
              ⚙️
            </button>
            <button
              onClick={() => onColumnDelete?.(column.id)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete column"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Limit Warning */}
      {isLimitExceeded && (
        <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded text-yellow-800 dark:text-yellow-400 text-xs">
          ⚠️ Column limit reached ({column.limit})
        </div>
      )}

      {/* Cards */}
      {!collapsed && (
        <div className="space-y-0">
          {column.cards.map((card, index) => (
            <KanbanCardComponent
              key={card.id}
              card={card}
              columnId={column.id}
              index={index}
              onMove={onCardMove}
              onClick={onCardClick}
              onEdit={onCardEdit}
              onDelete={onCardDelete}
              editable={editable}
            />
          ))}
          
          {/* Drop Zone */}
          {editable && column.cards.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
              Drop cards here or click + to add
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function KanbanBoard({
  columns,
  onCardMove,
  onCardClick,
  onColumnAdd,
  onColumnEdit,
  onColumnDelete,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  editable = false,
  collapsible = true,
  className = '',
  aiAgentId
}: KanbanBoardProps) {
  
  // Statistics
  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);
  const cardsByPriority = columns.reduce((acc, col) => {
    col.cards.forEach(card => {
      const priority = card.priority || 'none';
      acc[priority] = (acc[priority] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`kanban-board ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kanban Board
          </h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{totalCards} total cards</span>
            <span>{columns.length} columns</span>
            {cardsByPriority.urgent && (
              <span className="text-red-600 dark:text-red-400">
                {cardsByPriority.urgent} urgent
              </span>
            )}
          </div>
        </div>
        
        {editable && (
          <button
            onClick={onColumnAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Column
          </button>
        )}
      </div>

      {/* Board */}
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            onCardMove={onCardMove}
            onCardClick={onCardClick}
            onCardAdd={onCardAdd}
            onCardEdit={onCardEdit}
            onCardDelete={onCardDelete}
            onColumnEdit={onColumnEdit}
            onColumnDelete={onColumnDelete}
            editable={editable}
          />
        ))}
        
        {/* Add Column Placeholder */}
        {editable && (
          <div className="w-80 flex-shrink-0">
            <button
              onClick={onColumnAdd}
              className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">➕</div>
                <div>Add Column</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
