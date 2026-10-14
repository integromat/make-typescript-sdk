import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'functions_list',
        title: 'List functions',
        description: 'List custom functions for a project.',
        category: 'functions',
        scope: 'functions:read',
        scopeId: 'projectId',
        identifier: 'projectId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: { type: 'number', description: 'The project ID to list functions for' },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
                },
            },
            required: ['projectId'],
        },
        examples: [{ projectId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.functions.list(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'functions_get',
        title: 'Get function',
        description: 'Get details of a specific custom function.',
        category: 'functions',
        scope: 'functions:read',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                functionId: { type: 'number', description: 'The function ID to retrieve' },
            },
            required: ['functionId'],
        },
        examples: [{ functionId: 2 }],
        execute: async (make: Make, args: { functionId: number }) => {
            return await make.functions.get(args.functionId);
        },
    },
    {
        name: 'functions_create',
        title: 'Create function',
        description: 'Create a new custom function.',
        category: 'functions',
        scope: 'functions:write',
        scopeId: 'projectId',
        identifier: 'projectId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: { type: 'number', description: 'The project ID where the function will be created' },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
                },
                name: { type: 'string', description: 'The name of the function' },
                code: { type: 'string', description: 'The function code' },
                description: { type: 'string', description: 'Description of the function' },
            },
            required: ['projectId', 'name', 'code'],
        },
        examples: [
            {
                projectId: 5,
                name: 'checkType',
                code: 'function checkType(param) { return typeof param; }',
                description: 'Returns the data type of the argument.',
            },
        ],
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
        description: 'Update an existing custom function.',
        category: 'functions',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
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
        examples: [
            {
                functionId: 2,
                name: 'checkType',
                code: 'function checkType(param) { return typeof param; }',
            },
        ],
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
        description: 'Delete a custom function.',
        category: 'functions',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                functionId: { type: 'number', description: 'The function ID to delete' },
            },
            required: ['functionId'],
        },
        examples: [{ functionId: 2 }],
        execute: async (make: Make, args: { functionId: number }) => {
            await make.functions.delete(args.functionId);
            return `Function has been deleted.`;
        },
    },
    {
        name: 'functions_check',
        title: 'Check function syntax',
        description: 'Check the syntax of a function without saving it.',
        category: 'functions',
        scope: 'functions:write',
        scopeId: 'projectId',
        identifier: 'projectId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: { type: 'number', description: 'The project ID' },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
                },
                code: { type: 'string', description: 'The function code to check' },
            },
            required: ['projectId', 'code'],
        },
        examples: [{ projectId: 5, code: 'function myFn(x) { return x * 2; }' }],
        execute: async (make: Make, args: { teamId: number; code: string }) => {
            const result = await make.functions.check(args.teamId, args.code);
            return result.success ? 'Function code is valid.' : `Function code is not valid: ${result.error}`;
        },
    },
];
