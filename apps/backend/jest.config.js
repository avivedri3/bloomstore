const { join } = require('path');

module.exports = {
  displayName: '@bloomstore/backend',
  testEnvironment: 'node',
  rootDir: join(__dirname, '../..'),
  testMatch: ['<rootDir>/apps/backend/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [require.resolve('ts-jest'), { tsconfig: '<rootDir>/apps/backend/tsconfig.spec.json' }],
  },
  coverageDirectory: '<rootDir>/coverage/apps/backend',
  setupFilesAfterEnv: ['<rootDir>/apps/backend/jest.setup.ts'],
  moduleNameMapper: {
    '^@bloomstore/shared-types$': '<rootDir>/libs/shared-types/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
