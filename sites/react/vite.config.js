import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/react/',
  plugins: [react()],
  server: { fs: { allow: ['../..'] } },
  test: { environment: 'jsdom' },
});
