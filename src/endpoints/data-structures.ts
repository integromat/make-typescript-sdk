import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a field in a data structure.
 * Defines the properties of a single field including its type, name, and validation rules.
 */
export type DataStructureField = {
    /** Data type of the field (e.g., 'text', 'number', 'boolean', 'array', 'collection') */
    type: string;
    /** Unique identifier of the field within the data structure */
    name: string;
    /** Human-readable name of the field */
    label: string;
    /** Default value for the field */
    default?: string | number | boolean;
    /** Whether the field must be provided */
    required?: boolean;
    /** Whether the text field should be displayed as a multi-line input */
    multiline?: boolean;
    /** For enum/select field types, the available options */
    options?: DataStructureFieldOption[];
};

/**
 * Represents an option in a select/enum field.
 */
export type DataStructureFieldOption = {
    /** Display name for the option */
    label: string;
    /** Value stored when this option is selected */
    value: string;
    /** For options that contain nested fields */
    nested?: DataStructureField[];
};

/**
 * Represents a data structure in Make.
 * Data structures define the structure of data and are widely used by Data stores and other components.
 */
export type DataStructure = {
    /** Unique identifier of the data structure */
    id: number;
    /** Name of the data structure */
    name: string;
    /** ID of the team that owns the data structure */
    teamId: number;
    /** Field specifications defining the structure */
    spec?: DataStructureField[];
    /** Whether to enforce strict validation of the structure */
    strict?: boolean;
};

/**
 * Options for listing data structures.
 * @template C Keys of the DataStructure type to include in the response
 */
export type ListDataStructuresOptions<C extends keyof DataStructure = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
    /** Pagination options */
    pg?: Partial<Pagination<DataStructure>>;
};

/**
 * Response format for listing data structures.
 * @template C Keys of the DataStructure type to include in the response
 */
type ListDataStructuresResponse<C extends keyof DataStructure = never> = {
    /** List of data structures matching the query */
    dataStructures: PickColumns<DataStructure, C>[];
    /** Pagination information */
    pg: Pagination<DataStructure>;
};

/**
 * Parameters for creating a new data structure.
 */
export type CreateDataStructureBody = {
    /** Name of the data structure */
    name: string;
    /** ID of the team where the data structure will be created */
    teamId: number;
    /** Field specifications defining the structure */
    spec?: DataStructureField[];
    /** Whether to enforce strict validation of the structure */
    strict?: boolean;
};

/**
 * Response format for creating a data structure.
 */
type CreateDataStructureResponse = {
    /** The created data structure */
    dataStructure: DataStructure;
};

/**
 * Response format for getting a data structure.
 */
type GetDataStructureResponse = {
    /** The requested data structure */
    dataStructure: DataStructure;
};

/**
 * Parameters for updating a data structure.
 */
export type UpdateDataStructureBody = {
    /** New name for the data structure */
    name?: string;
    /** Updated field specifications */
    spec?: DataStructureField[];
    /** Whether to enforce strict validation of the structure */
    strict?: boolean;
};

/**
 * Response format for updating a data structure.
 */
type UpdateDataStructureResponse = {
    /** The updated data structure */
    dataStructure: DataStructure;
};

/**
 * Parameters for cloning a data structure.
 */
export type CloneDataStructureBody = {
    /** Name for the cloned data structure */
    name: string;
    /** ID of the team where the clone will be created */
    targetTeamId: number;
};

/**
 * Response format for cloning a data structure.
 */
type CloneDataStructureResponse = {
    /** The cloned data structure */
    dataStructure: DataStructure;
};

/**
 * Class providing methods for working with Make data structures.
 * Data structures define the format of data being transferred to the Make platform
 * and are widely used by the Data stores component.
 */
export class DataStructures {
    readonly #fetch: FetchFunction;

    /**
     * Create a new DataStructures instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all data structures for a team.
     * @param teamId The team ID to filter data structures by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of data structures
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
     * Create a new data structure.
     * @param body Parameters for the data structure to create
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
     * Get data structure details by ID.
     * @param dataStructureId The data structure ID to get
     * @returns Promise with the data structure details
     */
    async get(dataStructureId: number): Promise<DataStructure> {
        return (await this.#fetch<GetDataStructureResponse>(`/data-structures/${dataStructureId}`)).dataStructure;
    }

    /**
     * Update a data structure.
     * @param dataStructureId The data structure ID to update
     * @param body The data structure parameters to update
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
     * Delete a data structure.
     * @param dataStructureId The data structure ID to delete
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
     * Clone a data structure to another team.
     * @param dataStructureId The data structure ID to clone
     * @param body Parameters for the cloning operation
     * @returns Promise with the newly created data structure clone
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
