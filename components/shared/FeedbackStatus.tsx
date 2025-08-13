import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// =============================================================================
// PHASE 5: FEEDBACK & STATUS COMPONENTS
// =============================================================================
// Complete system for user feedback and status indicators:
// - Loading Spinner / Skeleton Loader – For async content
// - Toast Notifications – Success, error, warning, info
// - Modal / Dialog – Reusable for confirmations, forms, or info
// - Alert Banner – Dismissible warning/info banners
// - Progress Bar – Task or upload progress
// =============================================================================

// AI Agent Integration
interface AiCommand {
  type: 'feedback' | 'status' | 'notification' | 'progress';
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
    
    // Toast commands
    if (lowerText.includes('show success')) {
      executeCommand({ type: 'notification', action: 'show', data: { type: 'success', message: 'Operation completed successfully!' } });
    } else if (lowerText.includes('show error')) {
      executeCommand({ type: 'notification', action: 'show', data: { type: 'error', message: 'An error occurred!' } });
    } else if (lowerText.includes('show warning')) {
      executeCommand({ type: 'notification', action: 'show', data: { type: 'warning', message: 'Please review your settings!' } });
    } else if (lowerText.includes('show info')) {
      executeCommand({ type: 'notification', action: 'show', data: { type: 'info', message: 'Here\'s some helpful information!' } });
    }
    
    // Progress commands
    else if (lowerText.includes('start progress')) {
      executeCommand({ type: 'progress', action: 'start', data: { label: 'Processing...', value: 0 } });
    } else if (lowerText.includes('complete progress')) {
      executeCommand({ type: 'progress', action: 'complete', data: { value: 100 } });
    }
    
    // Loading commands
    else if (lowerText.includes('show loading')) {
      executeCommand({ type: 'status', action: 'loading', data: { show: true } });
    } else if (lowerText.includes('hide loading')) {
      executeCommand({ type: 'status', action: 'loading', data: { show: false } });
    }
    
    // Alert commands
    else if (lowerText.includes('show alert')) {
      executeCommand({ type: 'feedback', action: 'alert', data: { type: 'info', message: 'Important system notification!' } });
    } else if (lowerText.includes('hide alert')) {
      executeCommand({ type: 'feedback', action: 'dismiss', target: 'alert' });
    }
    
    // Modal commands
    else if (lowerText.includes('open modal')) {
      executeCommand({ type: 'feedback', action: 'modal', data: { open: true, title: 'AI Opened Modal' } });
    } else if (lowerText.includes('close modal')) {
      executeCommand({ type: 'feedback', action: 'modal', data: { open: false } });
    }
  };

  return { executeCommand, handleVoiceCommand };
};

