import type { FetchFunction, Pagination, PickColumns } from '../types.js';

export type DataStructureField = {
    type: string;
    name: string;
    label: string;
    default?: string | number | boolean;
    required?: boolean;
    multiline?: boolean;
    options?: DataStructureFieldOption[];
};

export type DataStructureFieldOption = {
    label: string;
    value: string;
    nested?: DataStructureField[];
};

export type DataStructure = {
    id: number;
    name: string;
    teamId: number;
    spec?: DataStructureField[];
    strict?: boolean;
};

export type ListDataStructuresOptions<C extends keyof DataStructure = never> = {
    cols?: C[];
    pg?: Partial<Pagination>;
};

type ListDataStructuresResponse<C extends keyof DataStructure = never> = {
    dataStructures: PickColumns<DataStructure, C>[];
    pg: Pagination;
};

export type CreateDataStructureBody = {
    name: string;
    teamId: number;
    spec?: DataStructureField[];
    strict?: boolean;
};

type CreateDataStructureResponse = {
    dataStructure: DataStructure;
};

type GetDataStructureResponse = {
    dataStructure: DataStructure;
};

export type UpdateDataStructureBody = {
    name?: string;
    spec?: DataStructureField[];
    strict?: boolean;
};

type UpdateDataStructureResponse = {
    dataStructure: DataStructure;
};

export type CloneDataStructureBody = {
    name: string;
    targetTeamId: number;
};

type CloneDataStructureResponse = {
    dataStructure: DataStructure;
};

export class DataStructures {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all data structures
     * @param teamId The team ID to filter data structures by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of data structures and metadata
     */
    async list<C extends keyof DataStructure = never>(
        teamId: number,
        options?: ListDataStructuresOptions<C>,
    ): Promise<PickColumns<DataStructure, C>[]> {
        return (
            await this.#fetch<ListDataStructuresResponse<C>>('/data-structures', {
                query: {
                    teamId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).dataStructures;
    }

    /**
     * Create a new data structure
     * @param body The data structure to create
     * @returns Promise with the created data structure
     */
    async create(body: CreateDataStructureBody): Promise<DataStructure> {
        return (
            await this.#fetch<CreateDataStructureResponse>('/data-structures', {
                method: 'POST',
                body,
            })
        ).dataStructure;
    }

    /**
     * Get a data structure by ID
     * @param dataStructureId The data structure ID to get
     * @returns Promise with the data structure
     */
    async get(dataStructureId: number): Promise<DataStructure> {
        return (await this.#fetch<GetDataStructureResponse>(`/data-structures/${dataStructureId}`)).dataStructure;
    }

    /**
     * Update a data structure
     * @param dataStructureId The data structure ID to update
     * @param body The data structure updates
     * @returns Promise with the updated data structure
     */
    async update(dataStructureId: number, body: UpdateDataStructureBody): Promise<DataStructure> {
        return (
            await this.#fetch<UpdateDataStructureResponse>(`/data-structures/${dataStructureId}`, {
                method: 'PATCH',
                body,
            })
        ).dataStructure;
    }

    /**
     * Delete a data structure
     * @param dataStructureId The data structure ID to delete
     * @returns Promise with void
     */
    async delete(dataStructureId: number): Promise<void> {
        await this.#fetch(`/data-structures/${dataStructureId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
    }

    /**
     * Clone a data structure
     * @param dataStructureId The data structure ID to clone
     * @param body The clone options
     * @returns Promise with the cloned data structure
     */
    async clone(dataStructureId: number, body: CloneDataStructureBody): Promise<DataStructure> {
        return (
            await this.#fetch<CloneDataStructureResponse>(`/data-structures/${dataStructureId}/clone`, {
                method: 'POST',
                body,
            })
        ).dataStructure;
    }
}
