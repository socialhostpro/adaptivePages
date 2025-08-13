import React, { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';

// =============================================================================
// PHASE 6: USER INTERACTION COMPONENTS
// =============================================================================
// Complete system for user interactions and interface controls:
// - Profile Dropdown / User Menu – Account settings, logout
// - Activity List – Everything going on 
// - Notifications Panel – List of recent alerts/messages
// - Filter & Sort Controls – For table/grid data
// - Tag / Badge Component – Status indicators, labels
// - Pagination Controls – Consistent page navigation UI
// =============================================================================

// AI Agent Integration
interface AiCommand {
  type: 'interaction' | 'navigation' | 'filter' | 'notification' | 'activity';
  action: string;
  target?: string;
  data?: any;
}

interface AiAgentConfig {
  agentId: string;
  capabilities: string[];
  onCommand?: (command: AiCommand) => void;
}

const useAiAgent = (config: AiAgentConfig) => {
  const executeCommand = async (command: AiCommand) => {
    console.log(`[AI Agent ${config.agentId}] Executing:`, command);
    config.onCommand?.(command);
  };

  const handleVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Profile menu commands
    if (lowerText.includes('open profile')) {
      executeCommand({ type: 'interaction', action: 'open', target: 'profile-menu' });
    } else if (lowerText.includes('logout') || lowerText.includes('sign out')) {
      executeCommand({ type: 'interaction', action: 'logout' });
    } else if (lowerText.includes('account settings')) {
      executeCommand({ type: 'interaction', action: 'open', target: 'account-settings' });
    }
    
    // Notifications commands
    else if (lowerText.includes('show notifications')) {
      executeCommand({ type: 'notification', action: 'open' });
    } else if (lowerText.includes('mark all read')) {
      executeCommand({ type: 'notification', action: 'mark-all-read' });
    } else if (lowerText.includes('clear notifications')) {
      executeCommand({ type: 'notification', action: 'clear-all' });
    }
    
    // Activity commands
    else if (lowerText.includes('show activity')) {
      executeCommand({ type: 'activity', action: 'show' });
    } else if (lowerText.includes('filter activity')) {
      executeCommand({ type: 'activity', action: 'filter' });
    }
    
    // Filter and sort commands
    else if (lowerText.includes('sort by')) {
      const field = lowerText.split('sort by ')[1]?.split(' ')[0];
      executeCommand({ type: 'filter', action: 'sort', data: { field } });
    } else if (lowerText.includes('filter by')) {
      const criteria = lowerText.split('filter by ')[1];
      executeCommand({ type: 'filter', action: 'filter', data: { criteria } });
    } else if (lowerText.includes('clear filters')) {
      executeCommand({ type: 'filter', action: 'clear' });
    }
    
    // Pagination commands
    else if (lowerText.includes('next page')) {
      executeCommand({ type: 'navigation', action: 'next-page' });
    } else if (lowerText.includes('previous page')) {
      executeCommand({ type: 'navigation', action: 'prev-page' });
    } else if (lowerText.includes('first page')) {
      executeCommand({ type: 'navigation', action: 'first-page' });
    } else if (lowerText.includes('last page')) {
      executeCommand({ type: 'navigation', action: 'last-page' });
    }
  };

  return { executeCommand, handleVoiceCommand };
};

// =============================================================================
// PROFILE DROPDOWN / USER MENU
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

