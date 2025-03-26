import type { FetchFunction, Pagination, PickColumns } from '../types.js';
import { DataStoreRecords } from './data-store-records.js';

export type DataStore = {
    id: number;
    name: string;
    records: number;
    size: string;
    maxSize: string;
    teamId: number;
    datastructureId: number | null;
};

export type ListDataStoresOptions<C extends keyof DataStore = never> = {
    cols?: C[];
    pg?: Partial<Pagination<DataStore>>;
};

type ListDataStoresResponse<C extends keyof DataStore = never> = {
    dataStores: PickColumns<DataStore, C>[];
    pg: Pagination<DataStore>;
};

export type CreateDataStoreBody = {
    name: string;
    teamId: number;
    datastructureId?: number;
    maxSizeMB: number;
};

type CreateDataStoreResponse = {
    dataStore: DataStore;
};

type GetDataStoreResponse = {
    dataStore: DataStore;
};

export type UpdateDataStoreBody = {
    name: string;
    teamId: number;
};

type UpdateDataStoreResponse = {
    dataStore: DataStore;
};

export class DataStores {
    readonly #fetch: FetchFunction;

    public readonly records: DataStoreRecords;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;

        this.records = new DataStoreRecords(fetch);
    }

    /**
     * List all data stores
     * @param teamId The team ID to filter data stores by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of data stores and metadata
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
     * Create a new data store
     * @param body The data store to create
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
     * Get a data store by ID
     * @param dataStoreId The data store ID to get
     * @returns Promise with the data store
     */
    async get(dataStoreId: number): Promise<DataStore> {
        return (await this.#fetch<GetDataStoreResponse>(`/data-stores/${dataStoreId}`)).dataStore;
    }

    /**
     * Update a data store
     * @param dataStoreId The data store ID to update
     * @param body The data store updates
     * @returns Promise with the updated data store
     */
    async update(dataStoreId: number, body: UpdateDataStoreBody): Promise<DataStore> {
        return (
            await this.#fetch<UpdateDataStoreResponse>(`/data-stores/${dataStoreId}`, {
                method: 'PATCH',
                query: {
                    teamId: body.teamId,
                },
                body: Object.assign({}, body, { teamId: undefined }),
            })
        ).dataStore;
    }

    /**
     * Delete a data store
     * @param dataStoreId The data store ID to delete
     * @returns Promise with void
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
