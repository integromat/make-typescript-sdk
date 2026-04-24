import type { Make } from '../../make.js';

export const tools = [
    {
        name: 'sdk-functions_list',
        title: 'List SDK functions',
        description: 'List functions for the app.',
        category: 'sdk-functions',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
            },
            required: ['appName', 'appVersion'],
        },
        examples: [{ appName: 'my-app', appVersion: 1 }],
        execute: async (make: Make, args: { appName: string; appVersion: number }) => {
            return await make.sdk.functions.list(args.appName, args.appVersion);
        },
    },
    {
        name: 'sdk-functions_get',
        title: 'Get SDK function',
        description: 'Get a single function by name.',
        category: 'sdk-functions',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
            },
            required: ['appName', 'appVersion', 'functionName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, functionName: 'parseDate' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; functionName: string }) => {
            return await make.sdk.functions.get(args.appName, args.appVersion, args.functionName);
        },
    },
    {
        name: 'sdk-functions_create',
        title: 'Create SDK function',
        description: 'Create a new function.',
        category: 'sdk-functions',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                name: { type: 'string', description: 'The name of the function' },
            },
            required: ['appName', 'appVersion', 'name'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, name: 'parseDate' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; name: string }) => {
            const { appName, appVersion, ...body } = args;
            return await make.sdk.functions.create(appName, appVersion, body);
        },
    },
    {
        name: 'sdk-functions_delete',
        title: 'Delete SDK function',
        description: 'Delete a function.',
        category: 'sdk-functions',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
            },
            required: ['appName', 'appVersion', 'functionName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, functionName: 'parseDate' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; functionName: string }) => {
            await make.sdk.functions.delete(args.appName, args.appVersion, args.functionName);
            return `Function has been deleted.`;
        },
    },
    {
        name: 'sdk-functions_get-code',
        title: 'Get SDK function code',
        description: 'Get function code.',
        category: 'sdk-functions',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
            },
            required: ['appName', 'appVersion', 'functionName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, functionName: 'parseDate' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; functionName: string }) => {
            return await make.sdk.functions.getCode(args.appName, args.appVersion, args.functionName);
        },
    },
    {
        name: 'sdk-functions_set-code',
        title: 'Set SDK function code',
        description: 'Set/update function code.',
        category: 'sdk-functions',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
                code: { type: 'string', description: 'The function code' },
            },
            required: ['appName', 'appVersion', 'functionName', 'code'],
        },
        examples: [
            {
                appName: 'my-app',
                appVersion: 1,
                functionName: 'parseDate',
                code: 'function parseDate(value) { return new Date(value).toISOString(); }',
            },
        ],
        execute: async (
            make: Make,
            args: { appName: string; appVersion: number; functionName: string; code: string },
        ) => {
            await make.sdk.functions.setCode(args.appName, args.appVersion, args.functionName, args.code);
            return `Code has been set.`;
        },
    },
    {
        name: 'sdk-functions_get-test',
        title: 'Get SDK function test',
        description: 'Get function test code.',
        category: 'sdk-functions',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
            },
            required: ['appName', 'appVersion', 'functionName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, functionName: 'parseDate' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; functionName: string }) => {
            return await make.sdk.functions.getTest(args.appName, args.appVersion, args.functionName);
        },
    },
    {
        name: 'sdk-functions_set-test',
        title: 'Set SDK function test',
        description: 'Set/update function test code.',
        category: 'sdk-functions',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
                test: { type: 'string', description: 'The test code' },
            },
            required: ['appName', 'appVersion', 'functionName', 'test'],
        },
        examples: [
            {
                appName: 'my-app',
                appVersion: 1,
                functionName: 'parseDate',
                test: 'assert.equal(parseDate("2024-01-01"), "2024-01-01T00:00:00.000Z")',
            },
        ],
        execute: async (
            make: Make,
            args: { appName: string; appVersion: number; functionName: string; test: string },
        ) => {
            await make.sdk.functions.setTest(args.appName, args.appVersion, args.functionName, args.test);
            return `Test has been set.`;
        },
    },
];
