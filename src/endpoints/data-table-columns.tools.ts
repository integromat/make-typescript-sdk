import type { Make } from '../make.js';
import type { JSONSchema, MakeTool } from '../tools.js';
import type { CreateDataTableColumnBody, UpdateDataTableColumnBody } from './data-table-columns.js';

const columnTypeSchema: JSONSchema = {
    type: 'string',
    enum: [
        'text',
        'long_text',
        'phone_number',
        'email',
        'url',
        'number',
        'date',
        'date_time',
        'boolean',
        'file',
        'single_select',
        'multiple_select',
        'array',
        'collection',
    ],
    description: 'The type of the column',
};

const columnOptionsSchema: JSONSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Unique identifier of the option' },
            label: { type: 'string', description: 'Display label of the option' },
            color: { type: 'string', description: 'Optional display color of the option' },
        },
        required: ['id', 'label'],
    },
    description: 'Selectable options, for single_select and multiple_select columns',
};

export const tools: MakeTool[] = [
    {
        name: 'data-table-columns_list',
        title: 'List data table columns',
        description: 'List the columns of a data table.',
        category: 'data-table-columns',
        scope: 'data-tables:read',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to list columns from' },
                limit: { type: 'integer', description: 'Maximum number of columns to return' },
                page: { type: 'integer', description: 'Page number to return (1-based)' },
                sortBy: { type: 'string', enum: ['name', 'order'], description: 'Property to sort results by' },
                sortDir: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
            },
            required: ['dataTableId'],
        },
        examples: [{ dataTableId: 137 }],
        execute: async (
            make: Make,
            args: {
                dataTableId: number;
                limit?: number;
                page?: number;
                sortBy?: 'name' | 'order';
                sortDir?: 'asc' | 'desc';
            },
        ) => {
            const { dataTableId, ...options } = args;
            return await make.dataTables.columns.list(dataTableId, options);
        },
    },
    {
        name: 'data-table-columns_get',
        title: 'Get data table column',
        description: 'Get a single column of a data table by ID.',
        category: 'data-table-columns',
        scope: 'data-tables:read',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'columnId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the column' },
                columnId: { type: 'number', description: 'The column ID to retrieve' },
            },
            required: ['dataTableId', 'columnId'],
        },
        examples: [{ dataTableId: 137, columnId: 12 }],
        execute: async (make: Make, args: { dataTableId: number; columnId: number }) => {
            return await make.dataTables.columns.get(args.dataTableId, args.columnId);
        },
    },
    {
        name: 'data-table-columns_create',
        title: 'Create data table column',
        description: 'Create a new column in a data table.',
        category: 'data-table-columns',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to create the column in' },
                name: { type: 'string', description: 'The name of the column' },
                type: columnTypeSchema,
                required: { type: 'boolean', description: 'Whether a value is required in every record' },
                options: columnOptionsSchema,
                allowNewValues: {
                    type: 'boolean',
                    description: 'Whether values outside of options are allowed, for select columns',
                },
                items: { type: 'object', description: 'Item type specification, required for array columns' },
                fields: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Field definitions, required for collection columns',
                },
            },
            required: ['dataTableId', 'name', 'type'],
        },
        examples: [
            { dataTableId: 137, name: 'Email', type: 'email', required: true },
            {
                dataTableId: 137,
                name: 'Status',
                type: 'single_select',
                options: [
                    { id: 'active', label: 'Active' },
                    { id: 'inactive', label: 'Inactive' },
                ],
            },
        ],
        execute: async (make: Make, args: { dataTableId: number } & CreateDataTableColumnBody) => {
            const { dataTableId, ...body } = args;
            return await make.dataTables.columns.create(dataTableId, body);
        },
    },
    {
        name: 'data-table-columns_update',
        title: 'Update data table column',
        description:
            'Update an existing column of a data table. Set force to true to allow a lossy conversion of existing record values.',
        category: 'data-table-columns',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'columnId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the column' },
                columnId: { type: 'number', description: 'The column ID to update' },
                name: { type: 'string', description: 'The new name of the column' },
                type: columnTypeSchema,
                required: { type: 'boolean', description: 'Whether a value is required in every record' },
                options: columnOptionsSchema,
                allowNewValues: {
                    type: 'boolean',
                    description: 'Whether values outside of options are allowed, for select columns',
                },
                items: { type: 'object', description: 'Item type specification, for array columns' },
                fields: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Field definitions, for collection columns',
                },
                force: {
                    type: 'boolean',
                    description: 'Force the update even when it would cause a lossy conversion of existing values',
                },
            },
            required: ['dataTableId', 'columnId'],
        },
        examples: [{ dataTableId: 137, columnId: 12, name: 'Renamed Column' }],
        execute: async (
            make: Make,
            args: { dataTableId: number; columnId: number; force?: boolean } & UpdateDataTableColumnBody,
        ) => {
            const { dataTableId, columnId, force, ...body } = args;
            return await make.dataTables.columns.update(dataTableId, columnId, body, { force });
        },
    },
    {
        name: 'data-table-columns_delete',
        title: 'Delete data table column',
        description: 'Delete a column from a data table.',
        category: 'data-table-columns',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'columnId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the column' },
                columnId: { type: 'number', description: 'The column ID to delete' },
            },
            required: ['dataTableId', 'columnId'],
        },
        examples: [{ dataTableId: 137, columnId: 12 }],
        execute: async (make: Make, args: { dataTableId: number; columnId: number }) => {
            await make.dataTables.columns.delete(args.dataTableId, args.columnId);
            return `Column has been deleted.`;
        },
    },
    {
        name: 'data-table-columns_reorder',
        title: 'Reorder data table columns',
        description: 'Reorder the columns of a data table by providing the column IDs in the desired order.',
        category: 'data-table-columns',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to reorder columns in' },
                columnIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'The column IDs in the desired order',
                },
            },
            required: ['dataTableId', 'columnIds'],
        },
        examples: [{ dataTableId: 137, columnIds: [12, 10, 11] }],
        execute: async (make: Make, args: { dataTableId: number; columnIds: number[] }) => {
            return await make.dataTables.columns.reorder(args.dataTableId, args.columnIds);
        },
    },
];
