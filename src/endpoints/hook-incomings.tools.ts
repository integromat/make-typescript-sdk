import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type { DeleteHookIncomingsOptions, ListHookIncomingsOptions } from './hook-incomings.js';

export const tools: MakeTool[] = [
    {
        name: 'hook-incomings_list',
        title: 'List webhook queue items',
        description:
            "List items currently waiting in a webhook's processing queue — payloads the webhook received but hasn't handed off to a scenario yet (e.g. because the scenario isn't active).",
        category: 'hook-incomings',
        scope: 'hooks:read',
        scopeId: 'hookId',
        identifier: 'hookId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to list queued items for' },
                from: {
                    type: 'integer',
                    description: 'Only include items queued at or after this Unix timestamp (ms)',
                },
                to: {
                    type: 'integer',
                    description: 'Only include items queued at or before this Unix timestamp (ms)',
                },
                pg: {
                    type: 'object',
                    description: 'Pagination and sorting options',
                    properties: {
                        sortBy: {
                            type: 'string',
                            enum: ['created'],
                            description: 'Sort queue items by their creation time',
                        },
                        sortDir: {
                            type: 'string',
                            enum: ['asc', 'desc'],
                            description: 'Sort direction',
                        },
                        offset: { type: 'integer', minimum: 0, description: 'Number of items to skip' },
                        limit: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10_000,
                            description: 'Maximum number of items to return (up to 10,000)',
                        },
                    },
                    additionalProperties: false,
                },
            },
            required: ['hookId'],
        },
        examples: [{ hookId: 11 }],
        execute: async (
            make: Make,
            args: { hookId: number; from?: number; to?: number; pg?: ListHookIncomingsOptions['pg'] },
        ) => {
            return await make.hooks.incomings.list(args.hookId, {
                from: args.from,
                to: args.to,
                pg: args.pg,
            });
        },
    },
    {
        name: 'hook-incomings_stats',
        title: 'Get webhook queue stats',
        description: "Get the current size and limit of a webhook's processing queue.",
        category: 'hook-incomings',
        scope: 'hooks:read',
        scopeId: 'hookId',
        identifier: 'hookId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to get queue stats for' },
            },
            required: ['hookId'],
        },
        examples: [{ hookId: 11 }],
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.incomings.stats(args.hookId);
        },
    },
    {
        name: 'hook-incomings_get',
        title: 'Get webhook queue item detail',
        description:
            'Get the full detail of a single queued item, including its payload when available. Confidential hooks omit payload data.',
        category: 'hook-incomings',
        scope: 'hooks:read',
        scopeId: 'hookId',
        identifier: 'hookId',
        resourceId: 'incomingId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID the queue item belongs to' },
                incomingId: {
                    type: 'string',
                    pattern: '^[0-9a-f]{32}$',
                    description: 'The 32-character lowercase hexadecimal ID of the queue item to retrieve',
                },
            },
            required: ['hookId', 'incomingId'],
        },
        examples: [{ hookId: 11, incomingId: '7a567f385d1a4f5ab7bff89162b7605e' }],
        execute: async (make: Make, args: { hookId: number; incomingId: string }) => {
            return await make.hooks.incomings.get(args.hookId, args.incomingId);
        },
    },
    {
        name: 'hook-incomings_delete',
        title: 'Delete webhook queue items',
        description:
            "Delete items from a webhook's processing queue. Specify `ids` to delete specific items, or `all: true` (with `confirmed: true`) to clear the entire queue. An item currently being processed cannot be deleted.",
        category: 'hook-incomings',
        scope: 'hooks:write',
        scopeId: 'hookId',
        identifier: 'hookId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to delete queue items for' },
                ids: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                    description: 'IDs of the queue items to delete',
                },
                exceptIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'When used with `all`, IDs of queue items to keep instead of deleting',
                },
                all: { type: 'boolean', description: 'Delete every item in the queue' },
                confirmed: {
                    type: 'boolean',
                    description: 'Required (and must be `true`) when `all` is used, to confirm the bulk deletion',
                },
            },
            required: ['hookId'],
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        hookId: { type: 'number' },
                        ids: { type: 'array', items: { type: 'string' }, minItems: 1 },
                    },
                    required: ['ids'],
                    additionalProperties: false,
                },
                {
                    type: 'object',
                    properties: {
                        hookId: { type: 'number' },
                        exceptIds: { type: 'array', items: { type: 'string' } },
                        all: { type: 'boolean', const: true },
                        confirmed: { type: 'boolean', const: true },
                    },
                    required: ['all', 'confirmed'],
                    additionalProperties: false,
                },
            ],
        },
        examples: [
            { hookId: 11, ids: ['d1efa5318a034d36ad7cbeac543573cf'] },
            { hookId: 11, all: true, confirmed: true },
        ],
        execute: async (make: Make, args: { hookId: number } & DeleteHookIncomingsOptions) => {
            const { hookId, ...options } = args;
            return await make.hooks.incomings.delete(hookId, options);
        },
    },
];
