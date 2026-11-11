import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'hooks_list',
        title: 'List webhooks/mailhooks',
        description: 'List webhooks/mailhooks for a specific team.',
        category: 'hooks',
        scope: 'hooks:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list hooks for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.hooks.list(args.teamId);
        },
    },
    {
        name: 'hooks_list-for-organization',
        title: 'List organization webhooks/mailhooks',
        description:
            'List webhooks/mailhooks across all teams of an organization that you can view, including private spaces, with their team ID and URL. Filter by team, a name substring, type, whether they are assigned to a scenario, or whether they are enabled. Returns 50 hooks by default; use limit and offset to page. Use it to find a hook when you do not know its team; for a single team, hooks_list is enough.',
        category: 'hooks',
        scope: 'hooks:read',
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
                organizationId: { type: 'number', description: 'The organization ID to list hooks for' },
                teamId: { type: 'number', description: 'Restrict results to one team of the organization' },
                name: {
                    type: 'string',
                    description: 'Case-insensitive substring matched against the hook name',
                },
                typeName: {
                    type: 'string',
                    description: "Hook type name, e.g. 'gateway-webhook' or 'gateway-mailhook'",
                },
                assigned: { type: 'boolean', description: 'Whether the hook is assigned to a scenario' },
                enabled: { type: 'boolean', description: 'Whether the hook is enabled' },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    description: 'Maximum number of hooks to return (default 50)',
                },
                offset: { type: 'number', minimum: 0, description: 'Number of hooks to skip' },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 5 }, { organizationId: 5, name: 'order', typeName: 'gateway-webhook' }],
        execute: async (
            make: Make,
            args: {
                organizationId: number;
                teamId?: number;
                name?: string;
                typeName?: string;
                assigned?: boolean;
                enabled?: boolean;
                limit?: number;
                offset?: number;
            },
        ) => {
            const { organizationId, limit, offset, ...filters } = args;
            return await make.hooks.listForOrganization(organizationId, {
                ...filters,
                pg: limit !== undefined || offset !== undefined ? { limit, offset } : undefined,
            });
        },
    },
    {
        name: 'hooks_get',
        title: 'Get webhook/mailhook',
        description: 'Get details of a specific webhook/mailhook.',
        category: 'hooks',
        scope: 'hooks:read',
        scopeId: 'hookId',
        identifier: 'hookId',
        resourceId: 'hookId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to retrieve' },
            },
            required: ['hookId'],
        },
        examples: [{ hookId: 11 }],
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.get(args.hookId);
        },
    },
    {
        name: 'hooks_create',
        title: 'Create webhook/mailhook',
        description: 'Create a new webhook/mailhook.',
        category: 'hooks',
        scope: 'hooks:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the hook will be created' },
                name: { type: 'string', description: 'The name of the webhook' },
                typeName: {
                    type: 'string',
                    description:
                        "The hook type to create. Use 'gateway-webhook' for a generic custom webhook (receives HTTP requests) or 'gateway-mailhook' for a generic mailhook (receives emails). For app-specific hooks, use the hook type name of that app (find it via the app's modules).",
                },
                data: {
                    type: 'object',
                    description:
                        "Additional parameters specific to the hook type. Required parameters that have defaults in the hook type's manifest are filled automatically when omitted (e.g. for 'gateway-webhook' the booleans 'method', 'headers' and 'stringify' default to false). Parameters without defaults must be provided here (e.g. app-specific hooks often require their own fields).",
                },
            },
            required: ['teamId', 'name', 'typeName'],
        },
        examples: [
            { teamId: 5, name: 'My Webhook', typeName: 'gateway-webhook' },
            {
                teamId: 5,
                name: 'My Webhook with headers',
                typeName: 'gateway-webhook',
                data: { method: true, headers: true, stringify: false },
            },
        ],
        execute: async (
            make: Make,
            args: {
                teamId: number;
                name: string;
                typeName: string;
                data?: Record<string, JSONValue>;
            },
        ) => {
            return await make.hooks.create(args);
        },
    },
    {
        name: 'hooks_update',
        title: 'Update webhook/mailhook',
        description: 'Update an existing webhook/mailhook.',
        category: 'hooks',
        scope: 'hooks:write',
        scopeId: 'hookId',
        identifier: 'hookId',
        resourceId: 'hookId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to update' },
                data: { type: 'object', description: 'New data configuration for the hook' },
            },
            required: ['hookId', 'data'],
        },
        examples: [{ hookId: 11, data: { method: true, headers: true } }],
        execute: async (make: Make, args: { hookId: number; data: Record<string, JSONValue> }) => {
            await make.hooks.update(args.hookId, { data: args.data });
            return `Hook has been updated.`;
        },
    },
    {
        name: 'hooks_delete',
        title: 'Delete webhook/mailhook',
        description: 'Delete a webhook/mailhook.',
        category: 'hooks',
        scope: 'hooks:write',
        scopeId: 'hookId',
        identifier: 'hookId',
        resourceId: 'hookId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to delete' },
            },
            required: ['hookId'],
        },
        examples: [{ hookId: 11 }],
        execute: async (make: Make, args: { hookId: number }) => {
            await make.hooks.delete(args.hookId);
            return `Hook has been deleted.`;
        },
    },
];
