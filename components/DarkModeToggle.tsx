import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is currently active
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;
    
    if (newIsDark) {
      html.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      html.classList.remove('dark');
      localStorage.theme = 'light';
    }
    
    setIsDark(newIsDark);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}
