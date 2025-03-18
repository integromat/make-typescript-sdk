import type { FetchFunction, PickColumns } from '../types.js';

export type Function = {
    id: number;
    name: string;
    args: string;
    description: string;
    updatedAt: string;
    createdAt: string;
    createdByUser: {
        id: number;
        name: string;
        email: string;
    };
    code?: string;
    scenarios?: {
        id: number;
        name: string;
    }[];
};

export type FunctionHistory = {
    id: number;
    previousCode: string;
    updatedAt: string;
    updatedBy: string;
};

type ListFunctionsResponse<C extends keyof Function = never> = {
    functions: PickColumns<Function, C>[];
};

type GetFunctionResponse = {
    function: Function;
};

export type CreateFunctionBody = {
    name: string;
    description: string;
    code: string;
};

type CreateFunctionResponse = {
    function: Function;
};

export type UpdateFunctionBody = {
    description?: string;
    code?: string;
};

type UpdateFunctionResponse = {
    function: Function;
};

export type CheckFunctionResponse = {
    success: boolean;
    error: string | null;
};

type FunctionHistoryResponse = {
    functionHistory: FunctionHistory[];
};

export type ListFunctionsOptions<C extends keyof Function = never> = {
    cols?: C[];
};

export class Functions {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all functions
     * @param teamId The team ID to filter functions by
     * @param options Optional parameters for filtering and pagination
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
     * Get function details
     * @param functionId The function ID to get details for
     * @returns Promise with the function details
     */
    async get(functionId: number): Promise<Function> {
        return (await this.#fetch<GetFunctionResponse>(`/functions/${functionId}`)).function;
    }

    /**
     * Create a new function
     * @param teamId The team ID to create the function for
     * @param body The function data to create
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
     * Update a function
     * @param functionId The function ID to update
     * @param body The function data to update
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
     * Delete a function
     * @param functionId The function ID to delete
     * @returns Promise with void
     */
    async delete(functionId: number): Promise<void> {
        await this.#fetch(`/functions/${functionId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Check if a function is valid
     * @param teamId The team ID to check the function for
     * @param code The function code to check
     * @returns Promise with the check result
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
     * Get function history
     * @param teamId The team ID to get history for
     * @param functionId The function ID to get history for
     * @returns Promise with the function history
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
