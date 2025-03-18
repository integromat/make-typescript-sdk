import type { FetchFunction, Pagination } from '../types.js';

export type Execution = {
    imtId: string;
    duration: number;
    operations: number;
    transfer: number;
    organizationId: number;
    teamId: number;
    id: string;
    type: string;
    authorId: number;
    instant: boolean;
};

export type ListExecutionsOptions = {
    pg?: Partial<Pagination>;
};

type ListExecutionsResponse = {
    scenarioLogs: Execution[];
};

type GetExecutionResponse = {
    scenarioLogs: Execution;
};

export class Executions {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List scenario logs
     * @param scenarioId The scenario ID to list logs for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the scenario logs
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
     * List incomplete execution logs
     * @param incompleteExecutionId The incomplete execution ID to list logs for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the scenario logs
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
     * Get a scenario log
     * @param scenarioId The scenario ID to get the log for
     * @param executionId The execution ID to get the log for
     * @returns Promise with the scenario log
     */
    async get(scenarioId: number, executionId: string): Promise<Execution> {
        return (await this.#fetch<GetExecutionResponse>(`/scenarios/${scenarioId}/logs/${executionId}`)).scenarioLogs;
    }

    /**
     * Get an incomplete execution log
     * @param incompleteExecutionId The incomplete execution ID to get the log for
     * @param executionId The execution ID to get the log for
     * @returns Promise with the incomplete execution log
     */
    async getForIncompleteExecution(incompleteExecutionId: string, executionId: string): Promise<Execution> {
        return (await this.#fetch<GetExecutionResponse>(`/dlqs/${incompleteExecutionId}/logs/${executionId}`))
            .scenarioLogs;
    }
}
