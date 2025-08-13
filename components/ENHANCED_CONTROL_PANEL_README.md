# Enhanced Control Panel System

A completely redesigned control panel system for AdaptivePages that provides an intuitive wizard-based approach for first-time users and powerful floating controls for experienced users.

## Features

### 🧙‍♂️ Generation Wizard
- **Step-by-step guidance** for new users
- **4-step process**: Description → Tone & Industry → Colors → Optional URLs
- **Smart validation** with helpful tips and examples
- **Progress tracking** with visual indicators

### 🎛️ Floating Control Groups
- **Context-aware controls** that appear after page generation
- **Organized button groups**: Content, Design, Save/Export, Settings
- **Smart state management** with visual feedback
- **Expandable menus** for grouped functionality

### ✏️ Inline Text Editing
- **Click-to-edit** any text element on hover
- **Multi-line support** for paragraphs and descriptions
- **Character limits** based on element type
- **Keyboard shortcuts** (Enter to save, Esc to cancel, Ctrl+Enter for multi-line)

### 🎨 Section-Level Controls
- **Floating section controls** on each page section
- **Move sections** up/down with visual feedback
- **Quick edit access** with section-specific options
- **Color and background controls** per section
- **Delete confirmation** to prevent accidents

## Components

### 1. GenerationWizard
A multi-step modal that guides users through the page creation process.

```tsx
<GenerationWizard
  prompt={prompt}
  setPrompt={setPrompt}
  tone={tone}
  setTone={setTone}
  // ... other props
  onGenerate={handleGenerate}
  onClose={handleCloseWizard}
/>
```

### 2. FloatingControlGroup
Main control hub that appears after page generation.

```tsx
<FloatingControlGroup
  isVisible={showControls}
  onToggle={toggleControls}
  onShowWizard={showWizard}
  onSave={saveProgress}
  // ... other handlers
  themeMode={themeMode}
  saveStatus={saveStatus}
  hasUnsavedChanges={hasChanges}
/>
```

### 3. SectionWrapper
Wraps each page section with editing capabilities.

```tsx
<SectionWrapper
  sectionKey="hero"
  sectionTitle="Hero Section"
  isFirst={true}
  isLast={false}
  onEdit={handleEdit}
  onMoveUp={handleMoveUp}
  onMoveDown={handleMoveDown}
  onDelete={handleDelete}
  onUpdateContent={handleUpdate}
>
  {/* Your section content */}
</SectionWrapper>
```

### 4. InlineTextEditor
Enables inline editing of text elements.

```tsx
<InlineTextEditor
  text="Your editable text"
  onSave={handleSave}
  multiline={false}
  maxLength={100}
/>
```

### 5. FloatingSectionControls
Provides section-specific editing controls.

```tsx
<FloatingSectionControls
  sectionKey="hero"
  sectionTitle="Hero Section"
  isFirst={true}
  isLast={false}
  onEdit={handleEdit}
  onMoveUp={handleMoveUp}
  onMoveDown={handleMoveDown}
  onDelete={handleDelete}
  onColorPicker={handleColorPicker}
  onBackgroundToggle={handleBackgroundToggle}
/>
```

## Integration Guide

### 1. Replace Existing Control Panel

Replace your current `ControlPanel` with `EnhancedControlPanel`:

```tsx
import EnhancedControlPanel from './components/EnhancedControlPanel';

// In your main component
<EnhancedControlPanel
  // All the same props as the original ControlPanel
  prompt={prompt}
  setPrompt={setPrompt}
  // ... plus new ones for enhanced functionality
  oldSiteUrl={oldSiteUrl}
  setOldSiteUrl={setOldSiteUrl}
  inspirationUrl={inspirationUrl}
  setInspirationUrl={setInspirationUrl}
/>
```

### 2. Wrap Sections with SectionWrapper

Wrap each of your page sections:

