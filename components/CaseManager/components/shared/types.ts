import React, { ReactNode } from 'react';
import { ColorVariant, SizeVariant, ThemeMode } from './themes';

/**
 * Base interface for all shared components
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Child elements */
  children?: ReactNode;
  
  /** Accessibility label */
  'aria-label'?: string;
  
  /** Accessibility description */
  'aria-describedby'?: string;
  
  /** Component ID */
  id?: string;
  
  /** Test ID for testing */
  'data-testid'?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Theme mode override */
  theme?: ThemeMode;
}

/**
 * Interface for components with variants
 */
export interface VariantComponentProps extends BaseComponentProps {
  /** Color variant */
  variant?: ColorVariant;
  
  /** Size variant */
  size?: SizeVariant;
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Navigation path or URL */
  href?: string;
  
  /** Icon name or component */
  icon?: string | ReactNode;
  
  /** Badge content */
  badge?: string | number;
  
  /** Badge variant */
  badgeVariant?: ColorVariant;
  
  /** Nested navigation items */
  children?: NavigationItem[];
  
  /** Whether item is active */
  active?: boolean;
  
  /** Whether item is disabled */
  disabled?: boolean;
  
  /** Click handler */
  onClick?: () => void;
  
  /** External link indicator */
  external?: boolean;
  
  /** Required permissions */
  permissions?: string[];
  
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Navigation path */
  href?: string;
  
  /** Icon */
  icon?: string | ReactNode;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Whether item is current page */
  current?: boolean;
}

/**
 * Tab item interface
 */
export interface TabItem {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Tab content */
  content?: ReactNode;
  
  /** Icon */
  icon?: string | ReactNode;
  
  /** Badge content */
  badge?: string | number;
  
  /** Badge variant */
  badgeVariant?: ColorVariant;
  
  /** Whether tab is disabled */
  disabled?: boolean;
  
  /** Whether tab is closeable */
  closeable?: boolean;
  
  /** Close handler */
  onClose?: () => void;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Lazy loading */
  lazy?: boolean;
}

/**
 * Search result interface
 */
export interface SearchResult {
  /** Unique identifier */
  id: string;
  
  /** Title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Category */
  category?: string;
  
  /** URL or path */
  url?: string;
  
  /** Icon */
  icon?: string | ReactNode;
  
  /** Metadata */
  metadata?: Record<string, any>;
  
  /** Search score */
  score?: number;
}

/**
 * Filter option interface
 */
export interface FilterOption {
  /** Unique identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Filter value */
  value: any;
  
  /** Option count */
  count?: number;
  
  /** Whether option is selected */
  selected?: boolean;
  
  /** Icon */
  icon?: string | ReactNode;
  
  /** Description */
  description?: string;
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  /** Brand configuration */
  brand?: {
    name: string;
    logo?: string | ReactNode;
    href?: string;
  };
  
  /** Main navigation items */
  items: NavigationItem[];
  
  /** Secondary navigation items */
  secondaryItems?: NavigationItem[];
  
  /** User menu items */
  userMenu?: NavigationItem[];
  
  /** Mobile breakpoint */
  mobileBreakpoint?: string;
  
  /** Collapse behavior */
  collapsible?: boolean;
  
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Button component props
 */
export interface ButtonProps extends VariantComponentProps {
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Icon element (for IconButton) */
  icon?: ReactNode;
  
  /** Icon position */
  iconPosition?: 'left' | 'right';
  
  /** Button style variant */
  styleVariant?: 'solid' | 'outline' | 'ghost' | 'link';
}

/**
 * Button Group props
 */
export interface ButtonGroupProps extends BaseComponentProps {
  /** Button orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Connected buttons (no gap) */
  connected?: boolean;
  
  /** Size for all buttons */
  size?: SizeVariant;
}

/**
 * Dropdown Button props
 */
export interface DropdownButtonProps extends ButtonProps {
  /** Dropdown menu items */
  items: DropdownItem[];
  
  /** Dropdown placement */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  
  /** Show dropdown arrow */
  showArrow?: boolean;
  
  /** Menu open state */
  open?: boolean;
  
  /** Menu open state change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dropdown menu item
 */
export interface DropdownItem {
  /** Item key */
  key: string;
  
  /** Item label */
  label: string;
  
  /** Item icon */
  icon?: ReactNode;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Divider after item */
  divider?: boolean;
  
  /** Click handler */
  onClick?: () => void;
}

/**
 * Form component props (extending existing)
 */
export interface FormComponentProps extends BaseComponentProps {
  /** Field name */
  name?: string;
  
  /** Field value */
  value?: any;
  
  /** Change handler */
  onChange?: (value: any) => void;
  
  /** Error state */
  error?: boolean;
  
  /** Error message */
  errorMessage?: string;
  
  /** Help text */
  helpText?: string;
  
  /** Required field */
  required?: boolean;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** AI Enhancement options */
  aiEnhancement?: {
    enabled?: boolean;
    type?: 'grammar' | 'professional' | 'casual' | 'technical' | 'legal' | 'custom';
    customPrompt?: string;
    autoEnhance?: boolean; // Auto-enhance on blur
  };
  
  /** Voice dictation options */
  voiceDictation?: {
    enabled?: boolean;
    language?: string; // e.g., 'en-US', 'es-ES'
    continuous?: boolean;
    interimResults?: boolean;
  };
  
  /** Enhancement callbacks */
  onTextEnhanced?: (originalText: string, enhancedText: string) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onVoiceError?: (error: string) => void;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  /** Modal open state */
  open: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Modal title */
  title?: string;
  
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  
  /** Close on escape key */
  closeOnEscape?: boolean;
  
  /** Show close button */
  showCloseButton?: boolean;
}

/**
 * Alert component props
 */
export interface AlertProps extends VariantComponentProps {
  /** Alert title */
  title?: string;
  
  /** Alert description */
  description?: string;
  
  /** Dismissible alert */
  dismissible?: boolean;
  
  /** Dismiss handler */
  onDismiss?: () => void;
  
  /** Alert icon */
  icon?: ReactNode;
  
  /** Show default icon */
  showIcon?: boolean;
}

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps {
  /** Card header */
  header?: ReactNode;
  
  /** Card footer */
  footer?: ReactNode;
  
  /** Card padding */
  padding?: SizeVariant;
  
  /** Card shadow */
  shadow?: boolean;
  
  /** Card border */
  border?: boolean;
  
  /** Hover effect */
  hover?: boolean;
}

/**
 * Table component props
 */
export interface TableProps extends BaseComponentProps {
  /** Table columns */
  columns: TableColumn[];
  
  /** Table data */
  data: any[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Sortable columns */
  sortable?: boolean;
  
  /** Selection mode */
  selectionMode?: 'none' | 'single' | 'multiple';
  
  /** Selected rows */
  selectedRows?: string[];
  
  /** Selection change handler */
  onSelectionChange?: (selectedRows: string[]) => void;
}

/**
 * Table column definition
 */
export interface TableColumn {
  /** Column key */
  key: string;
  
  /** Column title */
  title: string;
  
  /** Column width */
  width?: string | number;
  
  /** Sortable column */
  sortable?: boolean;
  
  /** Render function */
  render?: (value: any, record: any, index: number) => ReactNode;
  
  /** Alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Utility type for component ref forwarding
 */
export type ComponentRef<T> = React.Ref<T>;

/**
 * Utility type for polymorphic components
 */
export type PolymorphicComponentProps<C extends React.ElementType> = {
  as?: C;
} & React.ComponentPropsWithoutRef<C>;
