import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type { SearchIoDataOptions } from './executions.js';

/** Keeps the default result set small enough for an LLM context; the API itself defaults to 20. */
const DEFAULT_IO_DATA_SEARCH_PAGE_SIZE = 10;

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
                status: {
                    type: 'number',
                    description:
                        'Filter by execution status (0 = pending, 1 = successful, 2 = successful with warnings, 3 = failed)',
                },
                from: { type: 'number', description: 'Start timestamp for filtering, in epoch milliseconds' },
                to: { type: 'number', description: 'End timestamp for filtering, in epoch milliseconds' },
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
            const { incompleteExecutionId, limit } = args;
            return await make.executions.listForIncompleteExecution(incompleteExecutionId, {
                pg: limit !== undefined ? { limit } : undefined,
            });
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
                    description:
                        "The execution ID from the incomplete execution record (see executions_list-for-incomp-exec) — may be UUID-formatted with dashes (e.g. '55602700-e840-45bf-b18c-0aef214dd967'), unlike scenario execution IDs",
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
    {
        name: 'executions_search-io-data',
        title: 'Search execution data',
        description:
            'Full-text search the input/output data of scenario executions across an organization (all teams you can access, or one team via teamId). Returns matching executions, each with up to 5 matching module IO records and highlighted snippets. Use it to find which runs handled a given value (an order ID, an email, an error text). Wrap the query in double quotes for an exact phrase. from/to apply at UTC-day granularity, so narrow them to keep the search fast. Requires the Pro plan or above.',
        category: 'executions',
        scope: 'organizations:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to search in' },
                query: {
                    type: 'string',
                    maxLength: 100,
                    description: 'Free-text expression to match against module IO data. Quoted phrases are supported.',
                },
                teamId: {
                    type: 'number',
                    description:
                        'Restrict the search to a single team. All teams you can access are searched when omitted.',
                },
                from: {
                    type: 'number',
                    description: 'Start of the time window, in epoch milliseconds (UTC-day granularity)',
                },
                to: {
                    type: 'number',
                    description: 'End of the time window, in epoch milliseconds (UTC-day granularity)',
                },
                scenarioIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Restrict the search to these scenario IDs',
                },
                appNames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to executions that used any of these apps (by app name)',
                },
                moduleNames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to executions that used any of these module names',
                },
                executionIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to these execution IDs',
                },
                status: {
                    type: 'array',
                    items: { type: 'number', enum: [1, 2, 3] },
                    description:
                        'Which outcomes to search: 1 = successful, 2 = warning, 3 = error. All outcomes when omitted.',
                },
                pageSize: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    default: 10,
                    description: 'Maximum number of executions to return',
                },
                pageIndex: { type: 'number', minimum: 0, description: 'Zero-based index of the page to return' },
            },
            required: ['organizationId', 'query'],
        },
        examples: [
            { organizationId: 5, query: '"order_id":"12345"' },
            { organizationId: 5, query: 'timeout', status: [3], appNames: ['http'] },
        ],
        execute: async (make: Make, args: { organizationId: number } & SearchIoDataOptions) => {
            const { organizationId, ...options } = args;
            return await make.executions.searchIoData(organizationId, {
                ...options,
                pageSize: options.pageSize ?? DEFAULT_IO_DATA_SEARCH_PAGE_SIZE,
            });
        },
    },
];
