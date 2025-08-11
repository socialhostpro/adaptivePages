# Application Update and Deployment Guide

This guide provides a step-by-step process for developing new features, managing dependencies, and deploying updates for the AdaptivePages application.

## Development Workflow

A consistent workflow is crucial for maintaining code quality and stability.

### 1. Branching Strategy

We recommend a simplified GitFlow model:
-   **`main`**: This branch should always represent the stable, production-ready version of the application. Direct commits to `main` are prohibited.
-   **`develop`**: This is the primary development branch. All feature branches are created from `develop`.
-   **Feature Branches**: For any new feature or bugfix, create a new branch from `develop`.
    -   Naming convention: `feature/short-description` (e.g., `feature/add-contact-form`) or `fix/bug-description` (e.g., `fix/navbar-z-index`).

    ```bash
    # Get the latest development code
    git checkout develop
    git pull origin develop

    # Create your new feature branch
    git checkout -b feature/add-new-section
    ```

### 2. Adding a New Feature (e.g., a New Section)

1.  **Type Definitions (`src/types/`):** Define the data structure for your new feature. For a new section, create a `YourSectionData` interface in a relevant file (e.g., `src/types/sections.ts`).
2.  **Component (`src/components/sections/`):** Create the React component that will render the section (e.g., `src/components/sections/YourSection.tsx`).
3.  **Schema Update (`src/types/schemas.ts`):** Add the new section's schema to the `LANDING_PAGE_SCHEMA` so the AI knows how to generate it.
4.  **Integration:**
    -   Add the section to the constants in `src/constants.ts`.
    -   Import and render the new section component within `src/components/LandingPagePreview.tsx`.
    -   Add a case for it in the `EditModal.tsx` previewer.
    -   Create its form in `src/components/SectionEditForm.tsx`.

### 3. Submitting Changes

1.  **Commit Your Work:** Make small, logical commits with clear messages.
2.  **Create a Pull Request (PR):** When your feature is complete, push your branch to the remote repository and open a Pull Request to merge your feature branch back into `develop`.
3.  **Code Review:** At least one other team member should review the PR for correctness, style, and potential issues.
4.  **Merge:** Once approved, merge the PR into `develop`.

## Dependency Management

This project uses `npm` for managing dependencies, configured via the `importmap` in `index.html`.

-   **Adding a Dependency:** Find the CDN URL (preferably from esm.sh) and add it to the `imports` object in `index.html`.
-   **Updating a Dependency:** Update the version number in the `importmap`.
-   **Removing a Dependency:** Remove the corresponding line from the `importmap`.

## Deployment

Deploying updates involves creating a production-ready build and pushing it to the hosting provider.

### Build Process

**Note:** The current project uses a CDN-based approach without a local build step. For production, **it is critical to implement a build tool like Vite.**

Assuming a Vite setup:

1.  **Build Command:**
    ```bash
    npm run build
    ```
    This command will lint the code, run TypeScript checks, and generate an optimized, minified set of static files (HTML, CSS, JS) in a `dist/` directory.

2.  **Environment Variables:**
    -   Production environment variables (like Supabase keys) should be managed by the hosting provider.
    -   Ensure your `.env.production` file is configured correctly for the build step.

### Releasing to Production

1.  **Merge `develop` into `main`:** Once the `develop` branch is stable and has been thoroughly tested, create a Pull Request to merge `develop` into `main`.
2.  **Tag a Release:** After merging, create a Git tag to mark the release version.
    ```bash
    # On the main branch
    git tag v1.1.0
    git push origin v1.1.0
    ```
3.  **Deploy:** The hosting provider (e.g., Vercel, Netlify) should be configured to automatically trigger a new deployment whenever the `main` branch is updated.