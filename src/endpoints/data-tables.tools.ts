import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type { CreateDataTableBody, ImportDataTableRecordsBody, UpdateDataTableBody } from './data-tables.js';

export const tools: MakeTool[] = [
    {
        name: 'data-tables_list',
        title: 'List data tables',
        description: 'List all data tables for a team.',
        category: 'data-tables',
        scope: 'data-tables:read',
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
                teamId: { type: 'number', description: 'The team ID to filter data tables by' },
                limit: { type: 'integer', description: 'Maximum number of data tables to return' },
                page: { type: 'integer', description: 'Page number to return (1-based)' },
                sortBy: {
                    type: 'string',
                    enum: ['name', 'maxStorageSizeMb'],
                    description: 'Property to sort results by',
                },
                sortDir: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (
            make: Make,
            args: {
                teamId: number;
                limit?: number;
                page?: number;
                sortBy?: 'name' | 'maxStorageSizeMb';
                sortDir?: 'asc' | 'desc';
            },
        ) => {
            const { teamId, ...options } = args;
            return await make.dataTables.list(teamId, options);
        },
    },
    {
        name: 'data-tables_get',
        title: 'Get data table',
        description: 'Get data table details by ID.',
        category: 'data-tables',
        scope: 'data-tables:read',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'dataTableId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to retrieve' },
            },
            required: ['dataTableId'],
        },
        examples: [{ dataTableId: 137 }],
        execute: async (make: Make, args: { dataTableId: number }) => {
            return await make.dataTables.get(args.dataTableId);
        },
    },
    {
        name: 'data-tables_create',
        title: 'Create data table',
        description:
            'Create a new data table. The table starts without columns; define its structure with data-table-columns_create.',
        category: 'data-tables',
        scope: 'data-tables:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to create the data table in' },
                name: { type: 'string', description: 'The name of the data table' },
            },
            required: ['teamId', 'name'],
        },
        examples: [{ teamId: 5, name: 'Customers' }],
        execute: async (make: Make, args: CreateDataTableBody) => {
            return await make.dataTables.create(args);
        },
    },
    {
        name: 'data-tables_update',
        title: 'Update data table',
        description: 'Update an existing data table.',
        category: 'data-tables',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to update' },
                name: { type: 'string', description: 'The new name of the data table' },
                maxStorageSizeMb: {
                    type: 'number',
                    description: 'The new maximum storage size of the data table in megabytes',
                },
            },
            required: ['dataTableId'],
        },
        examples: [{ dataTableId: 137, name: 'Updated Table' }],
        execute: async (make: Make, args: { dataTableId: number } & UpdateDataTableBody) => {
            const { dataTableId, ...body } = args;
            return await make.dataTables.update(dataTableId, body);
        },
    },
    {
        name: 'data-tables_delete',
        title: 'Delete data table',
        description: 'Delete a data table including all its records and columns.',
        category: 'data-tables',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to delete' },
            },
            required: ['dataTableId'],
        },
        examples: [{ dataTableId: 137 }],
        execute: async (make: Make, args: { dataTableId: number }) => {
            await make.dataTables.delete(args.dataTableId);
            return `Data table has been deleted.`;
        },
    },
    {
        name: 'data-tables_import',
        title: 'Import records into data table',
        description: 'Import records into a data table from a CSV, XLS(X), or JSON file content.',
        category: 'data-tables',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to import records into' },
                fileType: {
                    type: 'string',
                    enum: ['csv', 'xls', 'xlsx', 'json'],
                    description: 'The type of the imported file',
                },
                content: { type: 'string', description: 'The file content to import' },
                firstRowContainsHeaders: {
                    type: 'boolean',
                    description: 'Whether the first row contains column headers (csv, xls, xlsx)',
                },
                delimiter: {
                    type: 'string',
                    enum: [',', ';', '\t', '|'],
                    description: 'The column delimiter used in the file (csv only)',
                },
                sheet: { type: 'string', description: 'The name of the sheet to import (xls, xlsx only)' },
            },
            required: ['dataTableId', 'fileType', 'content'],
        },
        examples: [{ dataTableId: 137, fileType: 'csv', content: 'name,email\nJohn,john@example.com', delimiter: ',' }],
        execute: async (make: Make, args: { dataTableId: number } & ImportDataTableRecordsBody) => {
            const { dataTableId, ...body } = args;
            return await make.dataTables.import(dataTableId, body as ImportDataTableRecordsBody);
        },
    },
];
