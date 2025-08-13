/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // This is useful for dynamic colors from the API
        // Add gray colors for v4 compatibility
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
  safelist: [
    // This is a safelist for all possible color combinations.
    // In a real app, you might generate this dynamically or use a plugin.
    // Adding specific gray shades for Tailwind v4 compatibility
    'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'border-gray-50', 'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500', 'border-gray-600', 'border-gray-700', 'border-gray-800', 'border-gray-900',
    'hover:bg-gray-50', 'hover:bg-gray-100', 'hover:bg-gray-200', 'hover:bg-gray-300', 'hover:bg-gray-400', 'hover:bg-gray-500', 'hover:bg-gray-600', 'hover:bg-gray-700', 'hover:bg-gray-800', 'hover:bg-gray-900',
    'dark:bg-gray-50', 'dark:bg-gray-100', 'dark:bg-gray-200', 'dark:bg-gray-300', 'dark:bg-gray-400', 'dark:bg-gray-500', 'dark:bg-gray-600', 'dark:bg-gray-700', 'dark:bg-gray-800', 'dark:bg-gray-900',
    'dark:text-gray-50', 'dark:text-gray-100', 'dark:text-gray-200', 'dark:text-gray-300', 'dark:text-gray-400', 'dark:text-gray-500', 'dark:text-gray-600', 'dark:text-gray-700', 'dark:text-gray-800', 'dark:text-gray-900',
    'dark:border-gray-50', 'dark:border-gray-100', 'dark:border-gray-200', 'dark:border-gray-300', 'dark:border-gray-400', 'dark:border-gray-500', 'dark:border-gray-600', 'dark:border-gray-700', 'dark:border-gray-800', 'dark:border-gray-900',
    'dark:hover:bg-gray-50', 'dark:hover:bg-gray-100', 'dark:hover:bg-gray-200', 'dark:hover:bg-gray-300', 'dark:hover:bg-gray-400', 'dark:hover:bg-gray-500', 'dark:hover:bg-gray-600', 'dark:hover:bg-gray-700', 'dark:hover:bg-gray-800', 'dark:hover:bg-gray-900',
    ...[
      'blue', 'green', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow',
      'slate', 'zinc', 'neutral', 'stone'
    ].flatMap(color => [
      ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].flatMap(level => [
        `bg-${color}-${level}`,
        `text-${color}-${level}`,
        `border-${color}-${level}`,
        `hover:bg-${color}-${level > 100 ? level-100 : 50}`,
        `dark:bg-${color}-${level}`,
        `dark:text-${color}-${level}`,
        `dark:border-${color}-${level}`,
        `dark:hover:bg-${color}-${level > 100 ? level-100 : 50}`,
      ])
    ])
  ]
}
