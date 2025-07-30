import type { Make } from '../make.js';

export const tools = [
    {
        name: 'functions_list',
        title: 'List functions',
        description: 'List custom functions for a team',
        category: 'functions',
        scope: 'functions:read',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list functions for' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.functions.list(args.teamId);
        },
    },
    {
        name: 'functions_get',
        title: 'Get function',
        description: 'Get details of a specific custom function',
        category: 'functions',
        scope: 'functions:read',
        identifier: 'functionId',
        inputSchema: {
            type: 'object',
            properties: {
                functionId: { type: 'number', description: 'The function ID to retrieve' },
            },
            required: ['functionId'],
        },
        execute: async (make: Make, args: { functionId: number }) => {
            return await make.functions.get(args.functionId);
        },
    },
    {
        name: 'functions_create',
        title: 'Create function',
        description: 'Create a new custom function',
        category: 'functions',
        scope: 'functions:write',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the function will be created' },
                name: { type: 'string', description: 'The name of the function' },
                code: { type: 'string', description: 'The function code' },
                description: { type: 'string', description: 'Description of the function' },
            },
            required: ['teamId', 'name', 'code'],
        },
        execute: async (make: Make, args: { teamId: number; name: string; code: string; description?: string }) => {
            const { teamId, ...body } = args;
            return await make.functions.create(teamId, {
                ...body,
                description: body.description || '',
            });
        },
    },
    {
        name: 'functions_update',
        title: 'Update function',
        description: 'Update an existing custom function',
        category: 'functions',
        scope: 'functions:write',
        identifier: 'functionId',
        inputSchema: {
            type: 'object',
            properties: {
                functionId: { type: 'number', description: 'The function ID to update' },
                name: { type: 'string', description: 'New name for the function' },
                code: { type: 'string', description: 'Updated function code' },
                description: { type: 'string', description: 'Updated function description' },
            },
            required: ['functionId'],
        },
        execute: async (
            make: Make,
            args: { functionId: number; name?: string; code?: string; description?: string },
        ) => {
            const { functionId, ...body } = args;
            return await make.functions.update(functionId, body);
        },
    },
    {
        name: 'functions_delete',
        title: 'Delete function',
        description: 'Delete a custom function',
        category: 'functions',
        scope: 'functions:write',
        identifier: 'functionId',
        inputSchema: {
            type: 'object',
            properties: {
                functionId: { type: 'number', description: 'The function ID to delete' },
            },
            required: ['functionId'],
        },
        execute: async (make: Make, args: { functionId: number }) => {
            await make.functions.delete(args.functionId);
            return `Function has been deleted.`;
        },
    },
    {
        name: 'functions_check',
        title: 'Check function syntax',
        description: 'Check the syntax of a function without saving it',
        category: 'functions',
        scope: 'functions:write',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID' },
                code: { type: 'string', description: 'The function code to check' },
            },
            required: ['teamId', 'code'],
        },
        execute: async (make: Make, args: { teamId: number; code: string }) => {
            const result = await make.functions.check(args.teamId, args.code);
            return result.success ? 'Function code is valid.' : `Function code is not valid: ${result.error}`;
        },
    },
];
