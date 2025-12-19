import type { FetchFunction, PickColumns } from '../types.js';

/**
 * Represents a custom function in Make.
 * Custom functions are user-created code snippets that can be used in scenarios.
 */
export type Function = {
    /** Unique identifier of the function */
    id: number;
    /** Name of the function */
    name: string;
    /** Function arguments declaration */
    args: string;
    /** Description of what the function does */
    description: string;
    /** Timestamp when the function was last updated */
    updatedAt: string;
    /** Timestamp when the function was created */
    createdAt: string;
    /** Information about the user who created the function */
    createdByUser: {
        /** User ID */
        id: number;
        /** User name */
        name: string;
        /** User email */
        email: string;
    };
    /** The actual function code */
    code?: string;
    /** List of scenarios using this function */
    scenarios?: {
        /** Scenario ID */
        id: number;
        /** Scenario name */
        name: string;
    }[];
};

/**
 * Represents a historical version of a custom function.
 * Function history keeps track of changes made to the function over time.
 */
export type FunctionHistory = {
    /** Unique identifier of the history entry */
    id: number;
    /** The function code before the update */
    previousCode: string;
    /** Timestamp when the update was made */
    updatedAt: string;
    /** User who made the update */
    updatedBy: string;
};

/**
 * Response format for listing functions.
 */
type ListFunctionsResponse<C extends keyof Function = never> = {
    /** List of functions matching the query */
    functions: PickColumns<Function, C>[];
};

/**
 * Response format for getting a function.
 */
type GetFunctionResponse = {
    /** The requested function */
    function: Function;
};

/**
 * Parameters for creating a new function.
 */
export type CreateFunctionBody = {
    /** Name of the function */
    name: string;
    /** Description of what the function does */
    description: string;
    /** The function code */
    code: string;
};

/**
 * Response format for creating a function.
 */
type CreateFunctionResponse = {
    /** The created function */
    function: Function;
};

/**
 * Parameters for updating a function.
 */
export type UpdateFunctionBody = {
    /** Updated description of the function */
    description?: string;
    /** Updated function code */
    code?: string;
};

/**
 * Response format for updating a function.
 */
type UpdateFunctionResponse = {
    /** The updated function */
    function: Function;
};

/**
 * Response format for checking a function's validity.
 */
export type CheckFunctionResponse = {
    /** Whether the function code is valid */
    success: boolean;
    /** Error message if validation failed, or null if successful */
    error: string | null;
};

/**
 * Response format for getting function history.
 */
type FunctionHistoryResponse = {
    /** List of function history entries */
    functionHistory: FunctionHistory[];
};

/**
 * Options for listing functions.
 */
export type ListFunctionsOptions<C extends keyof Function = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Class providing methods for working with Make custom functions.
 * Custom functions are user-created JavaScript functions that you can use in scenarios
 * to perform custom data transformations and calculations.
 */
export class Functions {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Functions instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all custom functions for a team.
     * @param teamId The team ID to list functions for
     * @param options Optional parameters for filtering the returned fields
     * @returns Promise with the list of functions
     */
    async list<C extends keyof Function = never>(
        teamId: number,
        options?: ListFunctionsOptions<C>,
    ): Promise<PickColumns<Function, C>[]> {
        return (
            await this.#fetch<ListFunctionsResponse<C>>('/functions', {
                query: {
                    teamId,
                    cols: options?.cols,
                },
            })
        ).functions;
    }

    /**
     * Get details of a specific function.
     * @param functionId The function ID to get details for
     * @returns Promise with the function details
     */
    async get(functionId: number): Promise<Function> {
        return (await this.#fetch<GetFunctionResponse>(`/functions/${functionId}`)).function;
    }

    /**
     * Create a new custom function.
     * @param teamId The team ID to create the function in
     * @param body Parameters for the function to create
     * @returns Promise with the created function
     */
    async create(teamId: number, body: CreateFunctionBody): Promise<Function> {
        return (
            await this.#fetch<CreateFunctionResponse>('/functions', {
                method: 'POST',
                query: {
                    teamId,
                },
                body,
            })
        ).function;
    }

    /**
     * Update an existing custom function.
     * @param functionId The function ID to update
     * @param body The function properties to update
     * @returns Promise with the updated function
     */
    async update(functionId: number, body: UpdateFunctionBody): Promise<Function> {
        return (
            await this.#fetch<UpdateFunctionResponse>(`/functions/${functionId}`, {
                method: 'PATCH',
                body,
            })
        ).function;
    }

    /**
     * Delete a custom function.
     * @param functionId The function ID to delete
     */
    async delete(functionId: number): Promise<void> {
        await this.#fetch(`/functions/${functionId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Check if a function's code is valid.
     * Validates the syntax and execution of the function.
     * @param teamId The team ID context for checking the function
     * @param code The function code to validate
     * @returns Promise with the validation result and any error messages
     */
    async check(teamId: number, code: string): Promise<CheckFunctionResponse> {
        return await this.#fetch<CheckFunctionResponse>('/functions/eval', {
            method: 'POST',
            query: {
                teamId,
            },
            body: {
                code,
            },
        });
    }

    /**
     * Get the version history of a function.
     * @param teamId The team ID the function belongs to
     * @param functionId The function ID to get history for
     * @returns Promise with the list of historical versions
     */
    async history(teamId: number, functionId: number): Promise<FunctionHistory[]> {
        return (
            await this.#fetch<FunctionHistoryResponse>(`/functions/${functionId}/history`, {
                query: {
                    teamId,
                },
            })
        ).functionHistory;
    }
}
