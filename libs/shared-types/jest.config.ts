import type { Config } from 'jest';

const config: Config = {
  displayName: '@bloomstore/shared-types',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
};

export default config;
