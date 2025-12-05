/// <reference types='vitest' />
import angular from '@analogjs/vite-plugin-angular';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/page',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['junit', 'json', 'default'],
    outputFile: {
      junit: '../../test-results/libs/page/junit-report.xml',
      json: '../../test-results/libs/page/json-report.json',
    },
    coverage: {
      provider: 'v8' as const,
      reportsDirectory: '../../coverage/libs/page',
      all: true,
      reporter: ['text', 'lcov', 'html'],
      include: ['**/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/public-api.ts',
        '**/index.ts',
        'src/environments/**',
        '**/__mocks__/**',
      ],
      thresholds: { lines: 5, functions: 5, branches: 5, statements: 5 },
    },
  },
}));
