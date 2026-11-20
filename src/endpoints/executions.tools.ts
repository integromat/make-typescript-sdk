import type { Make } from '../make.js';
import type { JSONSchema, MakeTool } from '../tools.js';
import type {
    CountIoDataMatchesOptions,
    SearchExecutionIoDataOptions,
    SearchExecutionsOptions,
    SearchIoDataOptions,
} from './executions.js';

/** Keeps the default result set small enough for an LLM context; the API itself defaults to 20. */
const DEFAULT_IO_DATA_SEARCH_PAGE_SIZE = 10;

/** Keeps the default result set small enough for an LLM context; the API itself defaults to 50. */
const DEFAULT_EXECUTION_SEARCH_PAGE_SIZE = 20;

const EXECUTION_STATUS_FILTER_SCHEMA: JSONSchema = {
    type: 'array',
    items: { type: 'number', enum: [1, 2, 3] },
};

export const tools: MakeTool[] = [
    {
        name: 'executions_list',
        title: 'List scenario history',
        description:
            "List a scenario's history: its runs and scenario changes, newest first. A run is also called an execution.",
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
                scenarioId: { type: 'number', description: 'The scenario ID to list runs for' },
                status: {
                    type: 'number',
                    description:
                        'Filter by run status (0 = pending, 1 = successful, 2 = successful with warnings, 3 = failed)',
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
        title: 'Get run status',
        description:
            'Get the status of a run: its outcome, declared outputs and the error if it failed. A run is also called an execution. ALWAYS call this after a failed or suspicious run BEFORE retrying or editing the scenario. For duration, operations and credits only, use executions_get instead.',
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
                scenarioId: { type: 'number', description: 'The scenario ID the run belongs to' },
                executionId: {
                    type: 'string',
                    pattern: '^[0-9a-f]{32}$',
                    description:
                        "The run ID to retrieve — a 32-character lowercase hex string as returned by scenarios_run or executions_list (e.g. 'a07e16f2ad134bf49cf83a00aa95c0a5')",
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
        title: 'Get run',
        description:
            'Get run metadata only: status, duration, operations consumed and error class — NOT per-module inputs/outputs. A run is also called an execution. To see what each module did or why a run failed, use executions_get-detail instead.',
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
                scenarioId: { type: 'number', description: 'The scenario ID the run belongs to' },
                executionId: {
                    type: 'string',
                    pattern: '^[0-9a-f]{32}$',
                    description:
                        "The run ID to retrieve — a 32-character lowercase hex string as returned by scenarios_run or executions_list (e.g. 'a07e16f2ad134bf49cf83a00aa95c0a5')",
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
        title: 'List runs for an incomplete run',
        description: 'List runs for an incomplete run. A run is also called an execution.',
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
                    description: 'The incomplete run ID to list runs for',
                },
                limit: { type: 'number', description: 'Maximum number of runs to return' },
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
        title: 'Get run for an incomplete run',
        description: 'Get run details for an incomplete run. A run is also called an execution.',
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
                incompleteExecutionId: { type: 'string', description: 'The incomplete run ID' },
                executionId: {
                    type: 'string',
                    description:
                        "The run ID from the incomplete run record (see executions_list-for-incomp-exec) — may be UUID-formatted with dashes (e.g. '55602700-e840-45bf-b18c-0aef214dd967'), unlike scenario run IDs",
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
        title: 'Search run data',
        description:
            'Full-text search the input/output data of scenario runs across an organization (all teams you can access, or one team via teamId). A run is also called an execution. Returns matching runs, each with up to 5 matching module IO records and highlighted snippets. Use it to find which runs handled a given value (an order ID, an email, an error text). Wrap the query in double quotes for an exact phrase. from/to apply at UTC-day granularity, so narrow them to keep the search fast. Requires the Pro plan or above.',
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
                    description: 'Restrict the search to runs that used any of these apps (by app name)',
                },
                moduleNames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to runs that used any of these module names',
                },
                executionIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to these run IDs',
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
                    description: 'Maximum number of runs to return',
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
    {
        name: 'executions_count-io-data-matches',
        title: 'Count run data matches',
        description:
            'Count how many scenarios and runs across an organization (all teams you can access, or one team via teamId) have input/output data matching a full-text query, with a per-scenario breakdown. A run is also called an execution. Use it to size a search before calling executions_search-io-data, or to see which scenarios handled a given value. Wrap the query in double quotes for an exact phrase. from/to apply at UTC-day granularity; the last 7 days are searched when both are omitted.',
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
                        'Restrict the count to a single team. All teams you can access are counted when omitted.',
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
                    description: 'Restrict the count to these scenario IDs',
                },
                status: {
                    ...EXECUTION_STATUS_FILTER_SCHEMA,
                    description:
                        'Which outcomes to search: 1 = successful, 2 = warning, 3 = error. All outcomes when omitted.',
                },
            },
            required: ['organizationId', 'query'],
        },
        examples: [{ organizationId: 5, query: '"order_id":"12345"' }],
        execute: async (make: Make, args: { organizationId: number } & CountIoDataMatchesOptions) => {
            const { organizationId, ...options } = args;
            return await make.executions.countIoDataMatches(organizationId, options);
        },
    },
    {
        name: 'executions_search-io-data-in-execution',
        title: 'Search data of one run',
        description:
            'Full-text search the input/output data of a single run and return every matching module IO record with highlighted snippets, plus the run metadata. A run is also called an execution. Use it after executions_search-io-data to see all matches in one run (that tool returns at most 5 per run). Wrap the query in double quotes for an exact phrase. from/to apply at UTC-day granularity and default to the last 7 days, so pass a window that covers the run for older runs. Requires the Pro plan or above.',
        category: 'executions',
        scope: 'organizations:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'executionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID the scenario belongs to' },
                scenarioId: { type: 'number', description: 'The scenario ID the run belongs to' },
                executionId: {
                    type: 'string',
                    description:
                        "The run ID to search in — a 32-character lowercase hex string (e.g. 'a07e16f2ad134bf49cf83a00aa95c0a5')",
                },
                query: {
                    type: 'string',
                    maxLength: 100,
                    description: 'Free-text expression to match against module IO data. Quoted phrases are supported.',
                },
                from: {
                    type: 'number',
                    description: 'Start of the time window, in epoch milliseconds (UTC-day granularity)',
                },
                to: {
                    type: 'number',
                    description: 'End of the time window, in epoch milliseconds (UTC-day granularity)',
                },
                appNames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to IO data produced by any of these apps (by app name)',
                },
                moduleNames: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the search to these module names',
                },
                status: {
                    ...EXECUTION_STATUS_FILTER_SCHEMA,
                    description:
                        'Which outcomes to search: 1 = successful, 2 = warning, 3 = error. All outcomes when omitted.',
                },
            },
            required: ['organizationId', 'scenarioId', 'executionId', 'query'],
        },
        examples: [
            {
                organizationId: 5,
                scenarioId: 925,
                executionId: 'a07e16f2ad134bf49cf83a00aa95c0a5',
                query: '"order_id":"12345"',
            },
        ],
        execute: async (
            make: Make,
            args: { organizationId: number; scenarioId: number; executionId: string } & SearchExecutionIoDataOptions,
        ) => {
            const { organizationId, scenarioId, executionId, ...options } = args;
            return await make.executions.searchIoDataInExecution(organizationId, scenarioId, executionId, options);
        },
    },
    {
        name: 'executions_search',
        title: 'Search runs',
        description:
            'Search runs across an organization (all teams you can access, or one team via teamId), newest first, by time window, status, scenario, or a substring of the error message (matches are highlighted). A run is also called an execution. Use it to find failed or warning runs across many scenarios at once; for a single scenario, executions_list is enough. from/to apply at UTC-day granularity; the last 7 days are searched by default.',
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
                errorMessage: {
                    type: 'string',
                    description: "Substring to match against the run's error message",
                },
                scenarioIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Restrict the search to these scenario IDs',
                },
                status: {
                    ...EXECUTION_STATUS_FILTER_SCHEMA,
                    description: 'Run statuses to include: 1 = successful, 2 = warning, 3 = error',
                },
                pageSize: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    default: DEFAULT_EXECUTION_SEARCH_PAGE_SIZE,
                    description: 'Maximum number of runs to return',
                },
                pageIndex: { type: 'number', minimum: 0, description: 'Zero-based index of the page to return' },
            },
            required: ['organizationId'],
        },
        examples: [
            { organizationId: 5, status: [3] },
            { organizationId: 5, errorMessage: 'timeout', teamId: 12 },
        ],
        execute: async (make: Make, args: { organizationId: number } & SearchExecutionsOptions) => {
            const { organizationId, ...options } = args;
            return await make.executions.search(organizationId, {
                ...options,
                pageSize: options.pageSize ?? DEFAULT_EXECUTION_SEARCH_PAGE_SIZE,
            });
        },
    },
];
