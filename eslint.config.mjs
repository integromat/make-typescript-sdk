import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import prettierPlugin from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['**/dist/*', '**/docs/*'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettierPlugin,
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    caughtErrors: 'none',
                },
            ],
        },
    },
    {
        // enable jest rules on test files
        files: ['**/*.test.ts'],
        extends: [jestPlugin.configs['flat/recommended']],
        rules: {
            'jest/no-standalone-expect': ['error', { additionalTestBlockFunctions: ['itif'] }],
        },
    },
);