interface ProfileDropdownProps {
  user: User;
  onAccountSettings?: () => void;
  onProfileEdit?: () => void;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  menuItems?: MenuItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  aiAgentId?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  separator?: boolean;
  danger?: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onAccountSettings,
  onProfileEdit,
  onLogout,
  onThemeToggle,
  menuItems = [],
  position = 'bottom-right',
  aiAgentId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'profile-dropdown',
    capabilities: ['interaction', 'voice'],
  });

  // Default menu items
  const defaultItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: '👤',
      onClick: onProfileEdit || (() => {})
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: '⚙️',
      onClick: onAccountSettings || (() => {})
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      icon: '🌙',
      onClick: onThemeToggle || (() => {})
    },
    {
      id: 'separator1',
      label: '',
      separator: true,
      onClick: () => {}
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: '🚪',
      onClick: onLogout || (() => {}),
      danger: true
    }
  ];

  const allItems = [...defaultItems, ...menuItems];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleVoice = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        const command = prompt('Voice command for Profile Menu:');
        if (command) handleVoiceCommand(command);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    document.addEventListener('keydown', handleVoice);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleVoice);
    };
  }, [isOpen, handleVoiceCommand]);

  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2'
  };

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-400'
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Profile Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          {user.status && (
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)}`} />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.name}
          </div>
          {user.role && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {user.role}
            </div>
          )}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${positionClasses[position]} w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50`}>
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {user.status && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
                {user.role && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {user.role}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {allItems.map((item) => (
              item.separator ? (
                <div key={item.id} className="border-t border-gray-200 dark:border-gray-700 my-1" />
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    item.danger 
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.icon && (
                    <span className="mr-3 text-base">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ACTIVITY LIST
// =============================================================================

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'comment' | 'share' | 'like' | 'view' | 'download' | 'upload';
  title: string;
  description?: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  metadata?: {
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    location?: string;
    ip?: string;
    device?: string;
  };
  important?: boolean;
}

interface ActivityListProps {
  activities: ActivityItem[];
  title?: string;
  showHeader?: boolean;
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  groupByDate?: boolean;
  filterType?: string;
  onFilterChange?: (type: string) => void;
  aiAgentId?: string;
  className?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  title = 'Recent Activity',
  showHeader = true,
  maxItems,
  showLoadMore = false,
  onLoadMore,
  loading = false,
  emptyMessage = 'No activity found',
  groupByDate = true,
  filterType,
  onFilterChange,
  aiAgentId,
  className = ''
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'activity-list',
    capabilities: ['activity', 'voice'],
  });

  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;
  const hasMore = maxItems ? activities.length > maxItems : false;

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        const command = prompt('Voice command for Activity List:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  const getActivityIcon = (type: string) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      comment: '💬',
      share: '🔗',
      like: '❤️',
      view: '👁️',
      download: '⬇️',
      upload: '⬆️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      create: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      update: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      delete: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      login: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      comment: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      share: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      like: 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
      view: 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
      download: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      upload: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return colors[type as keyof typeof colors] || colors.view;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const groupedActivities = groupByDate
    ? displayedActivities.reduce((acc, activity) => {
        const dateKey = activity.timestamp.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(activity);
        return acc;
      }, {} as Record<string, ActivityItem[]>)
    : { 'All Activities': displayedActivities };

  const filterTypes = ['all', 'create', 'update', 'delete', 'login', 'comment', 'share'];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {showHeader && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {onFilterChange && (
              <select
                value={filterType || 'all'}
                onChange={(e) => onFilterChange(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {filterTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {displayedActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([dateKey, items]) => (
            <div key={dateKey}>
              {groupByDate && dateKey !== 'All Activities' && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {dateKey === new Date().toDateString() ? 'Today' : dateKey}
                  </h4>
                </div>
              )}
              
              {items.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    activity.important ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Activity Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activity.title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      )}

                      <div className="flex items-center mt-2 space-x-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-2">
                          {activity.user.avatar ? (
                            <img
                              src={activity.user.avatar}
                              alt={activity.user.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                              {activity.user.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.user.name}
                          </span>
                        </div>

                        {/* Metadata */}
                        {activity.metadata && (
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            {activity.metadata.resourceType && (
                              <span>{activity.metadata.resourceType}</span>
                            )}
                            {activity.metadata.location && (
                              <span>• {activity.metadata.location}</span>
                            )}
                            {activity.metadata.device && (
                              <span>• {activity.metadata.device}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {(showLoadMore || hasMore) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// NOTIFICATIONS PANEL
// =============================================================================

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  avatar?: string;
  metadata?: {
    userId?: string;
    resourceId?: string;
    resourceType?: string;
  };
}

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
  position?: 'left' | 'right';
  maxHeight?: string;
  showHeader?: boolean;
  aiAgentId?: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  position = 'right',
  maxHeight = '32rem',
  showHeader = true,
  aiAgentId
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'notifications-panel',
    capabilities: ['notification', 'voice'],
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleVoice = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        const command = prompt('Voice command for Notifications:');
        if (command) handleVoiceCommand(command);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    document.addEventListener('keydown', handleVoice);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleVoice);
    };
  }, [isOpen, onClose, handleVoiceCommand]);

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      mention: '👤',
      message: '💬',
      system: '⚙️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      success: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      error: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      mention: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      message: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      system: 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const positionClasses = position === 'right' 
    ? 'right-0' 
    : 'left-0';

  return (
    <div 
      ref={panelRef}
      className={`fixed top-16 ${positionClasses} w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 m-4`}
      style={{ maxHeight }}
    >
      {/* Header */}
      {showHeader && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Mark all read
              </button>
              <button
                onClick={onClearAll}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔔</div>
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
              onClick={() => {
                onNotificationClick(notification);
                if (!notification.read) {
                  onMarkAsRead(notification.id);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                {/* Icon or Avatar */}
                <div className="flex-shrink-0">
                  {notification.avatar ? (
                    <img
                      src={notification.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {notification.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  {notification.actionLabel && (
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2">
                      {notification.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default {
  ProfileDropdown,
  ActivityList,
  NotificationsPanel
};
