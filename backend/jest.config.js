/**
 * Tests d'API sur une vraie instance Strapi (base SQLite dédiée .tmp/test.db).
 * Le code est compilé une fois dans .tmp/test-dist pour ne jamais toucher au dist du serveur de dev.
 */
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tests/tsconfig.json' }] },
  setupFiles: ['<rootDir>/tests/env.ts'],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  testTimeout: 120_000,
  maxWorkers: 1,
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/.tmp', '<rootDir>/.strapi'],
};
