import type { MakeTool, JSONSchema } from '../tools.js';
import type { Make } from '../make.js';
import type {
    CreateFunctionV2Body,
    UpdateFunctionV2Body,
    PublishFunctionV2VersionBody,
    CreateFunctionV2RunBody,
    CreateFunctionV2InlineRunBody,
    ListFunctionsV2Options,
    ListFunctionV2RunsOptions,
    FunctionV2PageOptions,
    FunctionV2EndpointTypesBody,
} from './functions-v2.js';

const identifier: JSONSchema = {
    type: 'integer',
    minimum: 1,
    description: 'Positive resource identifier returned by Make.',
};
const teamId: JSONSchema = { ...identifier, description: 'Team ID from environment discovery or the Teams API.' };
const functionId: JSONSchema = { ...identifier, description: 'Functions v2 ID; not a legacy custom Function ID.' };
const runId: JSONSchema = { type: 'string', format: 'uuid', description: 'Run ID returned by Functions v2 execution.' };
const etag: JSONSchema = {
    type: 'string',
    minLength: 1,
    description:
        'Exact opaque ETag from functions_v2_get or the last mutation. A stale ETag fails; re-read before deciding how to resolve the conflict.',
};
const schema: JSONSchema = {
    type: 'object',
    properties: {},
    additionalProperties: true,
    description: 'Bounded JSON Schema Draft 2020-12 contract. Use {} for a permissive contract.',
};
const endpointIdentity = {
    appName: { type: 'string', minLength: 1, maxLength: 256 },
    appVersion: identifier,
    endpointName: { type: 'string', minLength: 1, maxLength: 256 },
} satisfies Record<string, JSONSchema>;
const content: JSONSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['source', 'inputSchema'],
    description:
        'TypeScript source and declared contracts, Connections and Endpoints. Source calls declared Endpoints by app/version/name and uses declared connection labels.',
    properties: {
        source: { type: 'string', description: 'Complete TypeScript Function source.' },
        inputSchema: schema,
        outputSchema: schema,
        connections: {
            type: 'object',
            maxProperties: 100,
            patternProperties: { '^.+$': identifier },
            additionalProperties: false,
            description: 'Map of connection labels to existing Connection IDs; no credentials or secrets.',
        },
        endpoints: {
            type: 'array',
            maxItems: 100,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['alias', 'appName', 'appVersion', 'endpointName'],
                properties: {
                    ...endpointIdentity,
                    appName: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 43,
                        pattern: '^(app(#|%23))?[a-z][0-9a-z-]{1,35}[0-9a-z]$',
                    },
                    endpointName: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 128,
                        pattern: '^[a-zA-Z][0-9a-zA-Z]{1,126}[0-9a-zA-Z]$',
                    },
                    alias: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 128,
                        description: 'Display name only; code does not call the alias.',
                    },
                    connectionKey: { type: 'string', minLength: 1, maxLength: 128 },
                },
            },
        },
        retryPolicy: {
            type: 'object',
            additionalProperties: false,
            required: ['maximumAttempts'],
            properties: {
                maximumAttempts: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 3,
                    description: 'Runtime attempts before Endpoint side effects. Independent of API request retries.',
                },
            },
        },
    },
};
const name: JSONSchema = { type: 'string', minLength: 1, maxLength: 128, description: 'Function name.' };
const description: JSONSchema = {
    anyOf: [{ type: 'string', maxLength: 1024 }, { type: 'null' }],
    description: 'Function description; null clears it.',
};
const data: JSONSchema = {
    description:
        'Any JSON value validated against the Function input contract. Omission and explicit null are distinct.',
};
const timeoutSeconds: JSONSchema = {
    type: 'integer',
    minimum: 1,
    maximum: 300,
    description: 'Execution limit per attempt. Defaults to 300 seconds.',
};
const page = (sortBy: string): JSONSchema => ({
    type: 'object',
    additionalProperties: false,
    properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        offset: { type: 'integer', minimum: 0 },
        sortBy: { type: 'string', enum: [sortBy] },
        sortDir: { type: 'string', enum: ['asc', 'desc'] },
    },
});

