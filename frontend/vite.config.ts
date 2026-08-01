import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          create: path.resolve(__dirname, 'create.html'),
          history: path.resolve(__dirname, 'history.html'),
          view: path.resolve(__dirname, 'view.html'),
          edit: path.resolve(__dirname, 'edit.html'),
          docs: path.resolve(__dirname, 'docs.html'),
          about: path.resolve(__dirname, 'about.html'),
          login: path.resolve(__dirname, 'login.html'),
          signup: path.resolve(__dirname, 'signup.html'),
          profile: path.resolve(__dirname, 'profile.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
