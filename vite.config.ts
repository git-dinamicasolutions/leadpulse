import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 5180,
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