/** Canonical, harness-agnostic Functions v2 tools. Run submissions never wait or automatically retry. */
export const tools: MakeTool[] = [
    {
        name: 'functions_v2_list',
        title: 'List Functions v2',
        description: 'List team Functions and latest version contracts. Use versions_get for source.',
        category: 'functions-v2',
        scope: 'functions:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: {
                teamId: teamId,
                ids: { type: 'array', maxItems: 100, items: identifier },
                endpointAppNames: {
                    type: 'array',
                    maxItems: 100,
                    items: { type: 'string', minLength: 1, maxLength: 128 },
                },
                search: { type: 'string', maxLength: 256 },
                pg: page('id'),
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 7, pg: { limit: 10, offset: 0 } }],
        execute: async (make: Make, args: { teamId: number } & ListFunctionsV2Options) => {
            const { teamId, ...options } = args;
            return make.functionsV2.list(teamId, options);
        },
    },
    {
        name: 'functions_v2_get',
        title: 'Get Function v2',
        description: 'Read metadata, latest contracts and ETag. Source is available through functions_v2_versions_get.',
        category: 'functions-v2',
        scope: 'functions:read',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId },
            required: ['functionId'],
        },
        examples: [{ functionId: 42 }],
        execute: async (make: Make, args: { functionId: number }) => {
            return make.functionsV2.get(args.functionId);
        },
    },
    {
        name: 'functions_v2_create',
        title: 'Create Function v2',
        description: 'Create an inactive Function with version 1. Activate explicitly before published Runs.',
        category: 'functions-v2',
        scope: 'functions:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { teamId: teamId, name: name, description: description, content: content },
            required: ['teamId', 'name', 'content'],
        },
        examples: [
            {
                teamId: 7,
                name: 'Echo',
                content: {
                    source: 'export default async function main(input: unknown) { return input; }',
                    inputSchema: {},
                },
            },
        ],
        execute: async (make: Make, args: { teamId: number } & CreateFunctionV2Body) => {
            const { teamId, ...body } = args;
            return make.functionsV2.create(teamId, body);
        },
    },
    {
        name: 'functions_v2_update',
        title: 'Update Function v2 metadata',
        description: 'Change name/description with an ETag. To edit code or contracts, publish a version instead.',
        category: 'functions-v2',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, etag: etag, name: name, description: description },
            required: ['functionId', 'etag'],
        },
        examples: [{ functionId: 42, etag: '"opaque-token"', name: 'New name' }],
        execute: async (make: Make, args: { functionId: number; etag: string } & UpdateFunctionV2Body) => {
            const { functionId, etag, ...body } = args;
            return make.functionsV2.update(functionId, body, etag);
        },
    },
    {
        name: 'functions_v2_delete',
        title: 'Delete Function v2',
        description: 'Move a Function to trash using its current ETag.',
        category: 'functions-v2',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, etag: etag },
            required: ['functionId', 'etag'],
        },
        examples: [{ functionId: 42, etag: '"opaque-token"' }],
        execute: async (make: Make, args: { functionId: number; etag: string }) => {
            await make.functionsV2.delete(args.functionId, args.etag);
            return { deleted: true };
        },
    },
    {
        name: 'functions_v2_activate',
        title: 'Activate Function v2',
        description: 'Allow new published Runs. Does not publish code.',
        category: 'functions-v2',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, etag: etag },
            required: ['functionId', 'etag'],
        },
        examples: [{ functionId: 42, etag: '"opaque-token"' }],
        execute: async (make: Make, args: { functionId: number; etag: string }) => {
            return make.functionsV2.activate(args.functionId, args.etag);
        },
    },
    {
        name: 'functions_v2_deactivate',
        title: 'Deactivate Function v2',
        description: 'Reject new published Runs; in-flight Runs continue and inline Runs remain available.',
        category: 'functions-v2',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        resourceId: 'functionId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, etag: etag },
            required: ['functionId', 'etag'],
        },
        examples: [{ functionId: 42, etag: '"opaque-token"' }],
        execute: async (make: Make, args: { functionId: number; etag: string }) => {
            return make.functionsV2.deactivate(args.functionId, args.etag);
        },
    },
    {
        name: 'functions_v2_versions_list',
        title: 'List Function v2 versions',
        description: 'List immutable published version contracts with pagination.',
        category: 'functions-v2.versions',
        scope: 'functions:read',
        scopeId: 'functionId',
        identifier: 'functionId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, pg: page('version') },
            required: ['functionId'],
        },
        examples: [{ functionId: 42 }],
        execute: async (make: Make, args: { functionId: number } & FunctionV2PageOptions<'version'>) => {
            const { functionId, ...options } = args;
            return make.functionsV2.versions.list(functionId, options);
        },
    },
    {
        name: 'functions_v2_versions_get',
        title: 'Get Function v2 version',
        description: 'Read exact published source, input/output contracts, Connections and Endpoints.',
        category: 'functions-v2.versions',
        scope: 'functions:read',
        scopeId: 'functionId',
        identifier: 'functionId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, version: identifier },
            required: ['functionId', 'version'],
        },
        examples: [{ functionId: 42, version: 1 }],
        execute: async (make: Make, args: { functionId: number; version: number }) => {
            return make.functionsV2.versions.get(args.functionId, args.version);
        },
    },
    {
        name: 'functions_v2_versions_publish',
        title: 'Publish Function v2 version',
        description:
            'Publish content only if expectedLatestVersion matches. Does not activate the Function. A conflict requires reading current versions before resolving.',
        category: 'functions-v2.versions',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, content: content, expectedLatestVersion: identifier },
            required: ['functionId', 'content', 'expectedLatestVersion'],
        },
        examples: [
            {
                functionId: 42,
                expectedLatestVersion: 1,
                content: {
                    source: 'export default async function main(input: unknown) { return input; }',
                    inputSchema: {},
                },
            },
        ],
        execute: async (make: Make, args: { functionId: number } & PublishFunctionV2VersionBody) => {
            const { functionId, ...body } = args;
            return make.functionsV2.versions.publish(functionId, body);
        },
    },
    {
        name: 'functions_v2_runs_list',
        title: 'List Function v2 Runs',
        description: 'List admitted Runs with pagination and optional version/time filters.',
        category: 'functions-v2.runs',
        scope: 'functions:read',
        scopeId: 'functionId',
        identifier: 'functionId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: {
                functionId: functionId,
                pg: page('createdAt'),
                version: identifier,
                createdFrom: { type: 'string', format: 'date-time' },
                createdTo: { type: 'string', format: 'date-time' },
            },
            required: ['functionId'],
        },
        examples: [{ functionId: 42, version: 2 }],
        execute: async (make: Make, args: { functionId: number } & ListFunctionV2RunsOptions) => {
            const { functionId, ...options } = args;
            return make.functionsV2.runs.list(functionId, options);
        },
    },
    {
        name: 'functions_v2_runs_create',
        title: 'Run published Function v2',
        description:
            'Start one published Run and return immediately. Omitted version uses latest. Retrieve status/output with functions_v2_runs_get. An uncertain response may mean execution started: do not resubmit automatically.',
        category: 'functions-v2.runs',
        scope: 'functions:write',
        scopeId: 'functionId',
        identifier: 'functionId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { functionId: functionId, version: identifier, data: data, timeoutSeconds: timeoutSeconds },
            required: ['functionId'],
        },
        examples: [{ functionId: 42, version: 2, data: { value: false } }],
        execute: async (
            make: Make,
            args: { functionId: number } & Pick<CreateFunctionV2RunBody, 'data' | 'version' | 'timeoutSeconds'>,
        ) => {
            return make.functionsV2.runs.create(args.functionId, {
                data: args.data,
                version: args.version,
                timeoutSeconds: args.timeoutSeconds,
                responsive: false,
            });
        },
    },
    {
        name: 'functions_v2_runs_create_inline',
        title: 'Run inline Function v2',
        description:
            'Execute source without publishing; this is NOT a dry run and Endpoint calls can change external systems. Returns immediately. Retrieve status/output with functions_v2_runs_get. Do not automatically resubmit uncertain executions.',
        category: 'functions-v2.runs',
        scope: 'functions:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true, idempotentHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: {
                teamId: teamId,
                functionId: functionId,
                content: content,
                data: data,
                timeoutSeconds: timeoutSeconds,
            },
            required: ['teamId', 'content'],
        },
        examples: [
            {
                teamId: 7,
                content: {
                    source: 'export default async function main(input: unknown) { return input; }',
                    inputSchema: {},
                },
                data: { value: false },
            },
        ],
        execute: async (
            make: Make,
            args: { teamId: number } & Pick<
                CreateFunctionV2InlineRunBody,
                'content' | 'functionId' | 'data' | 'timeoutSeconds'
            >,
        ) => {
            return make.functionsV2.runs.createInline(args.teamId, {
                content: args.content,
                functionId: args.functionId,
                data: args.data,
                timeoutSeconds: args.timeoutSeconds,
                responsive: false,
            });
        },
    },
    {
        name: 'functions_v2_runs_get',
        title: 'Get Function v2 Run',
        description:
            'Read Run status, output, attempts and Endpoint-call timeline. Poll a pending Run without starting another execution.',
        category: 'functions-v2.runs',
        scope: 'functions:read',
        scopeId: 'runId',
        identifier: 'runId',
        resourceId: 'runId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: { type: 'object', additionalProperties: false, properties: { runId: runId }, required: ['runId'] },
        examples: [{ runId: '4b75e102-2c25-42de-8000-000000000001' }],
        execute: async (make: Make, args: { runId: string }) => {
            return make.functionsV2.runs.get(args.runId);
        },
    },
    {
        name: 'functions_v2_runs_cancel',
        title: 'Cancel Function v2 Run',
        description:
            'Request cancellation. Acceptance does not mean the Run has stopped: retrieve its status. Already completed Runs may return a conflict.',
        category: 'functions-v2.runs',
        scope: 'functions:write',
        scopeId: 'runId',
        identifier: 'runId',
        resourceId: 'runId',
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false, idempotentHint: false },
        inputSchema: { type: 'object', additionalProperties: false, properties: { runId: runId }, required: ['runId'] },
        examples: [{ runId: '4b75e102-2c25-42de-8000-000000000001' }],
        execute: async (make: Make, args: { runId: string }) => {
            return make.functionsV2.runs.cancel(args.runId);
        },
    },
    {
        name: 'functions_v2_endpoints_list',
        title: 'List Function v2 Endpoints',
        description:
            'Discover team-visible Endpoints and available Connection references. Requires both functions:read and apps:read. Use endpoints_types for declarations.',
        category: 'functions-v2.endpoints',
        scope: 'functions:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: { teamId: teamId },
            required: ['teamId'],
        },
        examples: [{ teamId: 7 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return make.functionsV2.endpoints.list(args.teamId);
        },
    },
    {
        name: 'functions_v2_endpoints_types',
        title: 'Get Function v2 Endpoint types',
        description:
            'Retrieve declarations for selected Endpoints, preserving unavailable statuses. Requires both functions:read and apps:read.',
        category: 'functions-v2.endpoints',
        scope: 'functions:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: {
                teamId: teamId,
                catalogId: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+-[a-f0-9]{64}$' },
                functionId: functionId,
                functionVersion: identifier,
                endpoints: {
                    type: 'array',
                    maxItems: 100,
                    items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: endpointIdentity,
                        required: ['appName', 'appVersion', 'endpointName'],
                    },
                },
            },
            required: ['teamId', 'endpoints'],
        },
        examples: [{ teamId: 7, endpoints: [{ appName: 'http', appVersion: 3, endpointName: 'Request' }] }],
        execute: async (make: Make, args: FunctionV2EndpointTypesBody) => {
            return make.functionsV2.endpoints.types(args);
        },
    },
];
