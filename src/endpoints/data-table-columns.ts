import type { FetchFunction } from '../types.js';

/**
 * Type of a data table column.
 */
export type DataTableColumnType =
    | 'text'
    | 'long_text'
    | 'phone_number'
    | 'email'
    | 'url'
    | 'number'
    | 'date'
    | 'date_time'
    | 'boolean'
    | 'file'
    | 'single_select'
    | 'multiple_select'
    | 'array'
    | 'collection';

/**
 * A selectable option of a `single_select` or `multiple_select` column.
 */
export type DataTableColumnOption = {
    /** Unique identifier of the option */
    id: string;
    /** Display label of the option */
    label: string;
    /** Optional display color of the option */
    color?: string;
};

/**
 * Item type specification for `array` columns.
 *
 * The service models this as a discriminated union per column type; the SDK flattens
 * it into one type with optional fields — `options`/`allowNewValues` apply to select
 * types, `fields` to `collection`, and `items` to nested `array`.
 */
export type DataTableColumnItems = {
    /** Type of the array items */
    type: DataTableColumnType;
    /** Selectable options, for `single_select` and `multiple_select` items */
    options?: DataTableColumnOption[];
    /** Whether values outside of `options` are allowed, for select items */
    allowNewValues?: boolean;
    /** Field definitions, for `collection` items */
    fields?: DataTableColumnField[];
    /** Item type specification, for nested `array` items */
    items?: DataTableColumnItems;
};

/**
 * Field definition of a `collection` column.
 *
 * The service models this as a discriminated union per field type; the SDK flattens
 * it into one type with optional fields — see {@link DataTableColumnItems}.
 */
export type DataTableColumnField = {
    /** Name of the field */
    name: string;
    /** Type of the field */
    type: DataTableColumnType;
    /** Whether the field is required */
    required?: boolean;
    /** Selectable options, for `single_select` and `multiple_select` fields */
    options?: DataTableColumnOption[];
    /** Whether values outside of `options` are allowed, for select fields */
    allowNewValues?: boolean;
    /** Item type specification, for `array` fields */
    items?: DataTableColumnItems;
    /** Field definitions, for nested `collection` fields */
    fields?: DataTableColumnField[];
};

/**
 * Represents a column of a Make data table.
 *
 * The service models columns as a discriminated union per column type; the SDK
 * flattens it into one type with optional fields — `options`/`allowNewValues` are
 * present for select columns, `items` for `array` columns, and `fields` for
 * `collection` columns.
 */
export type DataTableColumn = {
    /** Unique identifier of the column */
    id: number;
    /** Name of the column */
    name: string;
    /** Type of the column */
    type: DataTableColumnType;
    /** Whether the column is locked and cannot be modified */
    locked: boolean;
    /** Whether a value is required in every record */
    required: boolean;
    /** Position of the column within the table */
    order: number;
    /** Selectable options, for `single_select` and `multiple_select` columns */
    options?: DataTableColumnOption[];
    /** Whether values outside of `options` are allowed, for select columns */
    allowNewValues?: boolean;
    /** Item type specification, for `array` columns */
    items?: DataTableColumnItems;
    /** Field definitions, for `collection` columns */
    fields?: DataTableColumnField[];
};

/**
 * Options for listing data table columns.
 *
 * The data table service uses page-based pagination (`limit`/`page`) instead of the
 * SDK's shared offset-based `Pagination` type.
 */
export type ListDataTableColumnsOptions = {
    /** Maximum number of columns to return */
    limit?: number;
    /** Page number to return (1-based) */
    page?: number;
    /** Property to sort results by */
    sortBy?: 'name' | 'order';
    /** Sort direction (ascending or descending) */
    sortDir?: 'asc' | 'desc';
};

/**
 * Body for creating a new data table column.
 */
export type CreateDataTableColumnBody = {
    /** Name of the column */
    name: string;
    /** Type of the column */
    type: DataTableColumnType;
    /** Whether a value is required in every record */
    required?: boolean;
    /** Selectable options, required for `single_select` and `multiple_select` columns */
    options?: DataTableColumnOption[];
    /** Whether values outside of `options` are allowed, for select columns */
    allowNewValues?: boolean;
    /** Item type specification, required for `array` columns */
    items?: DataTableColumnItems;
    /** Field definitions, required for `collection` columns */
    fields?: DataTableColumnField[];
};

