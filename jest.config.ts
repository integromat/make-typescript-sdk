import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    moduleNameMapper: {
        '^(.*)\\.js$': '$1',
    },
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
    coveragePathIgnorePatterns: ['/node_modules/', '\\.tools\\.ts$'],
};

export default config;
