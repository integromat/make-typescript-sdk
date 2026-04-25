import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'data-stores_list',
        title: 'List data stores',
        description: 'List all data stores for a team.',
        category: 'data-stores',
        scope: 'datastores:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to filter data stores by' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.dataStores.list(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'data-stores_get',
        title: 'Get data store',
        description: 'Get data store details by ID.',
        category: 'data-stores',
        scope: 'datastores:read',
        scopeId: 'dataStoreId',
        identifier: 'dataStoreId',
        resourceId: 'dataStoreId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID to retrieve' },
            },
            required: ['dataStoreId'],
        },
        examples: [{ dataStoreId: 137 }],
        execute: async (make: Make, args: { dataStoreId: number }) => {
            return await make.dataStores.get(args.dataStoreId, { cols: ['*'] });
        },
    },
    {
        name: 'data-stores_create',
        title: 'Create data store',
        description: 'Create a new data store.',
        category: 'data-stores',
        scope: 'datastores:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name of the data store' },
                teamId: { type: 'number', description: 'ID of the team to create the data store in' },
                maxSizeMB: { type: 'number', description: 'Maximum size in MB for the data store' },
                datastructureId: {
                    type: 'number',
                    description: 'ID of the data structure defining the record format',
                },
            },
            required: ['name', 'teamId', 'maxSizeMB'],
        },
        examples: [{ name: 'Customers', teamId: 5, maxSizeMB: 1, datastructureId: 178 }],
        execute: async (
            make: Make,
            args: { name: string; teamId: number; maxSizeMB: number; datastructureId?: number },
        ) => {
            return await make.dataStores.create(args);
        },
    },
    {
        name: 'data-stores_update',
        title: 'Update data store',
        description: 'Update a data store.',
        category: 'data-stores',
        scope: 'datastores:write',
        scopeId: 'dataStoreId',
        identifier: 'dataStoreId',
        resourceId: 'dataStoreId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID to update' },
                name: { type: 'string', description: 'New name for the data store' },
                maxSizeMB: { type: 'number', description: 'New maximum size in MB for the data store' },
                datastructureId: { type: 'number', description: 'New data structure ID' },
            },
            required: ['dataStoreId'],
        },
        examples: [{ dataStoreId: 137, name: 'Updated Store', maxSizeMB: 2 }],
        execute: async (
            make: Make,
            args: { dataStoreId: number; name?: string; maxSizeMB?: number; datastructureId?: number },
        ) => {
            const { dataStoreId, ...body } = args;
            return await make.dataStores.update(dataStoreId, body);
        },
    },
    {
        name: 'data-stores_delete',
        title: 'Delete data store',
        description: 'Delete a data store.',
        category: 'data-stores',
        scope: 'datastores:write',
        scopeId: 'dataStoreId',
        identifier: 'dataStoreId',
        resourceId: 'dataStoreId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID to delete' },
            },
            required: ['dataStoreId'],
        },
        examples: [{ dataStoreId: 137 }],
        execute: async (make: Make, args: { dataStoreId: number }) => {
            await make.dataStores.delete(args.dataStoreId);
            return `Data store has been deleted.`;
        },
    },
];
