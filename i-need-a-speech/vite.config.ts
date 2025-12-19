import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // This allows the app to use process.env.API_KEY in the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});