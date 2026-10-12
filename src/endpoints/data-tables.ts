import type { FetchFunction } from '../types.js';
import { DataTableRecords } from './data-table-records.js';
import { DataTableColumns } from './data-table-columns.js';
import { DataTableUsingScenarios } from './data-table-using-scenarios.js';

/**
 * Represents a Make data table.
 *
 * Data tables are the next generation of data storage within Make, provided by a
 * dedicated service. Unlike data stores, whose record structure is defined by a
 * referenced data structure, data tables manage their structure through their own
 * column endpoints.
 */
export type DataTable = {
    /** Unique identifier of the data table */
    id: number;
    /** Name of the data table */
    name: string;
    /** Maximum storage size of the data table in megabytes */
    maxStorageSizeMb: number;
};

/**
 * Options for listing data tables.
 *
 * The data table service uses page-based pagination (`limit`/`page`) instead of the
 * SDK's shared offset-based `Pagination` type.
 */
export type ListDataTablesOptions = {
    /** Maximum number of data tables to return */
    limit?: number;
    /** Page number to return (1-based) */
    page?: number;
    /** Property to sort results by */
    sortBy?: 'name' | 'maxStorageSizeMb';
    /** Sort direction (ascending or descending) */
    sortDir?: 'asc' | 'desc';
};

/**
 * Body for creating a new data table.
 */
export type CreateDataTableBody = {
    /** The team ID to create the data table in */
    teamId: number;
    /** Name of the data table */
    name: string;
};

/**
 * Body for updating an existing data table.
 */
export type UpdateDataTableBody = {
    /** New name of the data table */
    name?: string;
    /** New maximum storage size of the data table in megabytes */
    maxStorageSizeMb?: number;
};

/**
 * Body for importing records into a data table from a file.
 * The accepted options depend on the file type.
 */
export type ImportDataTableRecordsBody =
    | {
          /** Type of the imported file */
          fileType: 'csv';
          /** File content to import */
          content: string;
          /** Whether the first row contains column headers */
          firstRowContainsHeaders?: boolean;
          /** Column delimiter used in the file */
          delimiter?: ',' | ';' | '\t' | '|';
      }
    | {
          /** Type of the imported file */
          fileType: 'xls' | 'xlsx';
          /** File content to import */
          content: string;
          /** Whether the first row contains column headers */
          firstRowContainsHeaders?: boolean;
          /** Name of the sheet to import */
          sheet?: string;
      }
    | {
          /** Type of the imported file */
          fileType: 'json';
          /** File content to import */
          content: string;
      };

/**
 * Internal response types (not exported)
 */
type ListDataTablesResponse = {
    total: number;
    data: DataTable[];
};

type ImportDataTableRecordsResponse = {
    imported: number;
};

/**
 * Class providing methods for working with Make data tables.
 */
export class DataTables {
    readonly #fetch: FetchFunction;

    /**
     * Access to methods for working with records within data tables
     */
    public readonly records: DataTableRecords;

    /**
     * Access to methods for working with columns of data tables
     */
    public readonly columns: DataTableColumns;

    /**
     * Access to methods for tracking which scenarios use a data table
     */
    public readonly usingScenarios: DataTableUsingScenarios;

    /**
     * Create a new DataTables instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
        this.records = new DataTableRecords(fetch);
        this.columns = new DataTableColumns(fetch);
        this.usingScenarios = new DataTableUsingScenarios(fetch);
    }

    /**
     * List data tables of a team.
     * @param teamId The team ID to filter data tables by
     * @param options Optional parameters for pagination and sorting
     * @returns Promise with the list of data tables
     */
    async list(teamId: number, options?: ListDataTablesOptions): Promise<DataTable[]> {
        return (
            await this.#fetch<ListDataTablesResponse>('/data-tables', {
                query: {
                    teamId,
                    limit: options?.limit,
                    page: options?.page,
                    sortBy: options?.sortBy,
                    sortDir: options?.sortDir,
                },
            })
        ).data;
    }

    /**
     * Get a single data table by ID.
     * @param dataTableId The data table ID to retrieve
     * @returns Promise with the data table
     */
    async get(dataTableId: number): Promise<DataTable> {
        return await this.#fetch<DataTable>(`/data-tables/${dataTableId}`);
    }

    /**
     * Create a new data table.
     * @param body The data table to create
     * @returns Promise with the created data table
     */
    async create(body: CreateDataTableBody): Promise<DataTable> {
        return await this.#fetch<DataTable>('/data-tables', {
            method: 'POST',
            body,
        });
    }

    /**
     * Update an existing data table.
     * @param dataTableId The data table ID to update
     * @param body The data table fields to update
     * @returns Promise with the updated data table
     */
    async update(dataTableId: number, body: UpdateDataTableBody): Promise<DataTable> {
        return await this.#fetch<DataTable>(`/data-tables/${dataTableId}`, {
            method: 'PATCH',
            body,
        });
    }

    /**
     * Delete a data table.
     * @param dataTableId The data table ID to delete
     * @returns Promise that resolves when the data table is deleted
     */
    async delete(dataTableId: number): Promise<void> {
        await this.#fetch(`/data-tables/${dataTableId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Import records into a data table from a file.
     * @param dataTableId The data table ID to import records into
     * @param body The file content and import options
     * @returns Promise with the number of imported records
     */
    async import(dataTableId: number, body: ImportDataTableRecordsBody): Promise<number> {
        return (
            await this.#fetch<ImportDataTableRecordsResponse>(`/data-tables/${dataTableId}/import`, {
                method: 'POST',
                body,
            })
        ).imported;
    }
}
