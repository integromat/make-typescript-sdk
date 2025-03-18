import type { FetchFunction, JSONValue, Pagination } from '../types.js';
import type { DataStructure } from './data-structures.js';

export type DataStoreRecord = {
    key: string;
    data: Record<string, JSONValue>;
};

export type ListDataStoreRecordsOptions = {
    pg?: Partial<Pick<Pagination, 'offset' | 'limit'>>;
};

type ListDataStoreRecordsResponse = {
    records: DataStoreRecord[];
    spec: DataStructure;
    pg: Pick<Pagination, 'offset' | 'limit'>;
};

export type CreateDataStoreRecordBody = Record<string, JSONValue>;

type CreateDataStoreRecordResponse = DataStoreRecord;

export type UpdateDataStoreRecordBody = Record<string, JSONValue>;

type UpdateDataStoreRecordResponse = DataStoreRecord;

export class DataStoreRecords {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List records in a data store
     * @param dataStoreId The data store ID to list records from
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of records and metadata
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
     * Create a new record in a data store
     * @param dataStoreId The data store ID to create a record in
     * @param key The record key
     * @param body The record data
     * @returns Promise with the created record
     */
    async create(dataStoreId: number, key: string, body: CreateDataStoreRecordBody): Promise<DataStoreRecord>;
    async create(dataStoreId: number, body: CreateDataStoreRecordBody): Promise<DataStoreRecord>;
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
     * Update a record in a data store
     * @param dataStoreId The data store ID
     * @param key The record key
     * @param body The record updates
     * @returns Promise with the updated record
     */
    async update(dataStoreId: number, key: string, body: UpdateDataStoreRecordBody): Promise<DataStoreRecord> {
        return await this.#fetch<UpdateDataStoreRecordResponse>(`/data-stores/${dataStoreId}/data/${key}`, {
            method: 'PATCH',
            body,
        });
    }

    /**
     * Replace a record in a data store
     * @param dataStoreId The data store ID
     * @param key The record key
     * @param body The record updates
     * @returns Promise with the updated record
     */
    async replace(dataStoreId: number, key: string, body: UpdateDataStoreRecordBody): Promise<DataStoreRecord> {
        return await this.#fetch<UpdateDataStoreRecordResponse>(`/data-stores/${dataStoreId}/data/${key}`, {
            method: 'PUT',
            body,
        });
    }

    /**
     * Delete a record from a data store
     * @param dataStoreId The data store ID
     * @param keys The record keys to delete
     * @returns Promise with void
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

    /**
     * Delete all records from a data store, optionally except the ones specified
     * @param dataStoreId The data store ID
     * @param exceptKeys The record keys to except
     * @returns Promise with void
     */
    async deleteAll(dataStoreId: number, exceptKeys?: string[]): Promise<void> {
        await this.#fetch(`/data-stores/${dataStoreId}/data`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
            body: {
                all: true,
                exceptKeys,
            },
        });
    }
}
