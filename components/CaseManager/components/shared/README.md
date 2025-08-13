# Shared Component System

A comprehensive shared component library for the Case Manager system with consistent dark/light mode support, TypeScript integration, and accessibility compliance.

## 🎯 Features

- **Dark/Light Mode Support** - Seamless theme switching across all components
- **TypeScript First** - Full type safety with comprehensive interfaces
- **Accessibility Compliant** - Built-in ARIA support and keyboard navigation
- **Consistent Design** - Uniform styling following design system principles
- **Flexible Variants** - Multiple styles, sizes, and states for each component
- **Easy Integration** - Drop-in replacements for existing components

## 📦 Components Available

### ✅ Phase 1: Form Components (Enhanced with AI & Voice)
- `Select` - Dropdown component with dark mode
- `Input` - Text input with **AI enhancement** and **voice dictation**
- `Checkbox` - Checkbox with dark mode
- `Textarea` - Multi-line input with **AI enhancement** and **voice dictation**

### ✅ Phase 2: Button Components (Completed)
- `Button` - Primary, secondary, danger variants with multiple styles
- `IconButton` - Button with icon support
- `ButtonGroup` - Grouped button container
- `DropdownButton` - Button with dropdown menu

### 🚧 Coming Soon
- Phase 3: Navigation Components (Tabs, Breadcrumb, Pagination)
- Phase 4: Data Display Components (Table, Card, Badge)
- Phase 5: Feedback Components (Modal, Alert, Toast)
- Phase 6: Layout Components (Container, Grid, Stack)
- Phase 7: Advanced Components (DatePicker, FileUpload, SearchBox)

## 🤖 AI Enhancement & Voice Features

### AI Text Enhancement
Automatically improve text quality with AI-powered enhancements:

```tsx
<Input
  value={text}
  onChange={setText}
  aiEnhancement={{
    enabled: true,
    type: 'professional', // 'grammar' | 'professional' | 'casual' | 'technical' | 'legal' | 'custom'
    autoEnhance: false, // Auto-enhance on blur
    customPrompt: 'Make this sound more persuasive'
  }}
  onTextEnhanced={(original, enhanced) => {
    console.log('Text improved:', { original, enhanced });
  }}
/>
```

### Voice Dictation
Convert speech to text with real-time transcription:

```tsx
<Textarea
  value={text}
  onChange={setText}
  voiceDictation={{
    enabled: true,
    language: 'en-US', // Language code
    continuous: true, // Continuous or single-phrase
    interimResults: true // Show interim transcription
  }}
  onVoiceStart={() => console.log('Dictation started')}
  onVoiceEnd={() => console.log('Dictation ended')}
  onVoiceError={(error) => console.log('Voice error:', error)}
/>
```

### Combined Features
Use both AI enhancement and voice dictation together:

```tsx
<Textarea
  value={content}
  onChange={setContent}
  placeholder="Speak or type, then enhance with AI..."
  aiEnhancement={{
    enabled: true,
    type: 'legal',
    autoEnhance: false
  }}
  voiceDictation={{
    enabled: true,
    language: 'en-US',
    continuous: true
  }}
/>
```

## 🚀 Quick Start

### Installation
```tsx
import { Button, IconButton, ButtonGroup, DropdownButton } from './shared';
```

### Basic Usage

#### Buttons
```tsx
// Basic button
<Button variant="primary">Save</Button>

// Button with icon
<Button 
  variant="primary" 
  icon={<PlusIcon />} 
  iconPosition="left"
>
  Add New
</Button>

// Loading state
<Button loading={isLoading} onClick={handleSave}>
  Save Changes
</Button>

// Different styles
<Button styleVariant="outline" variant="primary">Outline</Button>
<Button styleVariant="ghost" variant="secondary">Ghost</Button>
<Button styleVariant="link" variant="primary">Link</Button>
```

#### Icon Buttons
```tsx
<IconButton 
  icon={<EditIcon />} 
  aria-label="Edit item"
  variant="primary"
/>
```

#### Button Groups
```tsx
// Connected buttons
<ButtonGroup connected>
  <Button>First</Button>
  <Button>Second</Button>
  <Button>Third</Button>
</ButtonGroup>

// Spaced buttons
<ButtonGroup>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</ButtonGroup>
```

#### Dropdown Buttons
```tsx
const items = [
  { key: 'edit', label: 'Edit', icon: <EditIcon />, onClick: handleEdit },
  { key: 'delete', label: 'Delete', icon: <DeleteIcon />, onClick: handleDelete }
];

<DropdownButton items={items} variant="primary">
  Actions
</DropdownButton>
```

## 🎨 Design System

### Color Variants
- `primary` - Blue (primary actions)
- `secondary` - Gray (secondary actions)
- `success` - Green (positive actions)
- `warning` - Yellow (warning actions)
- `danger` - Red (destructive actions)

### Style Variants
- `solid` - Filled background (default)
- `outline` - Border with transparent background
- `ghost` - Transparent with hover effect
- `link` - Text-only with underline on hover

