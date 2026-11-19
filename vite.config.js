import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/portifolio_new/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Keep the stable engine chunks separate from portfolio code.
            { name: 'three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.core\.js$/ },
            { name: 'three-renderer', test: /node_modules[\\/]three[\\/]build[\\/]three\.module\.js$/ },
          ],
        },
      },
    },
  },
});
