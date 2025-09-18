import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';

export const tools = [
    {
        name: 'sdk_connections_list',
        title: 'List SDK connections',
        description: 'List connections for a specific app',
        category: 'sdk.connections',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
            },
            required: ['appName'],
        },
        execute: async (make: Make, args: { appName: string }) => {
            return await make.sdk.connections.list(args.appName);
        },
    },
    {
        name: 'sdk_connections_get',
        title: 'Get SDK connection',
        description: 'Get a single connection by name',
        category: 'sdk.connections',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
            },
            required: ['connectionName'],
        },
        execute: async (make: Make, args: { connectionName: string }) => {
            return await make.sdk.connections.get(args.connectionName);
        },
    },
    {
        name: 'sdk_connections_create',
        title: 'Create SDK connection',
        description: 'Create a new connection for a specific app',
        category: 'sdk.connections',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                type: { type: 'string', description: 'The type of the connection' },
                label: { type: 'string', description: 'The label of the connection visible in the scenario builder' },
            },
            required: ['appName', 'type', 'label'],
        },
        execute: async (make: Make, args: { appName: string; type: string; label: string }) => {
            const { appName, ...body } = args;
            return await make.sdk.connections.create(appName, body);
        },
    },
    {
        name: 'sdk_connections_update',
        title: 'Update SDK connection',
        description: 'Update an existing connection',
        category: 'sdk.connections',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
                label: { type: 'string', description: 'The label of the connection visible in the scenario builder' },
            },
            required: ['connectionName'],
        },
        execute: async (make: Make, args: { connectionName: string; label?: string }) => {
            const { connectionName, ...body } = args;
            return await make.sdk.connections.update(connectionName, body);
        },
    },
    {
        name: 'sdk_connections_delete',
        title: 'Delete SDK connection',
        description: 'Delete a connection',
        category: 'sdk.connections',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
            },
            required: ['connectionName'],
        },
        execute: async (make: Make, args: { connectionName: string }) => {
            await make.sdk.connections.delete(args.connectionName);
            return `Connection has been deleted.`;
        },
    },
    {
        name: 'sdk_connections_get_section',
        title: 'Get SDK connection section',
        description: 'Get a specific section of a connection',
        category: 'sdk.connections',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
                section: {
                    type: 'string',
                    enum: ['api', 'parameters', 'scopes', 'scope', 'install', 'installSpec'],
                    description: 'The section to get',
                },
            },
            required: ['connectionName', 'section'],
        },
        execute: async (
            make: Make,
            args: {
                connectionName: string;
                section: 'api' | 'parameters' | 'scopes' | 'scope' | 'install' | 'installSpec';
            },
        ) => {
            return await make.sdk.connections.getSection(args.connectionName, args.section);
        },
    },
    {
        name: 'sdk_connections_set_section',
        title: 'Set SDK connection section',
        description: 'Set a specific section of a connection',
        category: 'sdk.connections',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
                section: {
                    type: 'string',
                    enum: ['api', 'parameters', 'scopes', 'scope', 'install', 'installSpec'],
                    description: 'The section to set',
                },
                body: { type: 'string', description: 'The section data to set in JSONC format' },
            },
            required: ['connectionName', 'section', 'body'],
        },
        execute: async (
            make: Make,
            args: {
                connectionName: string;
                section: 'api' | 'parameters' | 'scopes' | 'scope' | 'install' | 'installSpec';
                body: string;
            },
        ) => {
            await make.sdk.connections.setSection(args.connectionName, args.section, args.body);
            return `Section '${args.section}' has been set.`;
        },
    },
    {
        name: 'sdk_connections_get_common',
        title: 'Get SDK connection common data',
        description: 'Get common configuration for a connection',
        category: 'sdk.connections',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
            },
            required: ['connectionName'],
        },
        execute: async (make: Make, args: { connectionName: string }) => {
            return await make.sdk.connections.getCommon(args.connectionName);
        },
    },
    {
        name: 'sdk_connections_set_common',
        title: 'Set SDK connection common data',
        description: 'Set common configuration for a connection',
        category: 'sdk.connections',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                connectionName: { type: 'string', description: 'The name of the connection' },
                common: { type: 'object', description: 'The common data to set' },
            },
            required: ['connectionName', 'common'],
        },
        execute: async (make: Make, args: { connectionName: string; common: Record<string, JSONValue> }) => {
            await make.sdk.connections.setCommon(args.connectionName, args.common);
            return `Common data has been set.`;
        },
    },
];
