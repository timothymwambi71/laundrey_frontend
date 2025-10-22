import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Note: Tailwind CSS integration is handled automatically by PostCSS (via postcss.config.js)
// and does not require a specific Vite plugin here.
export default defineConfig({
  base: './', // Tells Vite to use relative paths (e.g., ./assets/...) for asset URLs
  plugins: [react()],
  
  // Adding server configuration to ensure it's accessible from the network 
  // (useful for cross-device testing or if the backend is hosted differently)
  server: {
    host: '0.0.0.0', // Allows access via network IP
    port: 5173,     // Standard Vite port
  },
})
