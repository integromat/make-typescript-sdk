import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { MakeTool } from '../tools.js';
import type { EntityVisibility } from './locked-entities.js';

export const tools: MakeTool[] = [
    {
        name: 'connections_list',
        title: 'List connections',
        description:
            'List connections for a team. Each has a `visibility`: `team`, or `locked` (only its access list can see it); a locked one also carries `acl.permissions`, your own permissions on it. To pick a connection for a scenario, list with `usable: true`.',
        category: 'connections',
        scope: 'connections:read',
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
                teamId: { type: 'number', description: 'The team ID to list connections for' },
                type: { type: 'array', items: { type: 'string' }, description: 'Filter by connection type' },
                scopes: {
                    type: 'object',
                    description:
                        'Scopes that are required on the requested connection types. Each connection type is a key in this object with an array of scopes as the value.',
                    patternProperties: {
                        '^.*$': {
                            type: 'array',
                            description: 'Array of scopes required on the particular connection type.',
                            items: { type: 'string' },
                        },
                    },
                },
                visibility: {
                    type: 'string',
                    enum: ['team', 'locked'],
                    description: 'Return only the connections with this visibility',
                },
                usable: {
                    type: 'boolean',
                    description:
                        '`true` returns the connections you can use in scenarios (team-visible, or locked with your `entity use`); `false` the locked ones you cannot use.',
                },
            },
            required: ['teamId'],
        },
        examples: [
            { teamId: 5 },
            { teamId: 5, type: ['google'], scopes: { google: ['https://www.googleapis.com/auth/drive'] } },
            { teamId: 5, usable: true },
        ],
        execute: async (
            make: Make,
            args: {
                teamId: number;
                type?: string[];
                scopes?: Record<string, string[]>;
                visibility?: EntityVisibility;
                usable?: boolean;
            },
        ) => {
            const { teamId, ...options } = args;
            return await make.connections.list(teamId, { ...options, cols: ['*'] });
        },
    },
    {
        name: 'connections_get',
        title: 'Get connection',
        description: 'Get details of a specific connection.',
        category: 'connections',
        scope: 'connections:read',
        scopeId: 'connectionId',
        identifier: 'connectionId',
        resourceId: 'connectionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to get' },
            },
            required: ['connectionId'],
        },
        examples: [{ connectionId: 2 }],
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.get(args.connectionId, { cols: ['*'] });
        },
    },
    {
        name: 'connections_create',
        title: 'Create connection',
        description: 'Create a new connection.',
        category: 'connections',
        scope: 'connections:write',
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
                name: { type: 'string', description: 'Human-readable name for the connection' },
                accountName: { type: 'string', description: 'Connection type name (internal identifier)' },
                teamId: { type: 'number', description: 'ID of the team to create the connection in' },
                data: { type: 'object', description: 'Connection configuration data' },
                scope: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'OAuth scopes',
                },
            },
            required: ['name', 'accountName', 'teamId'],
        },
        examples: [{ name: 'My Google Connection', accountName: 'google', teamId: 5 }],
        execute: async (
            make: Make,
            args: {
                name: string;
                accountName: string;
                accountType: string;
                teamId: number;
                data?: Record<string, JSONValue>;
                scope?: string[];
            },
        ) => {
            return await make.connections.create(args);
        },
    },
    {
        name: 'connections_update',
        title: 'Update connection',
        description: "Update a connection's configuration data.",
        category: 'connections',
        scope: 'connections:write',
        scopeId: 'connectionId',
        identifier: 'connectionId',
        resourceId: 'connectionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to update' },
                name: { type: 'string', description: 'The new name for the connection' },
                data: { type: 'object', description: 'Connection configuration data to update' },
            },
            required: ['connectionId'],
        },
        examples: [{ connectionId: 2, name: 'Updated Connection' }],
        execute: async (
            make: Make,
            args: { connectionId: number; name?: string; data?: Record<string, JSONValue> },
        ) => {
            if (args.name != null && args.name !== '') {
                await make.connections.rename(args.connectionId, args.name);
            }
            if (args.data != null) {
                await make.connections.update(args.connectionId, args.data);
            }
            return 'Connection has been updated.';
        },
    },
    {
        name: 'connections_verify',
        title: 'Verify connection',
        description: 'Verify if a connection is working correctly.',
        category: 'connections',
        scope: 'connections:write',
        scopeId: 'connectionId',
        identifier: 'connectionId',
        resourceId: 'connectionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to verify' },
            },
            required: ['connectionId'],
        },
        examples: [{ connectionId: 2 }],
        execute: async (make: Make, args: { connectionId: number }) => {
            return (await make.connections.verify(args.connectionId))
                ? 'Connection is valid.'
                : 'Connection is not valid.';
        },
    },
    {
        name: 'connections_make-locked',
        title: 'Lock connection',
        description:
            "Lock a connection so that only the members of its access list can see and use it; you become its sole admin. Only the connection's author can lock it. Fails with 400 (IM903) where locked connections are off for the organization.",
        category: 'connections',
        scope: 'connections:write',
        scopeId: 'connectionId',
        identifier: 'connectionId',
        resourceId: 'connectionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to lock' },
            },
            required: ['connectionId'],
        },
        examples: [{ connectionId: 2 }],
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.makeLocked(args.connectionId);
        },
    },
    {
        name: 'connections_make-team',
        title: 'Make connection available to team',
        description:
            'Make a locked connection visible to the whole team again and clear its access list. Only an admin of the locked connection can do this. Fails with 400 (IM903) where locked connections are off for the organization.',
        category: 'connections',
        scope: 'connections:write',
        scopeId: 'connectionId',
        identifier: 'connectionId',
        resourceId: 'connectionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to make visible to the team' },
            },
            required: ['connectionId'],
        },
        examples: [{ connectionId: 2 }],
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.makeTeam(args.connectionId);
        },
    },
    {
        name: 'connections_delete',
        title: 'Delete connection',
        description: 'Delete a connection.',
        category: 'connections',
        scope: 'connections:write',
        scopeId: 'connectionId',
        identifier: 'connectionId',
        resourceId: 'connectionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to delete' },
            },
            required: ['connectionId'],
        },
        examples: [{ connectionId: 2 }],
        execute: async (make: Make, args: { connectionId: number }) => {
            await make.connections.delete(args.connectionId);
            return 'Connection has been deleted.';
        },
    },
];
