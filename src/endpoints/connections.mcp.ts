import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'connections_list',
        title: 'List connections',
        description: 'List connections for a team',
        category: 'connections',
        scope: 'connections:read',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list connections for' },
                type: { type: 'array', items: { type: 'string' }, description: 'Filter by connection type' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number; type?: string[] }) => {
            return await make.connections.list(args.teamId, { type: args.type });
        },
    },
    {
        name: 'connections_get',
        title: 'Get connection',
        description: 'Get details of a specific connection',
        category: 'connections',
        scope: 'connections:read',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to get' },
            },
            required: ['connectionId'],
        },
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.get(args.connectionId);
        },
    },
    {
        name: 'connections_create',
        title: 'Create connection',
        description: 'Create a new connection',
        category: 'connections',
        scope: 'connections:write',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Connection type name (internal identifier)' },
                accountName: { type: 'string', description: 'Human-readable name for the connection' },
                accountType: { type: 'string', description: 'Authentication type (basic, oauth)' },
                teamId: { type: 'number', description: 'ID of the team to create the connection in' },
                data: { type: 'object', description: 'Connection configuration data' },
                scope: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'OAuth scopes',
                },
            },
            required: ['name', 'accountName', 'accountType', 'teamId'],
        },
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
        description: "Update a connection's configuration data",
        category: 'connections',
        scope: 'connections:write',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to update' },
                data: { type: 'object', description: 'Connection configuration data to update' },
            },
            required: ['connectionId', 'data'],
        },
        execute: async (make: Make, args: { connectionId: number; data: Record<string, JSONValue> }) => {
            return await make.connections.update(args.connectionId, args.data);
        },
    },
    {
        name: 'connections_rename',
        title: 'Rename connection',
        description: 'Rename a connection',
        category: 'connections',
        scope: 'connections:write',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to rename' },
                name: { type: 'string', description: 'The new name for the connection' },
            },
            required: ['connectionId', 'name'],
        },
        execute: async (make: Make, args: { connectionId: number; name: string }) => {
            return await make.connections.rename(args.connectionId, args.name);
        },
    },
    {
        name: 'connections_verify',
        title: 'Verify connection',
        description: 'Verify if a connection is working correctly',
        category: 'connections',
        scope: 'connections:write',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to verify' },
            },
            required: ['connectionId'],
        },
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.verify(args.connectionId);
        },
    },
    {
        name: 'connections_scoped',
        title: 'Verify connection scopes',
        description: 'Verify if given OAuth scopes are set for a given connection',
        category: 'connections',
        scope: 'connections:write',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to update scopes for' },
                scope: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of scope identifiers to set',
                },
            },
            required: ['connectionId', 'scope'],
        },
        execute: async (make: Make, args: { connectionId: number; scope: string[] }) => {
            return await make.connections.scoped(args.connectionId, args.scope);
        },
    },
    {
        name: 'connections_list_editable_parameters',
        title: 'List editable connection parameters',
        description: 'List editable parameters for a connection',
        category: 'connections',
        scope: 'connections:read',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to get editable parameters for' },
            },
            required: ['connectionId'],
        },
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.listEditableParameters(args.connectionId);
        },
    },
    {
        name: 'connections_delete',
        title: 'Delete connection',
        description: 'Delete a connection',
        category: 'connections',
        scope: 'connections:write',
        identifier: 'connectionId',
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: { type: 'number', description: 'The connection ID to delete' },
            },
            required: ['connectionId'],
        },
        execute: async (make: Make, args: { connectionId: number }) => {
            return await make.connections.delete(args.connectionId);
        },
    },
];
