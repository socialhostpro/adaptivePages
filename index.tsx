import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

console.log('🚀 Starting React application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Could not find root element');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found, creating React root...');
const root = ReactDOM.createRoot(rootElement);

// Simple error handling wrapper
function AppWithErrorHandling() {
  try {
    return <App />;
  } catch (error) {
    console.error('❌ Error in App component:', error);
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-700 mb-4">Please refresh the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

try {
  root.render(
    <React.StrictMode>
      <AppWithErrorHandling />
    </React.StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #fef2f2;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Critical Error</h1>
        <p style="margin-bottom: 1rem;">Failed to start the application</p>
        <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