/**
 * Body for updating an existing data table column.
 */
export type UpdateDataTableColumnBody = {
    /** New name of the column */
    name?: string;
    /** New type of the column */
    type?: DataTableColumnType;
    /** Whether a value is required in every record */
    required?: boolean;
    /** Selectable options, for `single_select` and `multiple_select` columns */
    options?: DataTableColumnOption[];
    /** Whether values outside of `options` are allowed, for select columns */
    allowNewValues?: boolean;
    /** Item type specification, for `array` columns */
    items?: DataTableColumnItems;
    /** Field definitions, for `collection` columns */
    fields?: DataTableColumnField[];
};

/**
 * Options for updating a data table column.
 */
export type UpdateDataTableColumnOptions = {
    /** Force the update even when it would cause a lossy conversion of existing record values */
    force?: boolean;
};

/**
 * Internal response types (not exported)
 */
type ListDataTableColumnsResponse = {
    total: number;
    data: DataTableColumn[];
};

/**
 * Class providing methods for working with columns of Make data tables.
 */
export class DataTableColumns {
    readonly #fetch: FetchFunction;

    /**
     * Create a new DataTableColumns instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List columns of a data table.
     * @param dataTableId The data table ID to list columns from
     * @param options Optional parameters for pagination and sorting
     * @returns Promise with the list of columns
     */
    async list(dataTableId: number, options?: ListDataTableColumnsOptions): Promise<DataTableColumn[]> {
        return (
            await this.#fetch<ListDataTableColumnsResponse>(`/data-tables/${dataTableId}/columns`, {
                query: {
                    limit: options?.limit,
                    page: options?.page,
                    sortBy: options?.sortBy,
                    sortDir: options?.sortDir,
                },
            })
        ).data;
    }

    /**
     * Get a single column of a data table.
     * @param dataTableId The data table ID containing the column
     * @param columnId The column ID to retrieve
     * @returns Promise with the column
     */
    async get(dataTableId: number, columnId: number): Promise<DataTableColumn> {
        return await this.#fetch<DataTableColumn>(`/data-tables/${dataTableId}/columns/${columnId}`);
    }

    /**
     * Create a new column in a data table.
     * @param dataTableId The data table ID to create the column in
     * @param body The column definition
     * @returns Promise with the created column
     */
    async create(dataTableId: number, body: CreateDataTableColumnBody): Promise<DataTableColumn> {
        return await this.#fetch<DataTableColumn>(`/data-tables/${dataTableId}/columns`, {
            method: 'POST',
            body,
        });
    }

    /**
     * Update an existing column of a data table.
     * @param dataTableId The data table ID containing the column
     * @param columnId The column ID to update
     * @param body The column fields to update
     * @param options Optional parameters (e.g. force a lossy conversion)
     * @returns Promise with the updated column
     */
    async update(
        dataTableId: number,
        columnId: number,
        body: UpdateDataTableColumnBody,
        options?: UpdateDataTableColumnOptions,
    ): Promise<DataTableColumn> {
        return await this.#fetch<DataTableColumn>(`/data-tables/${dataTableId}/columns/${columnId}`, {
            method: 'PATCH',
            query: {
                force: options?.force,
            },
            body,
        });
    }

    /**
     * Delete a column from a data table.
     * @param dataTableId The data table ID containing the column
     * @param columnId The column ID to delete
     * @returns Promise that resolves when the column is deleted
     */
    async delete(dataTableId: number, columnId: number): Promise<void> {
        await this.#fetch(`/data-tables/${dataTableId}/columns/${columnId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Reorder the columns of a data table.
     * @param dataTableId The data table ID to reorder columns in
     * @param columnIds Column IDs in the desired order
     * @returns Promise with the list of columns in the new order
     */
    async reorder(dataTableId: number, columnIds: number[]): Promise<DataTableColumn[]> {
        return (
            await this.#fetch<ListDataTableColumnsResponse>(`/data-tables/${dataTableId}/columns/order`, {
                method: 'PATCH',
                body: {
                    columnIds,
                },
            })
        ).data;
    }
}
