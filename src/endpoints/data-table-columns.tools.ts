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

/**
 * One unrolled level of the recursive `DataTableColumnItems` type; the nested
 * `items`/`fields` levels are described in prose because the schema shape has no `$ref`.
 */
const columnItemsSchema: JSONSchema = {
    type: 'object',
    properties: {
        type: columnTypeSchema,
        options: columnOptionsSchema,
        allowNewValues: {
            type: 'boolean',
            description: 'Whether values outside of options are allowed, for select items',
        },
        fields: {
            type: 'array',
            items: { type: 'object' },
            description: "Field definitions (same shape as a collection column's fields), for collection items",
        },
        items: {
            type: 'object',
            description: 'Nested item type specification (same shape as this object), for array items',
        },
    },
    required: ['type'],
    description: 'Item type specification, for array columns',
};

/**
 * One unrolled level of the recursive `DataTableColumnField` type; the nested
 * `items`/`fields` levels are described in prose because the schema shape has no `$ref`.
 */
const columnFieldsSchema: JSONSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Name of the field' },
            type: columnTypeSchema,
            required: { type: 'boolean', description: 'Whether a value is required in the field' },
            options: columnOptionsSchema,
            allowNewValues: {
                type: 'boolean',
                description: 'Whether values outside of options are allowed, for select fields',
            },
            items: {
                type: 'object',
                description: "Item type specification (same shape as an array column's items), for array fields",
            },
            fields: {
                type: 'array',
                items: { type: 'object' },
                description: "Nested field definitions (same shape as this array's items), for collection fields",
            },
        },
        required: ['name', 'type'],
    },
    description: 'Field definitions, for collection columns',
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
                items: { ...columnItemsSchema, description: 'Item type specification, required for array columns' },
                fields: { ...columnFieldsSchema, description: 'Field definitions, required for collection columns' },
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
            { dataTableId: 137, name: 'Tags', type: 'array', items: { type: 'text' } },
            {
                dataTableId: 137,
                name: 'Address',
                type: 'collection',
                fields: [
                    { name: 'street', type: 'text', required: true },
                    { name: 'city', type: 'text', required: true },
                    { name: 'zip', type: 'text' },
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
                items: columnItemsSchema,
                fields: columnFieldsSchema,
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
