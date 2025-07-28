import type { FetchFunction, JSONValue, Pagination } from '../types.js';
import type { DataStructure } from './data-structures.js';

/**
 * Represents a record in a Make data store.
 * Each record consists of a unique key and structured data.
 */
export type DataStoreRecord = {
    /** Unique identifier of the record within the data store */
    key: string;
    /** The record's data as a structured object */
    data: Record<string, JSONValue>;
};

/**
 * Options for listing data store records.
 */
export type ListDataStoreRecordsOptions = {
    /** Pagination options (only offset and limit are supported) */
    pg?: Partial<Pick<Pagination<DataStoreRecord>, 'offset' | 'limit'>>;
};

/**
 * Response format for listing data store records.
 */
type ListDataStoreRecordsResponse = {
    /** List of records matching the query */
    records: DataStoreRecord[];
    /** Structure specification for the data store */
    spec: DataStructure;
    /** Pagination information */
    pg: Pick<Pagination<DataStoreRecord>, 'offset' | 'limit'>;
};

/**
 * Data to create a new record in a data store.
 * The content must match the data structure defined for the data store.
 */
export type CreateDataStoreRecordBody = Record<string, JSONValue>;

/**
 * Response format for creating a data store record.
 */
type CreateDataStoreRecordResponse = DataStoreRecord;

/**
 * Data to update an existing record in a data store.
 */
export type UpdateDataStoreRecordBody = Record<string, JSONValue>;

/**
 * Response format for updating a data store record.
 */
type UpdateDataStoreRecordResponse = DataStoreRecord;

/**
 * Class providing methods for working with records in Make data stores.
 * Allows creating, reading, updating, and deleting records within data stores.
 */
export class DataStoreRecords {
    readonly #fetch: FetchFunction;

    /**
     * Create a new DataStoreRecords instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List records in a data store.
     * @param dataStoreId The data store ID to list records from
     * @param options Optional parameters for pagination
     * @returns Promise with the list of records
     */
    async list(dataStoreId: number, options?: ListDataStoreRecordsOptions): Promise<DataStoreRecord[]> {
        return (
            await this.#fetch<ListDataStoreRecordsResponse>(`/data-stores/${dataStoreId}/data`, {
                query: {
                    pg: options?.pg,
                },
            })
        ).records;
    }

    /**
     * Create a new record in a data store with an explicit key.
     * @param dataStoreId The data store ID to create a record in
     * @param key The record key to use
     * @param body The record data
     * @returns Promise with the created record
     */
    async create(dataStoreId: number, key: string, body: CreateDataStoreRecordBody): Promise<DataStoreRecord>;

    /**
     * Create a new record in a data store with an auto-generated key.
     * @param dataStoreId The data store ID to create a record in
     * @param body The record data
     * @returns Promise with the created record
     */
    async create(dataStoreId: number, body: CreateDataStoreRecordBody): Promise<DataStoreRecord>;

    /**
     * Implementation of the create method handling both overloads.
     */
    async create(
        dataStoreId: number,
        keyOrBody?: string | CreateDataStoreRecordBody,
        justBody?: CreateDataStoreRecordBody,
    ): Promise<DataStoreRecord> {
        const key = typeof keyOrBody === 'string' ? keyOrBody : undefined;
        const body = typeof keyOrBody === 'string' ? justBody : keyOrBody;

        return await this.#fetch<CreateDataStoreRecordResponse>(`/data-stores/${dataStoreId}/data`, {
            method: 'POST',
            body: {
                key,
                data: body,
            },
        });
    }

    /**
     * Update specific fields of a record in a data store.
     * Only updates the specified fields, preserving others.
     * @param dataStoreId The data store ID containing the record
     * @param key The record key to update
     * @param body The record fields to update
     * @returns Promise with the updated record
     */
    async update(dataStoreId: number, key: string, body: UpdateDataStoreRecordBody): Promise<DataStoreRecord> {
        return await this.#fetch<UpdateDataStoreRecordResponse>(`/data-stores/${dataStoreId}/data/${key}`, {
            method: 'PATCH',
            body,
        });
    }

    /**
     * Replace a record in a data store completely.
     * Replaces the entire record with the new data.
     * @param dataStoreId The data store ID containing the record
     * @param key The record key to replace
     * @param body The new record data
     * @returns Promise with the replaced record
     */
    async replace(dataStoreId: number, key: string, body: UpdateDataStoreRecordBody): Promise<DataStoreRecord> {
        return await this.#fetch<UpdateDataStoreRecordResponse>(`/data-stores/${dataStoreId}/data/${key}`, {
            method: 'PUT',
            body,
        });
    }

    /**
     * Delete specific records from a data store.
     * @param dataStoreId The data store ID containing the records
     * @param keys Array of record keys to delete
     * @returns Promise that resolves when the records are deleted
     */
    async delete(dataStoreId: number, keys: string[]): Promise<void> {
        await this.#fetch(`/data-stores/${dataStoreId}/data`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
            body: {
                keys,
            },
        });
    }
}
