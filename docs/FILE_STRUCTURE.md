# File Structure and Conventions

This document outlines the project's directory structure and the naming conventions used to maintain a clean and organized codebase.

## Root Directory

```
.
├── docs/                # Project-level documentation.
├── src/                 # Main application source code.
├── index.html           # The main HTML entry point for the application.
├── metadata.json        # Project metadata.
├── README.md            # Project overview.
└── ... (config files)
```

## `src/` Directory

All React components, services, types, and primary application logic reside within the `src/` directory.

```
src/
├── components/          # Reusable React components.
│   ├── icons/           # SVG icon components.
│   ├── sections/        # Components for specific landing page sections (Hero, Features, etc.).
│   └── shared/          # Generic, shared components (buttons, form fields, modals).
├── services/            # Modules for interacting with external APIs (Supabase, Gemini).
├── types/               # TypeScript type definitions.
├── App.tsx              # Root application component, handles routing.
├── Auth.tsx             # Authentication (Login/Signup) component.
├── constants.ts         # Application-wide constants (e.g., TONES, PALETTES).
├── Editor.tsx           # The main editor interface component.
├── index.tsx            # The main entry point that renders the React app.
└── ... (other top-level components)
```

### Naming Conventions

-   **Components:** `PascalCase` (e.g., `ControlPanel.tsx`, `HeroSection.tsx`).
-   **Services:** `camelCase` (e.g., `pageService.ts`, `geminiService.ts`).
-   **Types:** Interfaces and Type aliases should be `PascalCase` (e.g., `interface LandingPageData`, `type OrderStatus`).
-   **Files:**
    -   Component files should match the component name: `MyComponent.tsx`.
    -   Service files should be named for the domain they handle: `productService.ts`.
-   **Variables & Functions:** `camelCase` (e.g., `const [isLoading, setIsLoading]`, `function handleGenerate()`).
-   **Constants:** `UPPER_SNAKE_CASE` (e.g., `const TONES = [...]`).

## Code Style

-   The project uses Prettier for automatic code formatting.
-   ESLint is configured for code quality and to enforce best practices.
-   Follow standard React and TypeScript conventions.
-   **Documentation:** All functions, types, interfaces, and complex logic should be documented using JSDoc comments.