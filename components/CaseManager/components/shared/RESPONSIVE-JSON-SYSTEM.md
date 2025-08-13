# Responsive Layout & JSON Feature System

## Overview

This system provides a comprehensive solution for creating responsive, device-optimized applications with JSON-driven feature creation. It combines:

1. **Responsive Layout System** - Device-specific optimized views (mobile, tablet, desktop)
2. **JSON Feature System** - Create entire features and pages through JSON configuration
3. **AI Enhancement Integration** - Built-in AI text enhancement and voice dictation
4. **Theme Support** - Light/dark mode with consistent design tokens

## Key Features

### 📱 Mobile-First Responsive Design
- **Mobile View**: App-like experience with bottom navigation, floating action buttons, and touch-optimized interfaces
- **Tablet View**: Optimized for both portrait and landscape orientations with adaptive layouts
- **Desktop View**: Full-featured interface with sidebars, complex layouts, and keyboard navigation

### 🎯 Device-Specific Optimizations

#### Mobile (< 768px)
- Traditional mobile app feel with bottom navigation
- Floating action buttons for quick actions
- Pull-to-refresh and swipe gestures
- Touch-optimized form controls
- Full-screen modals and slide-out menus

#### Tablet (768px - 1024px)  
- Adaptive grid layouts that work in both orientations
- Horizontal scrolling tables with sticky headers
- Collapsible sidebars that respond to screen space
- Two-column layouts that collapse to single column when needed

#### Desktop (> 1024px)
- Multi-column layouts with persistent sidebars
- Complex data tables with advanced interactions
- Keyboard shortcuts and accessibility features
- Modal dialogs and overlay systems

### 🚀 JSON-Driven Feature Creation

Create entire features without writing code:

```json
{
  "id": "contact_form",
  "name": "Contact Form", 
  "components": [
    {
      "id": "name_input",
      "type": "Input",
      "props": {
        "label": "Name",
        "dataBinding": "form.name",
        "aiEnhancement": {
          "enabled": true,
          "types": ["proper_case"]
        }
      }
    }
  ]
}
```

## Component Architecture

### Core Components

#### ResponsiveLayout
Main layout component that automatically adapts to device type:

```tsx
import { ResponsiveLayout } from './shared/ResponsiveLayout';

<ResponsiveLayout 
  viewMode="embedded"
  mobileLayout="app"
  enableGestures={true}
  jsonConfig={layoutConfig}
>
  {children}
</ResponsiveLayout>
```

#### JsonFeatureSystem
Renders features from JSON configuration:

```tsx
import { JsonFeatureSystem } from './shared/JsonFeatureSystem';

<JsonFeatureSystem
  config={featureConfig}
  data={formData}
  onDataChange={handleDataChange}
  onAction={handleAction}
/>
```

### Device Detection Hook

```tsx
import { useDeviceDetection } from './shared/ResponsiveLayout';

const { device, screenSize, orientation } = useDeviceDetection();
// device: 'mobile' | 'tablet' | 'desktop'
// screenSize: { width: number, height: number }
// orientation: 'portrait' | 'landscape'
```

## JSON Configuration Structure

### Layout Configuration
```json
{
  "breakpoints": {
    "mobile": 768,
    "tablet": 1024, 
    "desktop": 1200
  },
  "layouts": {
    "mobile": {
      "type": "app",
      "header": {
        "fixed": true,
        "height": "60px",
        "showTitle": true
      },
      "navigation": {
        "type": "bottom-tabs",
        "position": "bottom",
        "items": [...]
      }
    }
  }
}
```

### Feature Configuration
```json
{
  "id": "feature_name",
  "name": "Display Name",
  "type": "page|modal|drawer|inline",
  "components": [
    {
      "id": "component_id",
      "type": "Input|Button|Card|Grid|etc",
      "props": {
        "label": "Field Label",
        "dataBinding": "data.path",
        "aiEnhancement": {
          "enabled": true,
          "types": ["grammar", "professional"]
        }
      },
      "conditions": [
        {
          "field": "data.status",
          "operator": "equals",
          "value": "active",
          "action": "show"
        }
      ]
    }
  ]
}
```

## Available Component Types

### Form Components
- **Input**: Text inputs with AI enhancement and validation
- **Textarea**: Multi-line text with voice dictation and AI enhancement
- **Select**: Dropdown selections with search and multi-select
- **Checkbox**: Single checkboxes with custom styling

### Layout Components  
- **Grid**: Responsive grid system with breakpoint-specific columns
- **Card**: Container with title, border, and consistent spacing
- **Modal**: Overlay dialogs with backdrop and animations
- **Table**: Data tables with sorting, filtering, and responsive behavior

### Button Components
- **Button**: Primary, secondary, outline, ghost variants
- **IconButton**: Icon-only buttons with tooltips
- **ButtonGroup**: Grouped button sets
- **DropdownButton**: Button with dropdown menu

### Display Components
- **Text**: Typography with semantic variants (h1-h4, body, caption)
- **Image**: Responsive images with lazy loading
- **List**: Ordered and unordered lists with styling

## Data Binding & State Management

