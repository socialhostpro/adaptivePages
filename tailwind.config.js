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
      }
    },
  },
  plugins: [],
  darkMode: 'class',
  safelist: [
    // This is a safelist for all possible color combinations.
    // In a real app, you might generate this dynamically or use a plugin.
    ...[
      'blue', 'green', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow',
      'gray', 'slate', 'zinc', 'neutral', 'stone'
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
