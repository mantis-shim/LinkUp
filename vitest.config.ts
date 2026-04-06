
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
  alias: [
    { find: '$lib', replacement: path.resolve(__dirname, './src/lib') },
    {
      find: /^\$env\/dynamic\/private$/,
      replacement: path.resolve(__dirname, './vitest-env-mock.ts')
    }
  ]
},
  test: {
    environment: 'node'
  }
});