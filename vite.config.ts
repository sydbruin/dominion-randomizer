import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-cards-json',
      writeBundle() {
        copyFileSync(resolve(__dirname, 'cards.json'), resolve(__dirname, 'dist/cards.json'));
      }
    }
  ],
  build: {
    outDir: 'dist'
  }
});
