import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { JSONSchema, MakeTool } from '../tools.js';
import type {
    CreateDataTableRecordBody,
    CreateDataTableRecordsBody,
    DataTableFilter,
    DataTableRecord,
    ValidateDataTableQueryBody,
} from './data-table-records.js';

/**
 * Filter-mode filter, mirroring the `DataTableFilter` type: an array of AND-groups
 * joined by OR, each predicate naming a column, an operator, and a value.
 */
const filterSchema: JSONSchema = {
    type: 'array',
    items: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                columnName: {
                    type: 'string',
                    description:
                        "Column name to filter on; may be dotted to reach into a collection column's nested fields (e.g. customer.address.city)",
                },
                operator: {
                    type: 'string',
                    enum: [
                        'exist',
                        'notexist',
                        'text:equal',
                        'text:equal:ci',
                        'text:notequal',
                        'text:notequal:ci',
                        'text:contain',
                        'text:contain:ci',
                        'text:notcontain',
                        'text:notcontain:ci',
                        'text:startwith',
                        'text:pattern',
                        'text:like',
                        'text:notlike',
                        'text:in',
                        'text:notin',
                        'number:equal',
                        'number:notequal',
                        'number:greater',
                        'number:less',
                        'number:greaterorequal',
                        'number:lessorequal',
                        'number:in',
                        'number:notin',
                        'number:between',
                        'number:notbetween',
                        'date:equal',
                        'date:greater',
                        'date:less',
                        'date:greaterorequal',
                        'date:lessorequal',
                        'date:in',
                        'date:notin',
                        'date:between',
                        'date:notbetween',
                        'array:contain',
                        'boolean:equal',
                        'boolean:notequal',
                        'boolean:istrue',
                        'boolean:isfalse',
                    ],
                    description:
                        "Comparison operator; the prefix names the column-type family ('date:' covers both date and date_time columns), ':ci' variants compare case-insensitively",
                },
                value: {
                    description:
                        "Value to compare against; omit for unary operators like 'exist' or 'boolean:istrue'",
                },
            },
            required: ['columnName', 'operator'],
        },
        description: 'AND-group of predicates that must all match',
    },
    description:
        'Filter-mode filter: an array of AND-groups joined by OR — [[a, b], [c]] matches records satisfying (a AND b) OR c',
};

