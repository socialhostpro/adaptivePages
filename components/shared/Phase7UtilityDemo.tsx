import React from 'react';
import { ThemeProvider, UtilityDemo } from './UtilityComponents';

// =============================================================================
// PHASE 7: UTILITY COMPONENTS SHOWCASE
// =============================================================================

const Phase7UtilityDemo: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Phase 7: Professional Utility Components
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Enterprise-grade utility components with professional styling, animations, and interactions. 
              Perfect for modern applications requiring sophisticated UI elements.
            </p>
          </header>
          
          <UtilityDemo />
          
          <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              🚀 Professional utility components designed for modern applications
            </p>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Phase7UtilityDemo;
