// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  css: {
    postcss: './postcss.config.js', // Ensure Vite uses the correct PostCSS config file
  },
  base: '/portifolio_new/', // GitHub Pages base path
  plugins: [react()],
});