### Data Binding Syntax
```json
{
  "props": {
    "value": "{{data.user.name}}",
    "placeholder": "Enter {{data.fieldType}}",
    "dataBinding": "form.email"
  }
}
```

### Conditional Rendering
```json
{
  "conditions": [
    {
      "field": "user.role",
      "operator": "equals", 
      "value": "admin",
      "action": "show"
    }
  ]
}
```

### Workflows & Actions
```json
{
  "workflows": [
    {
      "id": "form_submission",
      "trigger": {
        "type": "user_action",
        "event": "submit_form"
      },
      "steps": [
        {
          "id": "validate",
          "type": "condition",
          "config": {
            "rules": [
              { "field": "form.email", "required": true }
            ]
          }
        },
        {
          "id": "save_data", 
          "type": "api_call",
          "config": {
            "endpoint": "/api/save",
            "method": "POST"
          }
        }
      ]
    }
  ]
}
```

## AI Enhancement Features

### Text Enhancement
All text inputs and textareas support AI enhancement:

```json
{
  "aiEnhancement": {
    "enabled": true,
    "types": [
      "grammar",      // Fix grammar and spelling
      "professional", // Make more professional
      "concise",      // Make more concise  
      "detailed",     // Add more detail
      "structure",    // Improve structure
      "legal",        // Legal document style
      "creative",     // Creative writing
      "technical",    // Technical documentation
      "proper_case"   // Proper name capitalization
    ]
  }
}
```

### Voice Dictation
Textareas support voice-to-text:

```json
{
  "voiceDictation": {
    "enabled": true,
    "language": "en-US",
    "continuous": true
  }
}
```

## Responsive Design Patterns

### Mobile Patterns
```json
{
  "mobile": {
    "type": "app",
    "navigation": {
      "type": "bottom-tabs",
      "items": [
        { "id": "home", "label": "Home", "icon": "home" },
        { "id": "search", "label": "Search", "icon": "search" }
      ]
    },
    "gestures": {
      "swipeNavigation": true,
      "pullToRefresh": true,
      "longPress": true
    }
  }
}
```

### Tablet Patterns  
```json
{
  "tablet": {
    "orientation": "auto",
    "sidebar": {
      "enabled": true,
      "width": "280px",
      "collapsible": true
    },
    "grid": {
      "columns": 2,
      "responsive": true
    },
    "tables": {
      "horizontalScroll": true,
      "stickyHeaders": true
    }
  }
}
```

### Desktop Patterns
```json
{
  "desktop": {
    "layout": "dashboard",
    "sidebar": {
      "enabled": true,
      "width": "320px"
    },
    "content": {
      "maxWidth": "1400px",
      "centered": true
    }
  }
}
```

## Example Configurations

### Case Management Dashboard
See: `configs/case-management-config.json`
- Mobile: App-style with bottom navigation
- Tablet: Two-column layout with collapsible sidebar  
- Desktop: Full dashboard with persistent sidebar

### Contact Form
See: `configs/contact-form-config.json`
- Mobile: Single-column form with app header
- Tablet: Centered form with comfortable spacing
- Desktop: Centered form with maximum width

## Integration with Existing Systems

### Supabase Integration
```typescript
// API endpoints configuration
{
  "integrations": [
    {
      "id": "supabase_api",
      "type": "api", 
      "config": {
        "baseUrl": "/api/supabase"
      },
      "endpoints": [
        {
          "id": "list_cases",
          "method": "GET", 
          "url": "/cases"
        }
      ]
    }
  ]
}
```

### Authentication & Permissions
```json
{
  "permissions": [
    {
      "id": "case_read",
      "name": "Read Cases",
      "actions": ["view_case", "list_cases"]
    }
  ]
}
```

## Performance Considerations

1. **Lazy Loading**: Components are only rendered when needed
2. **Responsive Images**: Automatic image optimization for device type
3. **Code Splitting**: Features are loaded on-demand
4. **Caching**: JSON configurations are cached in memory
5. **Virtual Scrolling**: Large lists use virtual scrolling for performance

## Accessibility Features

1. **Screen Reader Support**: All components have proper ARIA labels
2. **Keyboard Navigation**: Full keyboard accessibility
3. **Focus Management**: Proper focus handling in modals and forms
4. **Color Contrast**: WCAG AA compliant color schemes
5. **Touch Targets**: Minimum 44px touch targets on mobile

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **Features**: CSS Grid, Flexbox, Web Speech API (for voice features)

## Getting Started

1. **Install Dependencies**: All components use the shared theme and utility system
2. **Create JSON Config**: Start with one of the example configurations  
3. **Implement Data Layer**: Connect to your data source (Supabase, API, etc.)
4. **Add Custom Components**: Extend the component registry as needed
5. **Test Across Devices**: Use the demo component to test responsive behavior

## Next Steps

1. **Phase 3: Navigation Components** - Tabs, Breadcrumbs, Pagination, SideNav
2. **Phase 4: Data Display** - Tables, Lists, Cards, Charts  
3. **Phase 5: Feedback** - Alerts, Notifications, Loading states
4. **Phase 6: Overlays** - Modals, Popovers, Tooltips, Drawers
5. **Phase 7: Advanced Features** - File uploads, Rich text editors, Calendar components