```tsx
// Before
<div className="hero-section">
  <h1>Hero Title</h1>
  <p>Hero description</p>
</div>

// After
<SectionWrapper
  sectionKey="hero"
  sectionTitle="Hero Section"
  isFirst={index === 0}
  isLast={index === sectionOrder.length - 1}
  onEdit={() => handleEditSection('hero')}
  onMoveUp={() => handleMoveSection('hero', 'up')}
  onMoveDown={() => handleMoveSection('hero', 'down')}
  onDelete={() => handleDeleteSection('hero')}
  onUpdateContent={(updates) => handleUpdateSectionContent('hero', updates)}
>
  <div className="hero-section">
    <h1>Hero Title</h1>
    <p>Hero description</p>
  </div>
</SectionWrapper>
```

### 3. Add State Management

Add the new state variables to your component:

```tsx
const [oldSiteUrl, setOldSiteUrl] = useState('');
const [inspirationUrl, setInspirationUrl] = useState('');
const [isEditMode, setIsEditMode] = useState(true);
```

### 4. Implement Handlers

Add handlers for the new functionality:

```tsx
const handleMoveSection = (sectionKey: string, direction: 'up' | 'down') => {
  const currentIndex = sectionOrder.indexOf(sectionKey);
  if (currentIndex === -1) return;

  const newOrder = [...sectionOrder];
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex >= 0 && targetIndex < newOrder.length) {
    [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
    setSectionOrder(newOrder);
    setHasUnsavedChanges(true);
  }
};

const handleDeleteSection = (sectionKey: string) => {
  setSectionOrder(sectionOrder.filter(key => key !== sectionKey));
  setHasUnsavedChanges(true);
};

const handleUpdateSectionContent = (sectionKey: string, updates: Record<string, any>) => {
  // Update your section data here
  setHasUnsavedChanges(true);
};
```

## User Experience Flow

### First-Time Users
1. **Wizard Launch**: Automatically opens when no page is generated
2. **Step 1**: Describe their page with examples and tips
3. **Step 2**: Choose tone and industry with explanations
4. **Step 3**: Select colors with visual previews
5. **Step 4**: Optional URLs for inspiration/replacement
6. **Generate**: AI creates the page with sections

### Existing Users
1. **Floating Controls**: Main control hub in bottom-right
2. **Quick Access**: Fast generation, save, export, settings
3. **Section Controls**: Edit, move, and style individual sections
4. **Inline Editing**: Click any text to edit in place

### Edit Mode
1. **Toggle Control**: Switch between edit and preview modes
2. **Visual Feedback**: Hover effects and editing indicators
3. **Section Highlighting**: Clear visual boundaries during editing
4. **Save States**: Visual indicators for unsaved changes

## Customization

### Styling
All components use Tailwind CSS classes and can be customized via:
- CSS classes in component props
- Dark mode support built-in
- Responsive design patterns

### Behavior
Control the behavior through props:
- `isEditMode`: Toggle editing capabilities
- `autoSave`: Enable/disable automatic saving
- `showAdvanced`: Show/hide advanced options

### Integration
The system is designed to work with:
- Any React-based application
- Tailwind CSS (or custom CSS)
- TypeScript (with proper type definitions)

## Demo

See `EnhancedControlPanelDemo.tsx` for a complete working example that demonstrates:
- Wizard flow for new pages
- Floating controls for existing pages
- Section management and editing
- Inline text editing
- Theme switching
- Save state management

## Migration from Old Control Panel

1. **Backup**: Save your current control panel implementation
2. **Props**: Most props remain the same, add new ones as needed
3. **Handlers**: Implement the new handler functions
4. **Wrappers**: Wrap sections with `SectionWrapper`
5. **Testing**: Use the demo component to test functionality
6. **Gradual**: Can be implemented incrementally section by section

The enhanced control panel provides a much more intuitive and powerful editing experience while maintaining backward compatibility with existing functionality.
