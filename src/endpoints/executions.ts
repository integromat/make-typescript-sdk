import type { FetchFunction, Pagination, JSONValue } from '../types.js';

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
    status: 0 | 1 | 2 | 3;
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
 * Detailed result of a scenario execution.
 * Includes high-level status, optional outputs, and error metadata.
 */
export type ExecutionDetail = {
    /**
     * Status of the scenario execution: RUNNING, SUCCESS, WARNING, or ERROR
     */
    status: 'RUNNING' | 'SUCCESS' | 'WARNING' | 'ERROR';
    /**
     * Outputs of the scenario execution (shape depends on scenario configuration)
     */
    outputs?: Record<string, JSONValue>;
    /**
     * Error information when execution resulted in WARNING or ERROR
     */
    error?: {
        /** Name of the error */
        name: string;
        /** Description of the error */
        message: string;
        /** Module that caused the error */
        causeModule?: {
            /** Name of the module */
            name: string;
            /** Name of the app */
            appName: string;
        };
    };
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
 * Response format for getting detailed execution result.
 */
type GetExecutionDetailResponse = ExecutionDetail;

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
     * Get detailed result of a specific execution.
     * @param scenarioId The scenario ID the execution belongs to
     * @param executionId The unique ID of the execution to retrieve
     * @returns Promise with the detailed execution result
     */
    async getDetail(scenarioId: number, executionId: string): Promise<ExecutionDetail> {
        return await this.#fetch<GetExecutionDetailResponse>(`/scenarios/${scenarioId}/executions/${executionId}`);
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
