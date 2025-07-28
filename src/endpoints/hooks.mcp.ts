import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'hooks_list',
        title: 'List hooks',
        description: 'List webhooks for a specific team',
        category: 'hooks',
        scope: 'hooks:read',
        identifier: 'teamId',
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
        title: 'Get hook',
        description: 'Get details of a specific hook',
        category: 'hooks',
        scope: 'hooks:read',
        identifier: 'hookId',
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
        title: 'Create hook',
        description: 'Create a new webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'teamId',
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
        title: 'Update hook',
        description: 'Update an existing webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to update' },
                data: { type: 'object', description: 'New data configuration for the hook' },
            },
            required: ['hookId', 'data'],
        },
        execute: async (make: Make, args: { hookId: number; data: Record<string, JSONValue> }) => {
            return await make.hooks.update(args.hookId, { data: args.data });
        },
    },
    {
        name: 'hooks_delete',
        title: 'Delete hook',
        description: 'Delete a webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to delete' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.delete(args.hookId);
        },
    },
    {
        name: 'hooks_enable',
        title: 'Enable hook',
        description: 'Enable a webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to enable' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.enable(args.hookId);
        },
    },
    {
        name: 'hooks_disable',
        title: 'Disable hook',
        description: 'Disable a webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to disable' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.disable(args.hookId);
        },
    },
    {
        name: 'hooks_ping',
        title: 'Ping hook',
        description: 'Send a test ping to a webhook',
        category: 'hooks',
        scope: 'hooks:read',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to ping' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.ping(args.hookId);
        },
    },
    {
        name: 'hooks_learn_start',
        title: 'Start hook learning',
        description: 'Start learning mode for a webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to start learning for' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.learnStart(args.hookId);
        },
    },
    {
        name: 'hooks_learn_stop',
        title: 'Stop hook learning',
        description: 'Stop learning mode for a webhook',
        category: 'hooks',
        scope: 'hooks:write',
        identifier: 'hookId',
        inputSchema: {
            type: 'object',
            properties: {
                hookId: { type: 'number', description: 'The hook ID to stop learning for' },
            },
            required: ['hookId'],
        },
        execute: async (make: Make, args: { hookId: number }) => {
            return await make.hooks.learnStop(args.hookId);
        },
    },
];