export const tools: MakeTool[] = [
    {
        name: 'data-table-records_list',
        title: 'List data table records',
        description: 'List or search records in a data table. Supports filtering, full-text query, and sorting.',
        category: 'data-table-records',
        scope: 'datastores:read',
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
                dataTableId: { type: 'number', description: 'The data table ID to list records from' },
                limit: { type: 'integer', description: 'Maximum number of records to return' },
                page: { type: 'integer', description: 'Page number to return (1-based)' },
                filter: filterSchema,
                query: { type: 'string', description: 'Query-mode expression to search records' },
                keys: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Restrict the result to specific record keys',
                },
                sortBy: { type: 'string', description: 'Column to sort results by' },
                sortDir: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
            },
            required: ['dataTableId'],
        },
        examples: [
            { dataTableId: 137, limit: 10 },
            { dataTableId: 137, filter: [[{ columnName: 'status', operator: 'text:equal', value: 'active' }]] },
        ],
        execute: async (
            make: Make,
            args: {
                dataTableId: number;
                limit?: number;
                page?: number;
                filter?: DataTableFilter;
                query?: string;
                keys?: string[];
                sortBy?: string;
                sortDir?: 'asc' | 'desc';
            },
        ) => {
            const { dataTableId, ...options } = args;
            return await make.dataTables.records.list(dataTableId, options);
        },
    },
    {
        name: 'data-table-records_get',
        title: 'Get data table record',
        description: 'Get a single record from a data table by its key.',
        category: 'data-table-records',
        scope: 'datastores:read',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'key',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the record' },
                key: { type: 'string', description: 'The record key to retrieve' },
            },
            required: ['dataTableId', 'key'],
        },
        examples: [{ dataTableId: 137, key: 'customer-1' }],
        execute: async (make: Make, args: { dataTableId: number; key: string }) => {
            return await make.dataTables.records.get(args.dataTableId, args.key);
        },
    },
    {
        name: 'data-table-records_exists',
        title: 'Check data table record existence',
        description: 'Check whether a record with the given key exists in a data table.',
        category: 'data-table-records',
        scope: 'datastores:read',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'key',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to check' },
                key: { type: 'string', description: 'The record key to check' },
            },
            required: ['dataTableId', 'key'],
        },
        examples: [{ dataTableId: 137, key: 'customer-1' }],
        execute: async (make: Make, args: { dataTableId: number; key: string }) => {
            return await make.dataTables.records.exists(args.dataTableId, args.key);
        },
    },
    {
        name: 'data-table-records_create',
        title: 'Create data table record',
        description: 'Create a new record in a data table. The key is auto-generated when omitted.',
        category: 'data-table-records',
        scope: 'datastores:write',
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
                dataTableId: { type: 'number', description: 'The data table ID to create the record in' },
                key: { type: 'string', description: 'The record key; auto-generated when omitted' },
                data: { type: 'object', description: 'The record data keyed by column' },
                overwrite: {
                    type: 'boolean',
                    description: 'Whether to overwrite an existing record with the same key',
                },
            },
            required: ['dataTableId'],
        },
        examples: [{ dataTableId: 137, data: { name: 'John Doe', email: 'john.doe@example.com' } }],
        execute: async (make: Make, args: { dataTableId: number } & CreateDataTableRecordBody) => {
            const { dataTableId, ...body } = args;
            return await make.dataTables.records.create(dataTableId, body);
        },
    },
    {
        name: 'data-table-records_bulk-create',
        title: 'Bulk create data table records',
        description: 'Create multiple records in a data table at once.',
        category: 'data-table-records',
        scope: 'datastores:write',
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
                dataTableId: { type: 'number', description: 'The data table ID to create the records in' },
                records: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            key: { type: 'string', description: 'The record key; auto-generated when omitted' },
                            data: { type: 'object', description: 'The record data keyed by column' },
                        },
                    },
                    description: 'The records to create',
                },
                overwrite: {
                    type: 'boolean',
                    description: 'Whether to overwrite existing records with the same keys',
                },
            },
            required: ['dataTableId', 'records'],
        },
        examples: [{ dataTableId: 137, records: [{ data: { name: 'John Doe' } }, { data: { name: 'Jane Doe' } }] }],
        execute: async (make: Make, args: { dataTableId: number } & CreateDataTableRecordsBody) => {
            const { dataTableId, ...body } = args;
            return await make.dataTables.records.createMany(dataTableId, body);
        },
    },
    {
        name: 'data-table-records_update',
        title: 'Update data table record',
        description: 'Update specific fields of a record in a data table. Other fields are preserved.',
        category: 'data-table-records',
        scope: 'datastores:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'key',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the record' },
                key: { type: 'string', description: 'The record key to update' },
                data: { type: 'object', description: 'The record fields to update' },
            },
            required: ['dataTableId', 'key', 'data'],
        },
        examples: [{ dataTableId: 137, key: 'customer-1', data: { email: 'new.email@example.com' } }],
        execute: async (make: Make, args: { dataTableId: number; key: string; data: Record<string, JSONValue> }) => {
            return await make.dataTables.records.update(args.dataTableId, args.key, args.data);
        },
    },
    {
        name: 'data-table-records_bulk-update',
        title: 'Bulk update data table records',
        description: 'Update multiple records in a data table at once.',
        category: 'data-table-records',
        scope: 'datastores:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the records' },
                records: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            key: { type: 'string', description: 'The record key to update' },
                            data: { type: 'object', description: 'The record fields to update' },
                        },
                        required: ['key', 'data'],
                    },
                    description: 'The records to update',
                },
            },
            required: ['dataTableId', 'records'],
        },
        examples: [{ dataTableId: 137, records: [{ key: 'customer-1', data: { status: 'active' } }] }],
        execute: async (make: Make, args: { dataTableId: number; records: DataTableRecord[] }) => {
            return await make.dataTables.records.updateMany(args.dataTableId, args.records);
        },
    },
    {
        name: 'data-table-records_delete',
        title: 'Delete data table record',
        description: 'Delete a single record from a data table by its key.',
        category: 'data-table-records',
        scope: 'datastores:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        resourceId: 'key',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the record' },
                key: { type: 'string', description: 'The record key to delete' },
            },
            required: ['dataTableId', 'key'],
        },
        examples: [{ dataTableId: 137, key: 'customer-1' }],
        execute: async (make: Make, args: { dataTableId: number; key: string }) => {
            await make.dataTables.records.delete(args.dataTableId, args.key);
            return `Record has been deleted.`;
        },
    },
    {
        name: 'data-table-records_bulk-delete',
        title: 'Bulk delete data table records',
        description: 'Delete multiple records from a data table at once.',
        category: 'data-table-records',
        scope: 'datastores:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID containing the records' },
                keys: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'The record keys to delete',
                },
            },
            required: ['dataTableId', 'keys'],
        },
        examples: [{ dataTableId: 137, keys: ['customer-1', 'customer-2'] }],
        execute: async (make: Make, args: { dataTableId: number; keys: string[] }) => {
            return await make.dataTables.records.deleteMany(args.dataTableId, args.keys);
        },
    },
    {
        name: 'data-table-records_validate-query',
        title: 'Validate data table query',
        description:
            'Validate a Query-mode expression or Filter-mode filter against a data table without executing it.',
        category: 'data-table-records',
        scope: 'datastores:read',
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
                dataTableId: { type: 'number', description: 'The data table ID to validate against' },
                query: { type: 'string', description: 'Query-mode expression to validate' },
                filter: filterSchema,
            },
            required: ['dataTableId'],
        },
        examples: [
            { dataTableId: 137, query: "status = 'active'" },
            {
                dataTableId: 137,
                filter: [
                    [
                        { columnName: 'status', operator: 'text:equal', value: 'active' },
                        { columnName: 'age', operator: 'number:greater', value: 30 },
                    ],
                    [{ columnName: 'vip', operator: 'boolean:istrue' }],
                ],
            },
        ],
        execute: async (make: Make, args: { dataTableId: number } & ValidateDataTableQueryBody) => {
            const { dataTableId, ...body } = args;
            return await make.dataTables.records.validateQuery(dataTableId, body);
        },
    },
];
