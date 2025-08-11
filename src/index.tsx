/**
 * @file This is the main entry point for the React application.
 * @description It finds the root DOM element and renders the main `<App />` component into it.
 * It also includes React's StrictMode for development-time checks.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);