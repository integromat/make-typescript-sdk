import type { FetchFunction, JSONValue } from '../types.js';
import { Blueprint } from './blueprints.js';

export type IncompleteExecution = {
    id: string;
    scenarioId?: number;
    scenarioName?: string;
    companyId?: number;
    companyName?: string;
    reason?: string;
    resolved: boolean;
    deleted?: boolean;
    index?: number;
    created: string;
    executionId?: string;
    retry: boolean;
    attempts: number;
    size: number;
};

export type IncompleteExecutionBundles = Record<string, JSONValue>;

type ListIncompleteExecutionsResponse = {
    dlqs: IncompleteExecution[];
};

type GetIncompleteExecutionResponse = {
    dlq: IncompleteExecution;
};

type UpdateIncompleteExecutionResponse = {
    dlq: {
        failer: number;
        blueprint: Blueprint;
    };
};

export type UpdateIncompleteExecutionBody = {
    blueprint?: string;
    failer?: number;
};

type RetryIncompleteExecutionResponse = {
    dlq: string;
};

export type RetryMultipleIncompleteExecutionsBody = {
    ids?: string[];
    all?: boolean;
    exceptIds?: string[];
};

type BundleIncompleteExecutionResponse = {
    code: string;
    response: IncompleteExecutionBundles;
};

export class IncompleteExecutions {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List incomplete executions
     * @returns Promise with the list of incomplete executions
     */
    async list(): Promise<IncompleteExecution[]> {
        return (await this.#fetch<ListIncompleteExecutionsResponse>('/dlqs')).dlqs;
    }

    /**
     * Get an incomplete execution
     * @param incompleteExecutionId The incomplete execution ID
     * @returns Promise with the incomplete execution details
     */
    async get(incompleteExecutionId: string): Promise<IncompleteExecution> {
        return (await this.#fetch<GetIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}`)).dlq;
    }

    /**
     * Update an incomplete execution
     * @param incompleteExecutionId The incomplete execution ID
     * @returns Promise with the update response
     */
    async update(
        incompleteExecutionId: string,
        body: UpdateIncompleteExecutionBody,
    ): Promise<UpdateIncompleteExecutionResponse['dlq']> {
        return (
            await this.#fetch<UpdateIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}`, {
                method: 'PATCH',
                body,
            })
        ).dlq;
    }

    /**
     * Retry an incomplete execution
     * @param incompleteExecutionId The incomplete execution ID
     * @returns Promise with the retry response
     */
    async retry(incompleteExecutionId: string): Promise<void> {
        await this.#fetch<RetryIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}/retry`, {
            method: 'POST',
        });
    }

    /**
     * Retry multiple incomplete executions
     * @param scenarioId The scenario ID
     * @returns Promise with the retry response
     */
    async retryMultiple(scenarioId: number, body: RetryMultipleIncompleteExecutionsBody): Promise<void> {
        await this.#fetch<RetryIncompleteExecutionResponse>(`/dlqs/retry`, {
            method: 'POST',
            query: {
                scenarioId,
            },
            body,
        });
    }

    /**
     * Get bundle information for an incomplete execution
     * @param incompleteExecutionId The incomplete execution ID
     * @returns Promise with the bundle information
     */
    async bundle(incompleteExecutionId: string): Promise<IncompleteExecutionBundles> {
        return (await this.#fetch<BundleIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}/bundle`)).response;
    }
}
