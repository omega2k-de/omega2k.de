const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.test.ts',
    '!<rootDir>/src/**/*.stories.ts',
    '!<rootDir>/src/**/*.mock.ts',
    '!<rootDir>/src/test-setup.ts',
    '!<rootDir>/src/public-api.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    // '<rootDir>/src/lib/**/*.ts': { branches: 85, functions: 90, lines: 90, statements: 90 },
  },
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
