/** @type {import('tailwindcss').Config} */
export default {
  // The 'content' section tells Tailwind CSS which files to scan for class names.
  // This is crucial for optimizing the final CSS bundle size.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can define custom colors, typography, spacing, etc., here.
      // Example:
      // colors: {
      //   'laundry-blue': '#4a90e2',
      // },
    },
  },
  plugins: [],
}
