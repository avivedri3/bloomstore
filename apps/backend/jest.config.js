module.exports = {
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  displayName: '@bloomstore/backend',
  rootDir: '.',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  coverageDirectory: '../../coverage/apps/backend',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@bloomstore/shared-types$': '<rootDir>/../../libs/shared-types/src/index.ts',
  },
};
