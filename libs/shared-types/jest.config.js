const { join } = require('path');

/** @type {import('jest').Config} */
module.exports = {
  displayName: '@bloomstore/shared-types',
  testEnvironment: 'node',
  rootDir: join(__dirname, '../..'),
  testMatch: ['<rootDir>/libs/shared-types/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [require.resolve('ts-jest'), { tsconfig: '<rootDir>/libs/shared-types/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
