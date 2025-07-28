import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'data_store_records_list',
        title: 'List data store records',
        description: 'List all records in a data store',
        category: 'data-store-records',
        scope: 'datastores:read',
        identifier: 'dataStoreId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID to list records from' },
                limit: { type: 'number', description: 'Maximum number of records to return' },
            },
            required: ['dataStoreId'],
        },
        execute: async (make: Make, args: { dataStoreId: number; limit?: number }) => {
            return await make.dataStores.records.list(args.dataStoreId, { pg: { limit: args.limit } });
        },
    },
    {
        name: 'data_store_records_create',
        title: 'Create data store record',
        description: 'Create a new record in a data store',
        category: 'data-store-records',
        scope: 'datastores:write',
        identifier: 'dataStoreId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID to create the record in' },
                key: { type: 'string', description: 'Unique key for the record (optional)' },
                data: { type: 'object', description: 'Record data' },
            },
            required: ['dataStoreId', 'data'],
        },
        execute: async (make: Make, args: { dataStoreId: number; data: Record<string, JSONValue>; key?: string }) => {
            if (args.key) {
                return await make.dataStores.records.create(args.dataStoreId, args.key, args.data);
            } else {
                return await make.dataStores.records.create(args.dataStoreId, args.data);
            }
        },
    },
    {
        name: 'data_store_records_update',
        title: 'Update data store record',
        description: 'Update an existing record in a data store',
        category: 'data-store-records',
        scope: 'datastores:write',
        identifier: 'dataStoreId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID containing the record' },
                key: { type: 'string', description: 'Unique key of the record to update' },
                data: { type: 'object', description: 'Updated record data' },
            },
            required: ['dataStoreId', 'key', 'data'],
        },
        execute: async (make: Make, args: { dataStoreId: number; key: string; data: Record<string, JSONValue> }) => {
            return await make.dataStores.records.update(args.dataStoreId, args.key, args.data);
        },
    },
    {
        name: 'data_store_records_replace',
        title: 'Replace data store record',
        description: "Replace an existing record in a data store or create if it doesn't exist",
        category: 'data-store-records',
        scope: 'datastores:write',
        identifier: 'dataStoreId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID containing the record' },
                key: { type: 'string', description: 'Unique key of the record to replace' },
                data: { type: 'object', description: 'New record data' },
            },
            required: ['dataStoreId', 'key', 'data'],
        },
        execute: async (make: Make, args: { dataStoreId: number; key: string; data: Record<string, JSONValue> }) => {
            return await make.dataStores.records.replace(args.dataStoreId, args.key, args.data);
        },
    },
    {
        name: 'data_store_records_delete',
        title: 'Delete data store records',
        description: 'Delete specific records from a data store by keys',
        category: 'data-store-records',
        scope: 'datastores:write',
        identifier: 'dataStoreId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStoreId: { type: 'number', description: 'The data store ID to delete records from' },
                keys: { type: 'array', items: { type: 'string' }, description: 'Array of record keys to delete' },
            },
            required: ['dataStoreId', 'keys'],
        },
        execute: async (make: Make, args: { dataStoreId: number; keys: string[] }) => {
            return await make.dataStores.records.delete(args.dataStoreId, args.keys);
        },
    },
];
