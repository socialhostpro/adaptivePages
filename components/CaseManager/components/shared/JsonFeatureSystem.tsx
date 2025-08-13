/**
 * JSON-Driven Feature System
 * Allows creating entire features and pages through JSON configuration
 */
import React, { ReactNode, useMemo } from 'react';
import { ResponsiveLayout, LayoutConfig, FeatureConfig, ComponentConfig } from './ResponsiveLayout';
import { cn } from './utils';

// Import all shared components that can be used in JSON configs
import { Button, IconButton, ButtonGroup, DropdownButton } from './ButtonComponents';
import { Input, Textarea, Select, Checkbox } from './FormComponents';

export interface JsonFeatureSystemProps {
  config: JsonFeatureConfig;
  data?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  onAction?: (action: string, payload?: any) => void;
}

export interface JsonFeatureConfig {
  id: string;
  name: string;
  version: string;
  description?: string;
  layout: LayoutConfig;
  features: FeatureConfig[];
  globalStyles?: string[];
  globalScripts?: string[];
  permissions?: PermissionConfig[];
  workflows?: WorkflowConfig[];
  integrations?: IntegrationConfig[];
}

export interface PermissionConfig {
  id: string;
  name: string;
  description: string;
  actions: string[];
  conditions?: any[];
}

export interface WorkflowConfig {
  id: string;
  name: string;
  trigger: TriggerConfig;
  steps: WorkflowStep[];
  conditions?: any[];
}

export interface TriggerConfig {
  type: 'user_action' | 'data_change' | 'schedule' | 'api_call';
  event: string;
  conditions?: any[];
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'notification' | 'api_call';
  config: any;
  nextStep?: string;
  errorStep?: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'database' | 'webhook' | 'service';
  config: any;
  endpoints?: EndpointConfig[];
}

export interface EndpointConfig {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  auth?: AuthConfig;
}

export interface AuthConfig {
  type: 'bearer' | 'api_key' | 'basic' | 'oauth';
  config: any;
}

// Component registry for JSON-driven rendering
const COMPONENT_REGISTRY = {
  // Form Components
  Input,
  Textarea,
  Select,
  Checkbox,
  
  // Button Components
  Button,
  IconButton,
  ButtonGroup,
  DropdownButton,
  
  // Layout Components
  Grid: ({ children, className, cols = 1, gap = 4, ...props }: any) => (
    <div className={cn(`grid grid-cols-${cols} gap-${gap}`, className)} {...props}>
      {children}
    </div>
  ),
  
  Card: ({ children, className, title, ...props }: any) => (
    <div className={cn('bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6', className)} {...props}>
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>}
      {children}
    </div>
  ),
  
  Table: ({ children, className, headers = [], data = [], ...props }: any) => (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700" {...props}>
        {headers.length > 0 && (
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {headers.map((header: string, index: number) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  ),
  
  Modal: ({ children, className, isOpen = false, onClose, title, ...props }: any) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className={cn(
            'inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-900 shadow-xl rounded-lg',
            className
          )} {...props}>
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
                <button 
                  onClick={onClose} 
                  aria-label="Close modal"
                  title="Close modal"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  },
  
  Text: ({ children, className, variant = 'body', ...props }: any) => {
    const variants = {
      h1: 'text-3xl font-bold text-gray-900 dark:text-white',
      h2: 'text-2xl font-semibold text-gray-900 dark:text-white',
      h3: 'text-xl font-medium text-gray-900 dark:text-white',
      h4: 'text-lg font-medium text-gray-900 dark:text-white',
      body: 'text-gray-700 dark:text-gray-300',
      caption: 'text-sm text-gray-500 dark:text-gray-400',
      label: 'text-sm font-medium text-gray-700 dark:text-gray-300'
    };
    
    return (
      <p className={cn(variants[variant as keyof typeof variants], className)} {...props}>
        {children}
      </p>
    );
  },
  
  Image: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={cn('max-w-full h-auto', className)} {...props} />
  ),
  
  List: ({ children, className, ordered = false, ...props }: any) => {
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag className={cn(ordered ? 'list-decimal' : 'list-disc', 'list-inside space-y-1', className)} {...props}>
        {children}
      </Tag>
    );
  },
  
  ListItem: ({ children, className, ...props }: any) => (
    <li className={cn('text-gray-700 dark:text-gray-300', className)} {...props}>
      {children}
    </li>
  )
};

