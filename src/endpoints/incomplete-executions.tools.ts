import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'incomplete-executions_list',
        title: 'List incomplete runs',
        description: 'List all incomplete runs. A run is also called an execution.',
        category: 'incomplete-executions',
        scope: 'dlqs:read',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to list incomplete runs for' },
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
        title: 'Get incomplete run',
        description: 'Get details of a specific incomplete run. A run is also called an execution.',
        category: 'incomplete-executions',
        scope: 'dlqs:read',
        scopeId: 'incompleteExecutionId',
        identifier: 'incompleteExecutionId',
        resourceId: 'incompleteExecutionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                incompleteExecutionId: { type: 'string', description: 'The incomplete run ID to retrieve' },
            },
            required: ['incompleteExecutionId'],
        },
        examples: [{ incompleteExecutionId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { incompleteExecutionId: string }) => {
            return await make.incompleteExecutions.get(args.incompleteExecutionId);
        },
    },
];
