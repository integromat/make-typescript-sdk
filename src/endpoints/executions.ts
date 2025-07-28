import type { FetchFunction, Pagination } from '../types.js';

/**
 * Represents an execution of a Make scenario.
 * Executions are the individual runs of scenarios, capturing information about
 * each time a scenario was executed.
 */
export type Execution = {
    /** Unique identifier of the execution */
    id: string;
    /** Internal Make ID of the execution */
    imtId: string;
    /** Status of the execution (0 = pending, 1 = successful, 2 = successful with warnings, 3 = failed) */
    status: number;
    /** Duration of the execution in milliseconds */
    duration: number;
    /** Number of operations consumed by the execution */
    operations: number;
    /** Amount of data transfer consumed by the execution */
    transfer: number;
    /** ID of the organization the execution belongs to */
    organizationId: number;
    /** ID of the team the execution belongs to */
    teamId: number;
    /** Type of execution (e.g., 'scheduled', 'manual') */
    type: string;
    /** ID of the user who initiated the execution (if available) */
    authorId: number | null;
    /** Whether the execution was run instantly */
    instant: boolean;
};

/**
 * Options for listing executions.
 */
export type ListExecutionsOptions = {
    /** Pagination options */
    pg?: Partial<Pagination<Execution>>;
    /** Filter by execution status */
    status?: number;
    /** Filter by start timestamp */
    from?: number;
    /** Filter by end timestamp */
    to?: number;
};

/**
 * Response format for listing executions.
 */
type ListExecutionsResponse = {
    /** List of scenario execution logs */
    scenarioLogs: Execution[];
};

/**
 * Response format for getting an execution.
 */
type GetExecutionResponse = {
    /** The requested execution log */
    scenarioLogs: Execution;
};

/**
 * Class providing methods for working with Make executions.
 * Executions represent the running instances of scenarios and provide
 * information about each time a scenario was executed.
 */
export class Executions {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Executions instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List executions for a scenario.
     * @param scenarioId The scenario ID to list executions for
     * @param options Optional parameters for pagination
     * @returns Promise with the list of scenario executions
     */
    async list(scenarioId: number, options?: ListExecutionsOptions): Promise<Execution[]> {
        return (
            await this.#fetch<ListExecutionsResponse>(`/scenarios/${scenarioId}/logs`, {
                query: {
                    pg: options?.pg,
                },
            })
        ).scenarioLogs;
    }

    /**
     * List executions for an incomplete execution.
     * @param incompleteExecutionId The incomplete execution ID to list executions for
     * @param options Optional parameters for pagination
     * @returns Promise with the list of executions related to the incomplete execution
     */
    async listForIncompleteExecution(
        incompleteExecutionId: string,
        options?: ListExecutionsOptions,
    ): Promise<Execution[]> {
        return (
            await this.#fetch<ListExecutionsResponse>(`/dlqs/${incompleteExecutionId}/logs`, {
                query: {
                    pg: options?.pg,
                },
            })
        ).scenarioLogs;
    }

    /**
     * Get details of a specific execution.
     * @param scenarioId The scenario ID the execution belongs to
     * @param executionId The unique ID of the execution to retrieve
     * @returns Promise with the execution details
     */
    async get(scenarioId: number, executionId: string): Promise<Execution> {
        return (await this.#fetch<GetExecutionResponse>(`/scenarios/${scenarioId}/logs/${executionId}`)).scenarioLogs;
    }

    /**
     * Get details of a specific execution for an incomplete execution.
     * @param incompleteExecutionId The incomplete execution ID
     * @param executionId The unique ID of the execution to retrieve
     * @returns Promise with the execution details
     */
    async getForIncompleteExecution(incompleteExecutionId: string, executionId: string): Promise<Execution> {
        return (await this.#fetch<GetExecutionResponse>(`/dlqs/${incompleteExecutionId}/logs/${executionId}`))
            .scenarioLogs;
    }
}
