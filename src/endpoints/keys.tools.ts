import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'keys_list',
        title: 'List keys',
        description: 'List all keys for a team.',
        category: 'keys',
        scope: 'keys:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list keys for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.keys.list(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'keys_get',
        title: 'Get key',
        description: 'Get details of a specific key.',
        category: 'keys',
        scope: 'keys:read',
        scopeId: 'keyId',
        identifier: 'keyId',
        resourceId: 'keyId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                keyId: { type: 'number', description: 'The key ID to retrieve' },
            },
            required: ['keyId'],
        },
        examples: [{ keyId: 1 }],
        execute: async (make: Make, args: { keyId: number }) => {
            return await make.keys.get(args.keyId, { cols: ['*'] });
        },
    },
    {
        name: 'keys_create',
        title: 'Create key',
        description: 'Create a new key.',
        category: 'keys',
        scope: 'keys:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the key will be created' },
                name: { type: 'string', description: 'Name of the key' },
                typeName: { type: 'string', description: 'Type of the key' },
                parameters: { type: 'object', description: 'Key-specific configuration parameters' },
            },
            required: ['teamId', 'name', 'typeName', 'parameters'],
        },
        examples: [
            {
                teamId: 5,
                name: 'My API Key',
                typeName: 'basicauth',
                parameters: { user: 'admin', pass: 'secret' },
            },
        ],
        execute: async (
            make: Make,
            args: { teamId: number; name: string; typeName: string; parameters: Record<string, JSONValue> },
        ) => {
            return await make.keys.create(args);
        },
    },
    {
        name: 'keys_update',
        title: 'Update key',
        description: 'Update an existing key.',
        category: 'keys',
        scope: 'keys:write',
        scopeId: 'keyId',
        identifier: 'keyId',
        resourceId: 'keyId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                keyId: { type: 'number', description: 'The key ID to update' },
                name: { type: 'string', description: 'New name for the key' },
                parameters: { type: 'object', description: 'Updated key-specific configuration parameters' },
            },
            required: ['keyId'],
        },
        examples: [{ keyId: 1, name: 'My Updated Key' }],
        execute: async (make: Make, args: { keyId: number; name?: string; parameters?: Record<string, JSONValue> }) => {
            const { keyId, ...body } = args;
            await make.keys.update(keyId, body);
            return `Key has been updated.`;
        },
    },
    {
        name: 'keys_delete',
        title: 'Delete key',
        description: 'Delete a key.',
        category: 'keys',
        scope: 'keys:write',
        scopeId: 'keyId',
        identifier: 'keyId',
        resourceId: 'keyId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                keyId: { type: 'number', description: 'The key ID to delete' },
            },
            required: ['keyId'],
        },
        examples: [{ keyId: 1 }],
        execute: async (make: Make, args: { keyId: number }) => {
            await make.keys.delete(args.keyId);
            return `Key has been deleted.`;
        },
    },
];
