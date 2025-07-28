import type { Make } from '../make.js';

export const tools = [
    {
        name: 'executions_list',
        title: 'List executions',
        description: 'List executions for a scenario',
        category: 'executions',
        scope: 'scenarios:read',
        identifier: 'scenarioId',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to list executions for' },
                status: { type: 'string', description: 'Filter by execution status' },
                from: { type: 'number', description: 'Start timestamp for filtering' },
                to: { type: 'number', description: 'End timestamp for filtering' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number; status?: number; from?: number; to?: number }) => {
            const { scenarioId, ...options } = args;
            return await make.executions.list(scenarioId, options);
        },
    },
    {
        name: 'executions_get',
        title: 'Get execution',
        description: 'Get details of a specific execution',
        category: 'executions',
        scope: 'scenarios:read',
        identifier: 'scenarioId',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID the execution belongs to' },
                executionId: { type: 'string', description: 'The execution ID to retrieve' },
            },
            required: ['scenarioId', 'executionId'],
        },
        execute: async (make: Make, args: { scenarioId: number; executionId: string }) => {
            return await make.executions.get(args.scenarioId, args.executionId);
        },
    },
    {
        name: 'executions_list_for_incomplete_execution',
        title: 'List executions for incomplete execution',
        description: 'List executions for an incomplete execution',
        category: 'executions',
        scope: 'dlqs:read',
        identifier: 'incompleteExecutionId',
        inputSchema: {
            type: 'object',
            properties: {
                incompleteExecutionId: {
                    type: 'string',
                    description: 'The incomplete execution ID to list executions for',
                },
                limit: { type: 'number', description: 'Maximum number of executions to return' },
            },
            required: ['incompleteExecutionId'],
        },
        execute: async (make: Make, args: { incompleteExecutionId: string; limit?: number }) => {
            const { incompleteExecutionId } = args;
            return await make.executions.listForIncompleteExecution(incompleteExecutionId);
        },
    },
    {
        name: 'executions_get_for_incomplete_execution',
        title: 'Get execution for incomplete execution',
        description: 'Get execution details for an incomplete execution',
        category: 'executions',
        scope: 'dlqs:read',
        identifier: 'incompleteExecutionId',
        inputSchema: {
            type: 'object',
            properties: {
                incompleteExecutionId: { type: 'string', description: 'The incomplete execution ID' },
                executionId: { type: 'string', description: 'The execution ID to retrieve' },
            },
            required: ['incompleteExecutionId', 'executionId'],
        },
        execute: async (make: Make, args: { incompleteExecutionId: string; executionId: string }) => {
            return await make.executions.getForIncompleteExecution(args.incompleteExecutionId, args.executionId);
        },
    },
];