### Sizes
- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

### States
- `disabled` - Non-interactive state
- `loading` - Shows loading spinner
- `fullWidth` - Takes full width of container

## 🌙 Dark Mode

All components automatically support dark mode using Tailwind CSS dark mode classes:

```tsx
// No additional configuration needed
<Button variant="primary">
  This button works in both light and dark mode
</Button>
```

The components use CSS classes like:
- `bg-white dark:bg-slate-800`
- `text-gray-900 dark:text-white`
- `border-gray-300 dark:border-slate-600`

## 🔧 Advanced Usage

### Custom Styling
```tsx
<Button 
  className="my-custom-class"
  variant="primary"
>
  Custom Styled Button
</Button>
```

### Ref Forwarding
```tsx
const buttonRef = useRef<HTMLButtonElement>(null);

<Button ref={buttonRef} variant="primary">
  Button with Ref
</Button>
```

### Event Handling
```tsx
<Button 
  onClick={(event) => {
    console.log('Button clicked:', event);
  }}
  variant="primary"
>
  Click Me
</Button>
```

## 📝 TypeScript Support

### Component Props
```tsx
import { ButtonProps, DropdownItem } from './shared';

interface MyComponentProps {
  onAction: (action: string) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ onAction }) => {
  const items: DropdownItem[] = [
    { key: 'action1', label: 'Action 1', onClick: () => onAction('action1') }
  ];
  
  return (
    <DropdownButton items={items} variant="primary">
      Actions
    </DropdownButton>
  );
};
```

### Utility Functions
```tsx
import { cn, isDarkMode, generateId } from './shared';

// Combine class names
const classes = cn(
  'base-class',
  { 'conditional-class': someCondition },
  customClass
);

// Check dark mode
const darkMode = isDarkMode(); // auto-detects system preference

// Generate unique IDs
const uniqueId = generateId('button'); // Returns: button-xyz123
```

## 🧪 Testing

### Button Demo Component
Use the `ButtonDemo` component to test all button variants:

```tsx
import { ButtonDemo } from './shared';

// In your app
<ButtonDemo />
```

### Integration Examples
See `TaskManagementHeader.tsx` for real-world integration examples showing how to replace existing buttons with the shared components.

## 🏗️ Architecture

### File Structure
```
components/CaseManager/components/shared/
├── index.tsx                 # Main exports
├── FormComponents.tsx        # ✅ Form inputs (Phase 1)
├── ButtonComponents.tsx      # ✅ Button variants (Phase 2)
├── types.ts                  # TypeScript interfaces
├── utils.ts                  # Utility functions
├── themes.ts                 # Design system tokens
├── ButtonDemo.tsx            # Demo component
└── TaskManagementHeader.tsx  # Integration example
```

### Design Principles
1. **Consistency** - Uniform API across all components
2. **Accessibility** - ARIA labels, keyboard navigation, focus management
3. **Performance** - Optimized rendering and minimal re-renders
4. **Maintainability** - Single source of truth for styling
5. **Extensibility** - Easy to add new variants and features

## 🔄 Migration Guide

### Replacing Existing Buttons

#### Before (old approach)
```tsx
<button 
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  onClick={handleClick}
>
  Save
</button>
```

#### After (shared component)
```tsx
<Button variant="primary" onClick={handleClick}>
  Save
</Button>
```

### Benefits of Migration
- **Consistent styling** across the application
- **Dark mode support** automatically included
- **Accessibility features** built-in
- **Type safety** with TypeScript
- **Easier maintenance** - update styling in one place

## 🎯 Best Practices

### When to Use Each Component

1. **Button** - Primary actions, form submissions
2. **IconButton** - Space-constrained areas, toolbars
3. **ButtonGroup** - Related actions, toggle groups
4. **DropdownButton** - Multiple related actions, context menus

### Accessibility Guidelines

1. Always provide `aria-label` for icon-only buttons
2. Use appropriate variants for action importance
3. Ensure sufficient color contrast
4. Test keyboard navigation
5. Provide loading states for async actions

### Performance Tips

1. Use `React.memo` for frequently re-rendered components
2. Avoid inline functions in render when possible
3. Use `useCallback` for event handlers
4. Consider lazy loading for complex dropdown menus

## 🐛 Troubleshooting

### Common Issues

1. **Dark mode not working** - Ensure Tailwind CSS dark mode is configured
2. **TypeScript errors** - Import types from the shared module
3. **Styling conflicts** - Use `className` prop for custom styling
4. **Icons not showing** - Ensure icon components are properly imported

### Getting Help

- Check the `ButtonDemo` component for working examples
- Review `TaskManagementHeader.tsx` for integration patterns
- Refer to TypeScript interfaces in `types.ts`
- Look at utility functions in `utils.ts`

---

**Ready for Phase 3: Navigation Components!** 🚀

The foundation is solid, and we're building a comprehensive, maintainable component library that will make the entire system easier to develop, maintain, and update.