/**
 * Main JSON Feature System Component
 */
export const JsonFeatureSystem: React.FC<JsonFeatureSystemProps> = ({
  config,
  data = {},
  onDataChange,
  onAction
}) => {
  const [currentFeature, setCurrentFeature] = React.useState<string | null>(null);
  const [localData, setLocalData] = React.useState(data);

  const updateData = React.useCallback((newData: Record<string, any>) => {
    setLocalData(newData);
    onDataChange?.(newData);
  }, [onDataChange]);

  const handleAction = React.useCallback((action: string, payload?: any) => {
    console.log('Action triggered:', action, payload);
    onAction?.(action, payload);
  }, [onAction]);

  // Render feature content
  const renderFeature = (feature: FeatureConfig) => {
    return (
      <div key={feature.id} className="json-feature">
        {feature.components.map((component, index) => renderComponent(component, index, localData, updateData, handleAction))}
      </div>
    );
  };

  // Get active features based on permissions and conditions
  const activeFeatures = useMemo(() => {
    return config.features.filter(feature => {
      if (!feature.enabled) return false;
      
      // Check permissions
      if (feature.permissions && feature.permissions.length > 0) {
        // Implement permission checking logic here
        return true; // For now, allow all
      }
      
      return true;
    });
  }, [config.features]);

  return (
    <ResponsiveLayout jsonConfig={config.layout} className="json-feature-system">
      <div className="feature-container">
        {activeFeatures.map(renderFeature)}
      </div>
    </ResponsiveLayout>
  );
};

/**
 * Render individual component from JSON config
 */
function renderComponent(
  component: ComponentConfig,
  index: number,
  data: Record<string, any>,
  onDataChange: (data: Record<string, any>) => void,
  onAction: (action: string, payload?: any) => void
): ReactNode {
  const Component = COMPONENT_REGISTRY[component.type as keyof typeof COMPONENT_REGISTRY];
  
  if (!Component) {
    console.warn(`Component type "${component.type}" not found in registry`);
    return null;
  }

  // Process props with data binding
  const processedProps = processProps(component.props, data);
  
  // Add event handlers
  const eventHandlers = {
    onChange: (value: any) => {
      if (component.props.dataBinding) {
        onDataChange({
          ...data,
          [component.props.dataBinding]: value
        });
      }
    },
    onClick: () => {
      if (component.props.action) {
        onAction(component.props.action, { componentId: component.id, data });
      }
    }
  };

  // Check conditions
  if (component.conditions && !evaluateConditions(component.conditions, data)) {
    return null;
  }

  // Render children if any
  const children = component.children?.map((child, childIndex) => 
    renderComponent(child, childIndex, data, onDataChange, onAction)
  );

  return (
    <Component
      key={`${component.id}-${index}`}
      {...processedProps}
      {...eventHandlers}
    >
      {children}
    </Component>
  );
}

/**
 * Process props with data binding and dynamic values
 */
function processProps(props: Record<string, any>, data: Record<string, any>): Record<string, any> {
  const processed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      // Data binding syntax: {{data.fieldName}}
      const path = value.slice(2, -2).trim();
      processed[key] = getNestedValue(data, path);
    } else if (key === 'value' && props.dataBinding) {
      // Bind value to data
      processed[key] = getNestedValue(data, props.dataBinding);
    } else {
      processed[key] = value;
    }
  }
  
  return processed;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Evaluate conditions for component visibility/behavior
 */
function evaluateConditions(conditions: any[], data: Record<string, any>): boolean {
  return conditions.every(condition => {
    const fieldValue = getNestedValue(data, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(condition.value);
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        return true;
    }
  });
}

/**
 * Hook for loading JSON configurations
 */
export function useJsonConfig(configPath: string) {
  const [config, setConfig] = React.useState<JsonFeatureConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const response = await fetch(configPath);
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.statusText}`);
        }
        const configData = await response.json();
        setConfig(configData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [configPath]);

  return { config, loading, error };
}
