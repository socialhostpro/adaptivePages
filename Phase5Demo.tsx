import React from 'react';
import { ToastProvider } from './components/shared/FeedbackStatus';
import { FeedbackStatusDemo } from './components/shared/FeedbackStatus';

function Phase5Demo() {
  return (
    <ToastProvider position="top-right">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FeedbackStatusDemo />
      </div>
    </ToastProvider>
  );
}

export default Phase5Demo;
