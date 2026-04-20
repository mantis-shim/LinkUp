
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		include: ['src/**/*.server.test.ts', 'src/**/page.server.test.ts', 'src/**/server.test.ts'],
		environment: 'node',
		globals: true,
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	}
});