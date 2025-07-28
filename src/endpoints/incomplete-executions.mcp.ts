import type { Make } from '../make.js';

export const tools = [
    {
        name: 'incomplete_executions_list',
        title: 'List incomplete executions',
        description: 'List all incomplete executions',
        category: 'incomplete-executions',
        scope: 'dlqs:read',
        identifier: 'scenarioId',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to list incomplete executions for' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.incompleteExecutions.list(args.scenarioId);
        },
    },
    {
        name: 'incomplete_executions_get',
        title: 'Get incomplete execution',
        description: 'Get details of a specific incomplete execution',
        category: 'incomplete-executions',
        scope: 'dlqs:read',
        identifier: 'incompleteExecutionId',
        inputSchema: {
            type: 'object',
            properties: {
                incompleteExecutionId: { type: 'string', description: 'The incomplete execution ID to retrieve' },
            },
            required: ['incompleteExecutionId'],
        },
        execute: async (make: Make, args: { incompleteExecutionId: string }) => {
            return await make.incompleteExecutions.get(args.incompleteExecutionId);
        },
    },
];
