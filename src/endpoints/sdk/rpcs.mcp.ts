import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';

export const tools = [
    {
        name: 'sdk_rpcs_list',
        title: 'List SDK RPCs',
        description: 'List all RPCs for the app',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
            },
            required: ['appName', 'appVersion'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number }) => {
            return await make.sdk.rpcs.list(args.appName, args.appVersion);
        },
    },
    {
        name: 'sdk_rpcs_get',
        title: 'Get SDK RPC',
        description: 'Get a single RPC by name',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                rpcName: { type: 'string', description: 'The name of the RPC' },
            },
            required: ['appName', 'appVersion', 'rpcName'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number; rpcName: string }) => {
            return await make.sdk.rpcs.get(args.appName, args.appVersion, args.rpcName);
        },
    },
    {
        name: 'sdk_rpcs_create',
        title: 'Create SDK RPC',
        description: 'Create a new RPC',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                name: { type: 'string', description: 'The name of the RPC' },
                label: { type: 'string', description: 'The label of the RPC visible in the scenario builder' },
            },
            required: ['appName', 'appVersion', 'name', 'label'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number; name: string; label: string }) => {
            const { appName, appVersion, ...body } = args;
            return await make.sdk.rpcs.create(appName, appVersion, body);
        },
    },
    {
        name: 'sdk_rpcs_update',
        title: 'Update SDK RPC',
        description: 'Update an existing RPC',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                rpcName: { type: 'string', description: 'The name of the RPC' },
                label: { type: 'string', description: 'The label of the RPC visible in the scenario builder' },
                connection: { type: 'string', description: 'Connection name' },
                altConnection: { type: 'string', description: 'Alternative connection name' },
            },
            required: ['appName', 'appVersion', 'rpcName'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                rpcName: string;
                label?: string;
                connection?: string;
                altConnection?: string;
            },
        ) => {
            const { appName, appVersion, rpcName, ...body } = args;
            return await make.sdk.rpcs.update(appName, appVersion, rpcName, body);
        },
    },
    {
        name: 'sdk_rpcs_delete',
        title: 'Delete SDK RPC',
        description: 'Delete an RPC',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                rpcName: { type: 'string', description: 'The name of the RPC' },
            },
            required: ['appName', 'appVersion', 'rpcName'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number; rpcName: string }) => {
            await make.sdk.rpcs.delete(args.appName, args.appVersion, args.rpcName);
            return `RPC has been deleted.`;
        },
    },
    {
        name: 'sdk_rpcs_test',
        title: 'Test SDK RPC',
        description: 'Test an RPC with provided data and schema',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                rpcName: { type: 'string', description: 'The name of the RPC' },
                data: { type: 'object', description: 'Test data object' },
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Parameter name' },
                            type: { type: 'string', description: 'Parameter type' },
                            required: { type: 'boolean', description: 'Whether parameter is required' },
                        },
                        required: ['name', 'type', 'required'],
                    },
                    description: 'Schema definition array',
                },
            },
            required: ['appName', 'appVersion', 'rpcName', 'data', 'schema'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                rpcName: string;
                data: Record<string, JSONValue>;
                schema: Array<{
                    name: string;
                    type: string;
                    required: boolean;
                }>;
            },
        ) => {
            const { appName, appVersion, rpcName, ...body } = args;
            return await make.sdk.rpcs.test(appName, appVersion, rpcName, body);
        },
    },
    {
        name: 'sdk_rpcs_get_section',
        title: 'Get SDK RPC section',
        description: 'Get RPC section data',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:read',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                rpcName: { type: 'string', description: 'The name of the RPC' },
                section: {
                    type: 'string',
                    enum: ['api', 'parameters'],
                    description: 'The section to get',
                },
            },
            required: ['appName', 'appVersion', 'rpcName', 'section'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                rpcName: string;
                section: 'api' | 'parameters';
            },
        ) => {
            return await make.sdk.rpcs.getSection(args.appName, args.appVersion, args.rpcName, args.section);
        },
    },
    {
        name: 'sdk_rpcs_set_section',
        title: 'Set SDK RPC section',
        description: 'Set RPC section data',
        category: 'sdk.rpcs',
        scope: 'sdk-apps:write',
        identifier: undefined,
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                rpcName: { type: 'string', description: 'The name of the RPC' },
                section: {
                    type: 'string',
                    enum: ['api', 'parameters'],
                    description: 'The section to set',
                },
                body: { type: 'object', description: 'The section data to set' },
            },
            required: ['appName', 'appVersion', 'rpcName', 'section', 'body'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                rpcName: string;
                section: 'api' | 'parameters';
                body: Record<string, JSONValue> | Array<Record<string, JSONValue>>;
            },
        ) => {
            await make.sdk.rpcs.setSection(args.appName, args.appVersion, args.rpcName, args.section, args.body);
            return `Section '${args.section}' has been set.`;
        },
    },
];
