/**
 * PostCSS Configuration
 * This file is essential for running Tailwind CSS with Vite.
 * It instructs PostCSS to load the Tailwind and Autoprefixer plugins.
 * * NOTE: Updated to use 'import' instead of 'require' because the project
 * is configured to use ES Modules (ESM), which resolves the "require is not defined" error.
 */
// Import the necessary PostCSS plugins
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  // Use array syntax for plugins to ensure correct loading order and resolution
  plugins: [
    // Plugins are now referenced directly
    tailwindcss,
    autoprefixer
  ],
}
