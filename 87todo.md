# Production Readiness & Refactoring Plan (87TODO)

This document outlines the key areas for improvement to make the AdaptivePages application robust, performant, and maintainable for a production environment. Items are organized by priority.

---

## 🟥 Critical Priority (Must-Do for Production)

These items address fundamental issues that will significantly impact performance and stability in a live environment.

### 1. Implement a Build Process (Remove Tailwind CDN)

*   **Issue:** The application currently uses the Tailwind CSS CDN (`<script src="https://cdn.tailwindcss.com"></script>`). This is not recommended for production as it loads a large, unoptimized file on every page load, leading to slow rendering and a poor user experience. It's also less reliable than a self-hosted asset.
*   **Solution:** Introduce a standard frontend build tool like **Vite** or **Create React App**.
    *   Set up a `package.json` file.
    *   Install Tailwind CSS as a PostCSS plugin.
    *   Configure Tailwind to scan the `.tsx` files and compile a small, optimized CSS file containing only the styles used in the application.
*   **Benefit:** Massive performance improvement, faster load times, and a more stable, professional setup.

### 2. Refactor Image Storage

*   **Issue:** Generated images are currently stored as base64 strings directly within the `pages.images` JSONB column in the database. This drastically increases the size of your database, slows down page load queries, and increases network payload size.
*   **Solution:**
    1.  Modify the image generation and saving logic (`Editor.tsx`, `pageService.ts`).
    2.  Instead of storing the base64 string in the `images` JSONB, upload the generated image directly to **Supabase Storage** (similar to how the Media Library works).
    3.  Store only the public **URL** of the image in the `images` JSONB object.
*   **Benefit:** Dramatically smaller database, faster database queries, faster page loads (as images can be loaded asynchronously and cached by the browser), and better overall application performance.

### 3. Use Environment Variables for Credentials

*   **Issue:** The `supabaseCredentials.ts` file contains the Supabase URL and public API key directly in the source code. This is a security risk, as it makes it easy for keys to be accidentally committed to public repositories.
*   **Solution:**
    1.  Create a `.env` or `.env.local` file at the root of the project.
    2.  Move the `supabaseUrl` and `supabaseAnonKey` into this file, prefixed with your framework's public variable prefix (e.g., `VITE_SUPABASE_URL`).
    3.  Access these variables in your code using `process.env.VITE_SUPABASE_URL`.
    4.  Add `.env.local` to your `.gitignore` file.
*   **Benefit:** Improved security and adherence to the standard practice of separating configuration from code.

---

## 🟧 High Priority (Strongly Recommended)

These items address major architectural and code quality issues that will impact long-term maintainability.

### 1. Refactor `Editor.tsx` ("God Component")

*   **Issue:** `Editor.tsx` is a "god component." It contains over 50 state variables and nearly all the application's top-level logic. This makes it extremely difficult to understand, debug, and maintain.
*   **Solution:**
    1.  Break `Editor.tsx` down into smaller, more focused components.
    2.  Introduce a state management solution to handle shared state instead of prop-drilling. Options include:
        *   **React Context API:** Good for moderately complex state that doesn't change too frequently.
        *   **Zustand:** A lightweight, simple, and powerful state management library that is easy to adopt.
*   **Benefit:** Vastly improved code readability, maintainability, and easier onboarding for new developers. It will make fixing bugs and adding new features much faster.

### 2. Remove `as any` Casts in Service Files

*   **Issue:** Many Supabase client calls in the `services/` directory use `as any` to bypass TypeScript errors (e.g., `.insert([payload] as any)`). This was a temporary fix that sacrifices type safety. The root cause is likely a subtle issue in the auto-generated `database.types.ts` file.
*   **Solution:** Investigate and fix the root cause of the Supabase type inference failures. This may involve:
    1.  Re-generating the types from your Supabase instance.
    2.  Manually correcting or simplifying complex `Json` type definitions in `database.types.ts` until the inference works correctly.
    3.  Once fixed, remove all `as any` casts.
*   **Benefit:** Restores full type safety to the data layer, preventing potential runtime errors and making the code more robust.

---

## 🟨 Recommended Improvements

These items will further enhance the user experience and code quality.

### 1. Implement Code Splitting / Lazy Loading

*   **Issue:** The application is currently a single JavaScript bundle. All components, including modals and dashboard views that aren't immediately visible, are loaded upfront.
*   **Solution:** Use `React.lazy()` and `<Suspense>` to code-split components.
    *   Components for modals (`DashboardModal`, `EditModal`, etc.) are perfect candidates.
    *   Views within the dashboard (`ShopManagement`, `ContactManagement`, etc.) can also be lazy-loaded.
*   **Benefit:** Smaller initial bundle size and faster initial page load time for the user.

### 2. Enhance Data Caching Strategy

*   **Issue:** The current strategy fetches *all* dashboard data when the `Editor` component loads. While much better than before, this can be slow if a user has a lot of data (e.g., thousands of products or contacts).
*   **Solution:** Consider adopting a more advanced data-fetching and caching library like **React Query (TanStack Query)**.
    *   This would allow you to fetch data for each dashboard view on demand.
    *   React Query would automatically handle caching, background refetching, and keeping the UI in sync, simplifying the manual `refreshAllData` logic.
*   **Benefit:** More scalable and robust data layer, faster initial load (as less data is fetched upfront), and a better user experience on slower connections.

### 3. Documentation & Housekeeping

*   **Task:** Add JSDoc comments to complex functions, especially in the service files, to explain what they do, their parameters, and what they return.
*   **Task:** Establish a clear team process for keeping `supabe.md` in sync with the live database schema whenever a migration is performed.
*   **Task:** Review large components (beyond `Editor.tsx`) and see if they can be broken down further into smaller, reusable pieces.

