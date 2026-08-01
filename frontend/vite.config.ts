import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: 'frontend',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'frontend'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
