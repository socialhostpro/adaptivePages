/**
 * Shared Components Main Index
 * Central export point for all shared components
 * This file enables easy imports across the entire application
 */

// Core AI and Control System
export { 
  ApiControlProvider, 
  useApiController 
} from '../CaseManager/components/shared/ApiController';

export { 
  useAiAgent 
} from '../CaseManager/components/shared/useAiAgent';

// Form Components
export { 
  Input, 
  Textarea, 
  Select, 
  Checkbox 
} from '../CaseManager/components/shared/FormComponents';

// Button Components
export { 
  Button, 
  IconButton, 
  ButtonGroup, 
  DropdownButton 
} from '../CaseManager/components/shared/ButtonComponents';

// Navigation Components
export { 
  Breadcrumb, 
  Sidebar, 
  Tabs, 
  useNavigation 
} from '../CaseManager/components/shared/NavigationComponents';

export { 
  MobileNavigation, 
  Search, 
  Filter 
} from '../CaseManager/components/shared/MobileNavigation';

// Utilities and Themes
export { 
  cn 
} from '../CaseManager/components/shared/utils';

export type { 
  ButtonProps, 
  NavigationItem, 
  BreadcrumbItem, 
  TabItem, 
  SearchResult, 
  FilterOption, 
  NavigationConfig 
} from '../CaseManager/components/shared/types';

// Branding Components
export { default as Logo } from './Logo';

// Utility Components  
export { default as ErrorBoundary } from './ErrorBoundary';

// Demo Components (for development)
export { default as ButtonDemo } from '../CaseManager/components/shared/ButtonDemo';
export { default as NavigationDemo } from '../CaseManager/components/shared/NavigationDemo';
export { default as AiAgentDemo } from '../CaseManager/components/shared/AiAgentDemo';