// =============================================================================
// LOADING SPINNER & SKELETON LOADER
// =============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  aiAgentId?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  aiAgentId
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'loading-spinner',
    capabilities: ['status', 'voice'],
  });

  const sizeClasses = {
    sm: 'loading-spinner-sm',
    md: 'loading-spinner',
    lg: 'loading-spinner-lg',
    xl: 'loading-spinner-xl'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-blue-200',
    secondary: 'border-purple-600 border-t-purple-200',
    white: 'border-white border-t-gray-100',
    gray: 'border-gray-400 border-t-gray-200'
  };

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        const command = prompt('Voice command for Loading Spinner:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} ${colorClasses[color]} rounded-full ${className}`}
      role="status"
      aria-label="Loading"
      style={{
        borderWidth: size === 'sm' ? '1.5px' : size === 'lg' ? '3px' : size === 'xl' ? '4px' : '2px'
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animated?: boolean;
  aiAgentId?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  animated = true,
  aiAgentId
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'skeleton-loader',
    capabilities: ['status', 'voice'],
  });

  const baseClasses = `skeleton-loading ${animated ? '' : 'animate-none'}`;
  
  const variantClasses = {
    text: 'rounded',
    rectangular: '',
    circular: 'rounded-full',
    rounded: 'rounded-lg'
  };

  const getSkeletonStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        const command = prompt('Voice command for Skeleton Loader:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} h-4`}
            style={{
              width: i === lines - 1 ? '75%' : '100%',
              ...getSkeletonStyle()
            }}
          />
        ))}
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${variant === 'text' ? 'h-4' : ''} ${className}`}
      style={getSkeletonStyle()}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    setToasts(prev => {
      const updated = [newToast, ...prev].slice(0, maxToasts);
      return updated;
    });

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, clearAllToasts }}>
      {children}
      <div className={`fixed ${positionClasses[position]} z-50 space-y-2 pointer-events-none`}>
        {toasts.map(toast => (
          <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const typeStyles = {
    success: {
      bg: 'toast-success',
      border: '',
      icon: '✓',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    error: {
      bg: 'toast-error',
      border: '',
      icon: '✕',
      iconColor: 'text-red-600 dark:text-red-400'
    },
    warning: {
      bg: 'toast-warning',
      border: '',
      icon: '⚠',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      bg: 'toast-info',
      border: '',
      icon: 'ℹ',
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  };

  const style = typeStyles[toast.type];

  return (
    <div
      className={`
        ${style.bg} rounded-lg shadow-lg p-4 max-w-sm w-full pointer-events-auto
        toast-slide-in
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${style.iconColor} text-lg mr-3`}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {toast.message}
          </p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// MODAL / DIALOG
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'confirmation' | 'form' | 'info';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  aiAgentId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  aiAgentId
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'modal',
    capabilities: ['feedback', 'voice'],
  });

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleVoice = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        const command = prompt('Voice command for Modal:');
        if (command) handleVoiceCommand(command);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleVoice);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleVoice);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose, handleVoiceCommand]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`
          modal-content ${sizeClasses[size]}
          modal-slide-up
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// ALERT BANNER
// =============================================================================

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  aiAgentId?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  message,
  dismissible = true,
  onDismiss,
  action,
  className = '',
  aiAgentId
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'alert-banner',
    capabilities: ['feedback', 'voice'],
  });

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 200);
  };

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        const command = prompt('Voice command for Alert Banner:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  const typeStyles = {
    info: {
      bg: 'alert-info',
      border: '',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'ℹ'
    },
    warning: {
      bg: 'alert-warning',
      border: '',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: '⚠'
    },
    error: {
      bg: 'alert-error',
      border: '',
      text: 'text-red-800 dark:text-red-200',
      icon: '✕'
    },
    success: {
      bg: 'alert-success',
      border: '',
      text: 'text-green-800 dark:text-green-200',
      icon: '✓'
    }
  };

  const style = typeStyles[type];

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${style.bg} rounded-lg p-4 alert-slide-down
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${style.text} text-lg mr-3`}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-medium ${style.text} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${style.text}`}>
            {message}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${style.text} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`ml-4 flex-shrink-0 ${style.text} hover:opacity-75`}
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  variant?: 'default' | 'striped' | 'animated';
  className?: string;
  aiAgentId?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  variant = 'default',
  className = '',
  aiAgentId
}) => {
  const { handleVoiceCommand } = useAiAgent({
    agentId: aiAgentId || 'progress-bar',
    capabilities: ['progress', 'voice'],
  });

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'progress-blue',
    green: 'progress-green',
    yellow: 'progress-yellow',
    red: 'progress-red',
    purple: 'progress-purple',
    indigo: 'progress-indigo'
  };

  // Voice command listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        const command = prompt('Voice command for Progress Bar:');
        if (command) handleVoiceCommand(command);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceCommand]);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div 
        className={`progress-bar-bg ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={`
            ${colorClasses[color]} ${sizeClasses[size]} rounded-full progress-fill
            ${variant === 'striped' ? 'progress-striped' : ''}
            ${variant === 'animated' ? 'progress-animated' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Value indicator */}
      {label && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// COMPREHENSIVE DEMO COMPONENT
// =============================================================================

export const FeedbackStatusDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [alertVisible, setAlertVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();

  // Progress simulation
  useEffect(() => {
    if (progressValue > 0 && progressValue < 100) {
      const timer = setTimeout(() => {
        setProgressValue(prev => Math.min(100, prev + 10));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progressValue]);

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'Please review your settings before proceeding.',
      info: 'New features are now available!'
    };

    showToast({
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message: messages[type],
      action: {
        label: 'View Details',
        onClick: () => alert(`${type} action clicked`)
      }
    });
  };

  const startProgress = () => {
    setProgressValue(10);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Phase 5: Feedback & Status Components
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete system for user feedback and status indicators with AI integration
        </p>
      </div>

      {/* Loading Spinners */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Spinners</h2>
        <div className="flex items-center space-x-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="sm" />
            <p className="text-sm mt-2">Small</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="text-sm mt-2">Medium</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-sm mt-2">Large</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="xl" color="secondary" />
            <p className="text-sm mt-2">Extra Large</p>
          </div>
        </div>
      </section>

      {/* Skeleton Loaders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Skeleton Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3">Text Lines</h3>
            <SkeletonLoader variant="text" lines={3} />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3">Shapes</h3>
            <div className="space-y-3">
              <SkeletonLoader variant="rectangular" width="100%" height="80px" />
              <div className="flex space-x-3">
                <SkeletonLoader variant="circular" width="60px" height="60px" />
                <SkeletonLoader variant="text" lines={2} className="flex-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notifications */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Toast Notifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleShowToast('success')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Success Toast
          </button>
          <button
            onClick={() => handleShowToast('error')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Error Toast
          </button>
          <button
            onClick={() => handleShowToast('warning')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Warning Toast
          </button>
          <button
            onClick={() => handleShowToast('info')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Info Toast
          </button>
        </div>
      </section>

      {/* Modal Dialog */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Modal Dialog</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Modal
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          size="md"
          footer={
            <>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast({ type: 'success', message: 'Modal action completed!' });
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This is an example modal dialog with AI integration. You can use voice commands
              to control modal behavior.
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Voice Commands:</strong> Try saying "close modal" or use Ctrl+Shift+M
              </p>
            </div>
          </div>
        </Modal>
      </section>

      {/* Alert Banner */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Alert Banners</h2>
        <div className="space-y-3">
          {alertVisible && (
            <AlertBanner
              type="info"
              title="System Update"
              message="New features have been added to improve your experience. Check out the changelog for details."
              onDismiss={() => setAlertVisible(false)}
              action={{
                label: 'View Changelog',
                onClick: () => alert('Opening changelog...')
              }}
            />
          )}
          <AlertBanner
            type="warning"
            message="Your session will expire in 5 minutes. Please save your work."
            dismissible={false}
          />
          <AlertBanner
            type="success"
            title="Data Saved"
            message="Your changes have been successfully saved to the cloud."
          />
        </div>
      </section>

      {/* Progress Bars */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Progress Bars</h2>
        <div className="space-y-6">
          <div>
            <button
              onClick={startProgress}
              disabled={progressValue > 0 && progressValue < 100}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {progressValue === 0 ? 'Start Progress' : progressValue === 100 ? 'Reset Progress' : 'In Progress...'}
            </button>
            <ProgressBar
              value={progressValue}
              label="Upload Progress"
              color="green"
              className="mb-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Different Sizes</h3>
              <div className="space-y-3">
                <ProgressBar value={75} size="sm" label="Small" color="blue" />
                <ProgressBar value={60} size="md" label="Medium" color="purple" />
                <ProgressBar value={85} size="lg" label="Large" color="indigo" />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Different Colors</h3>
              <div className="space-y-3">
                <ProgressBar value={40} color="red" label="Error State" />
                <ProgressBar value={70} color="yellow" label="Warning State" />
                <ProgressBar value={90} color="green" label="Success State" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading States</h2>
        <div className="space-y-4">
          <button
            onClick={simulateLoading}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Loading...
              </>
            ) : (
              'Simulate Loading'
            )}
          </button>

          {loading && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">Content Loading...</h3>
              <SkeletonLoader variant="text" lines={4} />
            </div>
          )}
        </div>
      </section>

      {/* AI Voice Commands */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Voice Commands</h2>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Available Commands:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li><strong>Ctrl+Shift+V:</strong> Voice commands for Loading Spinner</li>
            <li><strong>Ctrl+Shift+S:</strong> Voice commands for Skeleton Loader</li>
            <li><strong>Ctrl+Shift+M:</strong> Voice commands for Modal</li>
            <li><strong>Ctrl+Shift+A:</strong> Voice commands for Alert Banner</li>
            <li><strong>Ctrl+Shift+P:</strong> Voice commands for Progress Bar</li>
          </ul>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
            Try commands like: "show success", "start progress", "open modal", "show loading"
          </p>
        </div>
      </section>
    </div>
  );
};

export default FeedbackStatusDemo;
