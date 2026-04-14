import type { Make } from '../make.js';

export const tools = [
    {
        name: 'incomplete-executions_list',
        title: 'List incomplete executions',
        description: 'List all incomplete executions',
        category: 'incomplete-executions',
        scope: 'dlqs:read',
        identifier: 'scenarioId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to list incomplete executions for' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.incompleteExecutions.list(args.scenarioId);
        },
    },
    {
        name: 'incomplete-executions_get',
        title: 'Get incomplete execution',
        description: 'Get details of a specific incomplete execution',
        category: 'incomplete-executions',
        scope: 'dlqs:read',
        identifier: 'incompleteExecutionId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                incompleteExecutionId: { type: 'string', description: 'The incomplete execution ID to retrieve' },
            },
            required: ['incompleteExecutionId'],
        },
        examples: [{ incompleteExecutionId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { incompleteExecutionId: string }) => {
            return await make.incompleteExecutions.get(args.incompleteExecutionId);
        },
    },
];
