import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import portfolioSeo from './build/portfolioSeo.js';

export default defineConfig({
  base: '/portifolio_new/',
  plugins: [react(), portfolioSeo()],
  worker: {
    format: 'es',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'worker-three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.core\.js$/ },
            { name: 'worker-three-renderer', test: /node_modules[\\/]three[\\/]build[\\/]three\.module\.js$/ },
            { name: 'worker-react', test: /node_modules[\\/](react|react-reconciler|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
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
