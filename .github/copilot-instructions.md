# Copilot Instructions for AdaptivePages

Welcome to the AdaptivePages codebase! This document provides essential guidance for AI coding agents to be productive in this project. Please follow these conventions and workflows to ensure consistency and efficiency.

## Project Overview
AdaptivePages is an AI-powered application that generates fully-coded, responsive landing pages from text prompts. It integrates with the Google Gemini API for AI generation and Supabase for database management. The application is built using React, TypeScript, and Tailwind CSS.

### Key Features:
- AI-powered landing page generation.
- Rich component library for customizable sections.
- E-commerce and booking system integration.
- Unified management dashboard for pages, products, orders, and media.

## Architecture
- **Frontend**: Built with React and TypeScript, using Vite for development and Tailwind CSS for styling.
- **Backend**: Supabase is used for database and authentication.
- **AI Integration**: Google Gemini API powers the AI generation features.
- **Deployment**: Google Cloud Build and Cloud Run are used for CI/CD and hosting.

### Key Directories:
- `components/`: Contains reusable React components for the UI.
- `services/`: Handles API calls and business logic.
- `docs/`: Contains project documentation, including architecture and troubleshooting guides.
- `src/types/`: Defines TypeScript types and interfaces for the project.

## Developer Workflows

### Building and Running the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

### Testing
- No specific testing framework is currently integrated. Add tests as needed using Jest or similar tools.

### Debugging
- Use the Vite development server for hot-reloading and debugging.
- Check the `vite.config.ts` file for custom configurations.

### Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. Submit the build to Google Cloud Build:
   ```bash
   gcloud builds submit --tag gcr.io/<project-id>/<image-name>
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy <service-name> --image gcr.io/<project-id>/<image-name> --region us-central1 --platform managed
   ```

## Project-Specific Conventions
- **Component Structure**: Use functional components with hooks. Place reusable components in the `components/` directory.
- **Styling**: Use Tailwind CSS for all styling. Avoid inline styles unless absolutely necessary.
- **State Management**: Use React's Context API or hooks for state management. Avoid introducing external state libraries unless justified.
- **API Integration**: Use the `services/` directory for all API calls. Ensure proper error handling and logging.

## Integration Points
- **Google Gemini API**: Used for AI-powered page generation. Refer to `services/` for integration details.
- **Supabase**: Handles database and authentication. Check `supabaseCredentials.ts` for configuration.
- **Google Cloud**: Used for CI/CD and hosting. Ensure `cloudbuild.yaml` is up-to-date for build configurations.

## Additional Resources
- [Application Update Guide](./docs/APPLICATION_UPDATE_GUIDE.md)
- [File Structure](./docs/FILE_STRUCTURE.md)
- [Database Setup](./docs/DATABASE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

Feel free to update this document as the project evolves!
