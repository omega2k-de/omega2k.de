/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig, UserConfig } from 'vite';

export default defineConfig(
  (): UserConfig => ({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/websocket',
    plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    worker: {
      plugins: () => [nxViteTsPaths()],
    },
    test: {
      watch: false,
      globals: true,
      environment: 'node',
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['junit', 'json', 'default'],
      outputFile: {
        junit: '../../test-results/apps/websocket/junit-report.xml',
        json: '../../test-results/apps/websocket/json-report.json',
      },
      coverage: {
        provider: 'v8' as const,
        reportsDirectory: '../../coverage/apps/websocket',
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
        thresholds: { lines: 0, functions: 5, branches: 5, statements: 0 },
      },
    },
  })
);
