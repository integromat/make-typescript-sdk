import type { FetchFunction, Pagination, PickColumns } from '../types.js';
import { DataStoreRecords } from './data-store-records.js';

/**
 * Represents a data store in Make.
 * Data stores are databases that allow storing and managing data within Make,
 * making it available across scenarios.
 */
export type DataStore = {
    /** Unique identifier of the data store */
    id: number;
    /** Name of the data store */
    name: string;
    /** Current number of records in the data store */
    records: number;
    /** Current size of all records in the data store */
    size: string;
    /** Maximum allowed size of the data store */
    maxSize: string;
    /** ID of the team that owns the data store */
    teamId: number;
    /** ID of the data structure defining the record format, or null if not specified */
    datastructureId: number | null;
};

/**
 * Options for listing data stores.
 * @template C Keys of the DataStore type to include in the response
 */
export type ListDataStoresOptions<C extends keyof DataStore = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
    /** Pagination options */
    pg?: Partial<Pagination<DataStore>>;
};

/**
 * Response format for listing data stores.
 */
type ListDataStoresResponse<C extends keyof DataStore = never> = {
    /** List of data stores matching the query */
    dataStores: PickColumns<DataStore, C>[];
    /** Pagination information */
    pg: Pagination<DataStore>;
};

/**
 * Parameters for creating a new data store.
 */
export type CreateDataStoreBody = {
    /** Name for the data store */
    name: string;
    /** ID of the team where the data store will be created */
    teamId: number;
    /** Optional ID of a data structure that defines the record format */
    datastructureId?: number;
    /** Maximum size limit for the data store in megabytes */
    maxSizeMB: number;
};

/**
 * Response format for creating a data store.
 */
type CreateDataStoreResponse = {
    /** The created data store */
    dataStore: DataStore;
};

/**
 * Response format for getting a data store.
 */
type GetDataStoreResponse = {
    /** The requested data store */
    dataStore: DataStore;
};

/**
 * Parameters for updating a data store.
 */
export type UpdateDataStoreBody = {
    /** New name for the data store */
    name: string;
};

/**
 * Response format for updating a data store.
 */
type UpdateDataStoreResponse = {
    /** The updated data store */
    dataStore: DataStore;
};

/**
 * Class providing methods for working with Make data stores.
 * Data stores allow storing and managing data within Make for use across scenarios.
 * They function as simple databases for storing information between scenario runs.
 */
export class DataStores {
    readonly #fetch: FetchFunction;

    /**
     * Access to methods for working with records within data stores
     */
    public readonly records: DataStoreRecords;

    /**
     * Create a new DataStores instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;

        this.records = new DataStoreRecords(fetch);
    }

    /**
     * List all data stores for a team.
     * @param teamId The team ID to filter data stores by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of data stores
     */
    async list<C extends keyof DataStore = never>(
        teamId: number,
        options?: ListDataStoresOptions<C>,
    ): Promise<PickColumns<DataStore, C>[]> {
        return (
            await this.#fetch<ListDataStoresResponse<C>>('/data-stores', {
                query: {
                    teamId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).dataStores;
    }

    /**
     * Create a new data store.
     * @param body Parameters for the data store to create
     * @returns Promise with the created data store
     */
    async create(body: CreateDataStoreBody): Promise<DataStore> {
        return (
            await this.#fetch<CreateDataStoreResponse>('/data-stores', {
                method: 'POST',
                body,
            })
        ).dataStore;
    }

    /**
     * Get data store details by ID.
     * @param dataStoreId The data store ID to retrieve
     * @returns Promise with the data store details
     */
    async get(dataStoreId: number): Promise<DataStore> {
        return (await this.#fetch<GetDataStoreResponse>(`/data-stores/${dataStoreId}`)).dataStore;
    }

    /**
     * Update a data store.
     * @param dataStoreId The data store ID to update
     * @param body The data store properties to update
     * @returns Promise with the updated data store
     */
    async update(dataStoreId: number, body: UpdateDataStoreBody): Promise<DataStore> {
        return (
            await this.#fetch<UpdateDataStoreResponse>(`/data-stores/${dataStoreId}`, {
                method: 'PATCH',
                body: body,
            })
        ).dataStore;
    }

    /**
     * Delete a data store.
     * @param dataStoreId The data store ID to delete
     * @returns Promise that resolves when the data store is deleted
     */
    async delete(dataStoreId: number): Promise<void> {
        await this.#fetch(`/data-stores/${dataStoreId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
    }
}
