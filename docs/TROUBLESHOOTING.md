# Troubleshooting Guide

This guide provides solutions to common issues encountered during development and deployment.

## Common Development Issues

### 1. "Failed to resolve module specifier" Error

-   **Symptom:** The browser console shows an error like `Uncaught TypeError: Failed to resolve module specifier "..."`.
-   **Cause:** This almost always means an `import` path is incorrect in one of your `.tsx` files. The path might be misspelled, pointing to the wrong directory, or missing the correct relative path prefix (`./`, `../`).
-   **Solution:**
    1.  Identify the file mentioned in the stack trace of the error message.
    2.  Carefully check all `import` statements at the top of that file.
    3.  Verify that the path correctly points to the location of the imported module relative to the current file.

### 2. Supabase RLS (Row Level Security) Errors

-   **Symptom:** Supabase queries fail silently, return empty arrays `[]`, or throw a "new row violates row-level security policy" error.
-   **Cause:** The user performing the action does not have the required permissions according to the RLS policies defined on the table.
-   **Solution:**
    1.  Go to **Authentication -> Policies** in your Supabase dashboard.
    2.  Select the table in question (e.g., `pages`).
    3.  Review the policies for the attempted action (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
    4.  Ensure the `USING expression` (for `SELECT`, `UPDATE`, `DELETE`) or the `WITH CHECK expression` (for `INSERT`, `UPDATE`) evaluates to `true` for the authenticated user. A common check is `auth.uid() = user_id`.
    5.  Refer to `docs/DATABASE.md` for the correct RLS policies that should be in place.

### 3. Gemini API Errors

-   **Symptom:** The AI generation process fails with an error message related to the Gemini API.
-   **Cause & Solution:**
    -   **"API key not valid"**: Your `API_KEY` environment variable is incorrect or missing.
    -   **"Model isn't available"**: The Gemini model is temporarily busy or down. Wait a few moments and try again.
    -   **Invalid JSON response**: The AI's response did not conform to the schema. This can happen with very complex or ambiguous prompts.
        -   Check the browser's network tab to inspect the raw response from the AI.
        -   Try simplifying your prompt in the Control Panel.
        -   Ensure the `responseSchema` in `src/services/geminiService.ts` is a valid JSON schema.

## Debugging Techniques

-   **Browser DevTools:** Use the **Console** to check for errors and log messages. Use the **Network** tab to inspect API requests to both Supabase and the Gemini API.
-   **`console.log`:** Add strategic `console.log()` statements in your service files and components to trace the flow of data and identify where a value becomes `undefined` or incorrect. The service files now include detailed logging for this purpose.
-   **React DevTools:** Use the React DevTools browser extension to inspect component props and state in real-time. This is invaluable for debugging UI issues.