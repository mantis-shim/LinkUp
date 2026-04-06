import { defineConfig } from 'vitest/config';
import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    includeSource: ['src/**/*.{ts,js,svelte}']
  }
});