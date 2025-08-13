import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider, FeedbackStatusDemo } from '@/components/shared/FeedbackStatus';
import '@/src/index.css';

const App = () => (
  <ToastProvider position="top-right">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 animate-fade-in">
      {/* Header */}
      <header className="glass border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 animate-slide-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white text-shadow">AdaptivePages</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phase 5: Feedback & Status Components</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 animate-pulse">
                🚀 Live Demo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-scale-in">
        <div className="mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-shadow-lg">
              Feedback & Status Components
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover our complete collection of feedback and status components including loading spinners, 
              toast notifications, modals, alert banners, and progress indicators.
            </p>
          </div>
        </div>

        {/* Demo Container */}
        <div className="glass rounded-2xl shadow-2xl p-8 backdrop-blur-md">
          <FeedbackStatusDemo />
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Built with React, TypeScript, and Tailwind CSS • AI-Enhanced Components
            </p>
          </div>
        </div>
      </footer>
    </div>
  </ToastProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
