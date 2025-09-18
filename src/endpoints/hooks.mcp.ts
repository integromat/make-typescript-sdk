import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'hooks_list',
        title: 'List webhooks/mailhooks',
        description: 'List webhooks/mailhooks for a specific team',
        category: 'hooks',
        scope: 'hooks:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list hooks for' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.hooks.list(args.teamId);
        },
    },
    {
        name: 'hooks_get',
        title: 'Get webhook/mailhook',
        description: 'Get details of a specific webhook/mailhook',
        category: 'hooks',
        scope: 'hooks:read',
        identifier: 'hookId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to retrieve' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.get(args.hookId);
        },
    },
    {
        name: 'hooks_create',
        title: 'Create webhook/mailhook',
        description: 'Create a new webhook/mailhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the hook will be created' },
                name: { type: 'string', description: 'The name of the webhook' },
                typeName: {
                    type: 'string',
                    description: 'The hook type related to the app for which it will be created',
                },
                data: { type: 'object', description: 'Additional data specific to the hook type' },
            },
            required: ['teamId', 'name', 'typeName'],
        },
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
        description: 'Update an existing webhook/mailhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to update' },
                data: { type: 'object', description: 'New data configuration for the hook' },
            },
            required: ['hookId', 'data'],
        },
        execute: async (make: Make, args: { hookId: number; data: Record<string, JSONValue> }) => {
            await make.hooks.update(args.hookId, { data: args.data });
            return `Hook has been updated.`;
        },
    },
    {
        name: 'hooks_delete',
        title: 'Delete webhook/mailhook',
        description: 'Delete a webhook/mailhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to delete' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            await make.hooks.delete(args.hookId);
            return `Hook has been deleted.`;
        },
    },
];
