import type { FetchFunction, JSONValue } from '../types.js';

/**
 * Represents a record in a Make data table.
 * Each record consists of a unique key and structured data matching the table's columns.
 */
export type DataTableRecord = {
    /** Unique identifier of the record within the data table */
    key: string;
    /** The record's data as a structured object keyed by column */
    data: Record<string, JSONValue>;
};

/**
 * Options for listing or searching data table records.
 *
 * The data table service uses page-based pagination (`limit`/`page`) instead of the
 * SDK's shared offset-based `Pagination` type.
 */
export type ListDataTableRecordsOptions = {
    /** Maximum number of records to return */
    limit?: number;
    /** Page number to return (1-based) */
    page?: number;
    /** Filter-mode filter to restrict the returned records */
    filter?: string;
    /** Query-mode expression to search records */
    query?: string;
    /** Restrict the result to specific record keys */
    keys?: string[];
    /** Column to sort results by */
    sortBy?: string;
    /** Sort direction (ascending or descending) */
    sortDir?: 'asc' | 'desc';
};

/**
 * Body for creating a new data table record.
 */
export type CreateDataTableRecordBody = {
    /** Record key; auto-generated when omitted */
    key?: string;
    /** The record's data keyed by column */
    data?: Record<string, JSONValue>;
    /** Whether to overwrite an existing record with the same key */
    overwrite?: boolean;
};

/**
 * Body for creating multiple data table records at once.
 */
export type CreateDataTableRecordsBody = {
    /** Records to create; keys are auto-generated when omitted */
    records: Array<{
        /** Record key; auto-generated when omitted */
        key?: string;
        /** The record's data keyed by column */
        data?: Record<string, JSONValue>;
    }>;
    /** Whether to overwrite existing records with the same keys */
    overwrite?: boolean;
};

/**
 * Body for validating a Query-mode expression or Filter-mode filter.
 */
export type ValidateDataTableQueryBody = {
    /** Query-mode expression to validate */
    query?: string;
    /** Filter-mode filter to validate */
    filter?: JSONValue;
};

/**
 * Result of validating a Query-mode expression or Filter-mode filter.
 */
export type DataTableQueryValidation = {
    /** Whether the expression or filter is valid */
    valid: boolean;
    /** Validation error message when invalid */
    error?: string;
    /** Position of the error within the expression when invalid */
    position?: number;
};

/**
 * Internal response types (not exported)
 */
type ListDataTableRecordsResponse = {
    total: number;
    data: DataTableRecord[];
};

type BulkDataTableRecordsResponse = {
    records: DataTableRecord[];
};

type BulkDeleteDataTableRecordsResponse = {
    keys: string[];
};

type ExistsDataTableRecordResponse = {
    exists: boolean;
};

/**
 * Class providing methods for working with records in Make data tables.
 */
export class DataTableRecords {
    readonly #fetch: FetchFunction;

    /**
     * Create a new DataTableRecords instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List or search records in a data table.
     * @param dataTableId The data table ID to list records from
     * @param options Optional parameters for filtering, searching, pagination, and sorting
     * @returns Promise with the list of records
     */
    async list(dataTableId: number, options?: ListDataTableRecordsOptions): Promise<DataTableRecord[]> {
        return (
            await this.#fetch<ListDataTableRecordsResponse>(`/data-tables/${dataTableId}/records`, {
                query: {
                    limit: options?.limit,
                    page: options?.page,
                    filter: options?.filter,
                    query: options?.query,
                    keys: options?.keys,
                    sortBy: options?.sortBy,
                    sortDir: options?.sortDir,
                },
            })
        ).data;
    }

    /**
     * Get a single record from a data table.
     * @param dataTableId The data table ID containing the record
     * @param key The record key to retrieve
     * @returns Promise with the record
     */
    async get(dataTableId: number, key: string): Promise<DataTableRecord> {
        return await this.#fetch<DataTableRecord>(`/data-tables/${dataTableId}/records/${key}`);
    }

    /**
     * Check whether a record exists in a data table.
     * @param dataTableId The data table ID to check
     * @param key The record key to check
     * @returns Promise with true when the record exists
     */
    async exists(dataTableId: number, key: string): Promise<boolean> {
        return (await this.#fetch<ExistsDataTableRecordResponse>(`/data-tables/${dataTableId}/records/${key}/exists`))
            .exists;
    }

    /**
     * Create a new record in a data table.
     * @param dataTableId The data table ID to create the record in
     * @param body The record key (optional), data, and overwrite flag
     * @returns Promise with the created record
     */
    async create(dataTableId: number, body: CreateDataTableRecordBody): Promise<DataTableRecord> {
        return await this.#fetch<DataTableRecord>(`/data-tables/${dataTableId}/records`, {
            method: 'POST',
            body,
        });
    }

    /**
     * Create multiple records in a data table at once.
     * @param dataTableId The data table ID to create the records in
     * @param body The records to create and the overwrite flag
     * @returns Promise with the created records
     */
    async createMany(dataTableId: number, body: CreateDataTableRecordsBody): Promise<DataTableRecord[]> {
        return (
            await this.#fetch<BulkDataTableRecordsResponse>(`/data-tables/${dataTableId}/records/bulk`, {
                method: 'POST',
                body,
            })
        ).records;
    }

    /**
     * Update specific fields of a record in a data table.
     * Only updates the specified fields, preserving others.
     * @param dataTableId The data table ID containing the record
     * @param key The record key to update
     * @param data The record fields to update
     * @returns Promise with the updated record
     */
    async update(dataTableId: number, key: string, data: Record<string, JSONValue>): Promise<DataTableRecord> {
        return await this.#fetch<DataTableRecord>(`/data-tables/${dataTableId}/records/${key}`, {
            method: 'PATCH',
            body: {
                data,
            },
        });
    }

    /**
     * Update multiple records in a data table at once.
     * @param dataTableId The data table ID containing the records
     * @param records The records (key and data) to update
     * @returns Promise with the updated records
     */
    async updateMany(dataTableId: number, records: DataTableRecord[]): Promise<DataTableRecord[]> {
        return (
            await this.#fetch<BulkDataTableRecordsResponse>(`/data-tables/${dataTableId}/records`, {
                method: 'PATCH',
                body: {
                    records,
                },
            })
        ).records;
    }

    /**
     * Delete a single record from a data table.
     * @param dataTableId The data table ID containing the record
     * @param key The record key to delete
     * @returns Promise that resolves when the record is deleted
     */
    async delete(dataTableId: number, key: string): Promise<void> {
        await this.#fetch(`/data-tables/${dataTableId}/records/${key}`, {
            method: 'DELETE',
        });
    }

    /**
     * Delete multiple records from a data table at once.
     * @param dataTableId The data table ID containing the records
     * @param keys Record keys to delete
     * @returns Promise with the keys of the deleted records
     */
    async deleteMany(dataTableId: number, keys: string[]): Promise<string[]> {
        return (
            await this.#fetch<BulkDeleteDataTableRecordsResponse>(`/data-tables/${dataTableId}/records`, {
                method: 'DELETE',
                body: {
                    keys,
                },
            })
        ).keys;
    }

    /**
     * Validate a Query-mode expression or Filter-mode filter without executing it.
     * @param dataTableId The data table ID to validate against
     * @param body The expression or filter to validate
     * @returns Promise with the validation result
     */
    async validateQuery(dataTableId: number, body: ValidateDataTableQueryBody): Promise<DataTableQueryValidation> {
        return await this.#fetch<DataTableQueryValidation>(`/data-tables/${dataTableId}/records/query/validate`, {
            method: 'POST',
            body,
        });
    }
}
