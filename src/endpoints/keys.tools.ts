import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { MakeTool } from '../tools.js';
import type { EntityVisibility } from './locked-entities.js';

export const tools: MakeTool[] = [
    {
        name: 'keys_list',
        title: 'List keys',
        description:
            'List all keys for a team. Each has a `visibility`: `team`, or `locked` (only its access list can see it); a locked one also carries `acl.permissions`, your own permissions on it. To pick a key for a scenario, list with `usable: true`.',
        category: 'keys',
        scope: 'keys:read',
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
                teamId: { type: 'number', description: 'The team ID to list keys for' },
                visibility: {
                    type: 'string',
                    enum: ['team', 'locked'],
                    description: 'Return only the keys with this visibility',
                },
                usable: {
                    type: 'boolean',
                    description:
                        '`true` returns the keys you can use in scenarios (team-visible, or locked with your `entity use`); `false` the locked ones you cannot use.',
                },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }, { teamId: 5, usable: true }],
        execute: async (make: Make, args: { teamId: number; visibility?: EntityVisibility; usable?: boolean }) => {
            const { teamId, ...options } = args;
            return await make.keys.list(teamId, { ...options, cols: ['*'] });
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
            destructiveHint: false,
            openWorldHint: false,
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
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
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
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
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
        name: 'keys_make-locked',
        title: 'Lock key',
        description:
            "Lock a key so that only the members of its access list can see and use it; you become its sole admin. Only the key's author can lock it. Fails with 400 (IM903) where locked connections are off for the organization.",
        category: 'keys',
        scope: 'keys:write',
        scopeId: 'keyId',
        identifier: 'keyId',
        resourceId: 'keyId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                keyId: { type: 'number', description: 'The key ID to lock' },
            },
            required: ['keyId'],
        },
        examples: [{ keyId: 1 }],
        execute: async (make: Make, args: { keyId: number }) => {
            return await make.keys.makeLocked(args.keyId);
        },
    },
    {
        name: 'keys_make-team',
        title: 'Make key available to team',
        description:
            'Make a locked key visible to the whole team again and clear its access list. Only an admin of the locked key can do this. Fails with 400 (IM903) where locked connections are off for the organization.',
        category: 'keys',
        scope: 'keys:write',
        scopeId: 'keyId',
        identifier: 'keyId',
        resourceId: 'keyId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                keyId: { type: 'number', description: 'The key ID to make visible to the team' },
            },
            required: ['keyId'],
        },
        examples: [{ keyId: 1 }],
        execute: async (make: Make, args: { keyId: number }) => {
            return await make.keys.makeTeam(args.keyId);
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
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
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
