import React from 'react';
import EnhancedControlPanelDemo from './EnhancedControlPanelDemo';

// Demo page to showcase the new Enhanced Control Panel
const ControlPanelShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enhanced Control Panel System
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-6">
              A complete redesign of the AdaptivePages control panel with wizard-based generation,
              floating controls, and inline editing capabilities.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                🚀 Quick Start Guide
              </h2>
              <ul className="text-blue-800 dark:text-blue-300 space-y-2">
                <li><strong>First Time:</strong> Click the floating ✨ button to open the generation wizard</li>
                <li><strong>After Generation:</strong> Use floating controls for editing, saving, and exporting</li>
                <li><strong>Section Editing:</strong> Hover over sections and click the edit button that appears</li>
                <li><strong>Inline Text:</strong> Click any text to edit it directly (edit mode only)</li>
                <li><strong>Theme:</strong> Toggle between light and dark mode anytime</li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  ✅ New Features
                </h3>
                <ul className="text-green-800 dark:text-green-300 space-y-1">
                  <li>• Step-by-step wizard</li>
                  <li>• Floating section controls</li>
                  <li>• Inline text editing</li>
                  <li>• Smart state management</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚡ Improvements
                </h3>
                <ul className="text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>• Better UX flow</li>
                  <li>• Contextual controls</li>
                  <li>• Visual feedback</li>
                  <li>• Keyboard shortcuts</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  🔧 Technical
                </h3>
                <ul className="text-purple-800 dark:text-purple-300 space-y-1">
                  <li>• TypeScript support</li>
                  <li>• Modular components</li>
                  <li>• Easy integration</li>
                  <li>• Full compatibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Enhanced Control Panel Demo */}
      <EnhancedControlPanelDemo />
    </div>
  );
};

export default ControlPanelShowcase;
