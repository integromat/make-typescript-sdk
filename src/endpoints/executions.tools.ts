import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'executions_list',
        title: 'List executions',
        description: 'List executions for a scenario.',
        category: 'executions',
        scope: 'scenarios:read',
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
                scenarioId: { type: 'number', description: 'The scenario ID to list executions for' },
                status: { type: 'string', description: 'Filter by execution status' },
                from: { type: 'number', description: 'Start timestamp for filtering' },
                to: { type: 'number', description: 'End timestamp for filtering' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
        execute: async (make: Make, args: { scenarioId: number; status?: number; from?: number; to?: number }) => {
            const { scenarioId, ...options } = args;
            return await make.executions.list(scenarioId, options);
        },
    },
    {
        name: 'executions_get-detail',
        title: 'Get execution detail',
        description:
            'Get the full per-module detail of an execution: the inputs and outputs of each module, the failing module and its error. ALWAYS call this after a failed or suspicious run BEFORE retrying or editing the scenario. For lightweight status/duration metadata only, use executions_get instead.',
        category: 'executions',
        scope: 'scenarios:read',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'executionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID the execution belongs to' },
                executionId: {
                    type: 'string',
                    pattern: '^[0-9a-f]{32}$',
                    description:
                        "The execution ID to retrieve — a 32-character lowercase hex string as returned by scenarios_run or executions_list (e.g. 'a07e16f2ad134bf49cf83a00aa95c0a5')",
                },
            },
            required: ['scenarioId', 'executionId'],
        },
        examples: [{ scenarioId: 925, executionId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { scenarioId: number; executionId: string }) => {
            return await make.executions.getDetail(args.scenarioId, args.executionId);
        },
    },
    {
        name: 'executions_get',
        title: 'Get execution',
        description:
            'Get execution metadata only: status, duration, operations consumed and error class — NOT per-module inputs/outputs. To see what each module did or why a run failed, use executions_get-detail instead.',
        category: 'executions',
        scope: 'scenarios:read',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'executionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID the execution belongs to' },
                executionId: {
                    type: 'string',
                    pattern: '^[0-9a-f]{32}$',
                    description:
                        "The execution ID to retrieve — a 32-character lowercase hex string as returned by scenarios_run or executions_list (e.g. 'a07e16f2ad134bf49cf83a00aa95c0a5')",
                },
            },
            required: ['scenarioId', 'executionId'],
        },
        examples: [{ scenarioId: 925, executionId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { scenarioId: number; executionId: string }) => {
            return await make.executions.get(args.scenarioId, args.executionId);
        },
    },
    {
        name: 'executions_list-for-incomp-exec',
        title: 'List executions for incomplete execution',
        description: 'List executions for an incomplete execution.',
        category: 'executions',
        scope: 'dlqs:read',
        scopeId: 'incompleteExecutionId',
        identifier: 'incompleteExecutionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
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
        examples: [{ incompleteExecutionId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { incompleteExecutionId: string; limit?: number }) => {
            const { incompleteExecutionId } = args;
            return await make.executions.listForIncompleteExecution(incompleteExecutionId);
        },
    },
    {
        name: 'executions_get-for-incomp-exec',
        title: 'Get execution for incomplete execution',
        description: 'Get execution details for an incomplete execution.',
        category: 'executions',
        scope: 'dlqs:read',
        scopeId: 'incompleteExecutionId',
        identifier: 'incompleteExecutionId',
        resourceId: 'executionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                incompleteExecutionId: { type: 'string', description: 'The incomplete execution ID' },
                executionId: {
                    type: 'string',
                    pattern: '^[0-9a-f]{32}$',
                    description:
                        "The execution ID to retrieve — a 32-character lowercase hex string as returned by scenarios_run or executions_list (e.g. 'a07e16f2ad134bf49cf83a00aa95c0a5')",
                },
            },
            required: ['incompleteExecutionId', 'executionId'],
        },
        examples: [
            {
                incompleteExecutionId: 'a07e16f2ad134bf49cf83a00aa95c0a5',
                executionId: '1356b72d781649a18692a0d4d09cd977',
            },
        ],
        execute: async (make: Make, args: { incompleteExecutionId: string; executionId: string }) => {
            return await make.executions.getForIncompleteExecution(args.incompleteExecutionId, args.executionId);
        },
    },
];
