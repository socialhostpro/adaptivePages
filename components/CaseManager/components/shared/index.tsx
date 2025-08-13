// Form Components (Phase 1 - Enhanced with AI & Voice)
export { Select, Input, Checkbox, Textarea } from './FormComponents';

// Button Components (Phase 2 - Completed)
export { Button, IconButton, ButtonGroup, DropdownButton } from './ButtonComponents';

// Demo Components
export { default as ButtonDemo } from './ButtonDemo';
export { default as EnhancedFormDemo } from './EnhancedFormDemo';

// Integration Examples
export { 
  TaskManagementHeader, 
  TaskActionButtons, 
  TaskStatusActions 
} from './TaskManagementHeader';

// Types and Utilities
export type {
  BaseComponentProps,
  VariantComponentProps,
  ButtonProps,
  ButtonGroupProps,
  DropdownButtonProps,
  DropdownItem,
  FormComponentProps
} from './types';

export {
  cn,
  getVariantClasses,
  getOutlineVariantClasses,
  getGhostVariantClasses,
  getFocusRingClasses,
  getButtonSizeClasses,
  isDarkMode,
  generateId,
  debounce,
  mergeRefs,
  formatFileSize,
  escapeHtml,
  isInViewport,
  copyToClipboard,
  enhanceTextWithAI,
  createVoiceRecognition,
  isVoiceRecognitionSupported,
  VoiceRecognition
} from './utils';

export type { AIEnhancementOptions } from './utils';

export {
  colors,
  typography,
  spacing,
  borderRadius,
  baseComponentClasses
} from './themes';

export type { ColorVariant, SizeVariant, ThemeMode } from './themes';
