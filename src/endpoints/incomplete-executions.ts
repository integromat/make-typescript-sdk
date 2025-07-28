import type { FetchFunction, JSONValue } from '../types.js';
import { isObject } from '../utils.js';
import { Blueprint } from './blueprints.js';

/**
 * Represents an incomplete execution (DLQ item) in Make.
 * Incomplete executions are scenario runs that didn't complete successfully
 * due to errors that prevented normal completion.
 */
export type IncompleteExecution = {
    /** Unique identifier of the incomplete execution */
    id: string;
    /** ID of the scenario this execution belongs to */
    scenarioId?: number;
    /** Name of the scenario this execution belongs to */
    scenarioName?: string;
    /** ID of the team this execution belongs to */
    companyId?: number;
    /** Name of the team this execution belongs to */
    companyName?: string;
    /** Reason for the incomplete execution */
    reason?: string;
    /** Whether the incomplete execution has been resolved */
    resolved: boolean;
    /** Whether the incomplete execution has been deleted */
    deleted?: boolean;
    /** Sequence number of the incomplete execution in the queue */
    index?: number;
    /** Timestamp when the incomplete execution was created */
    created: string;
    /** ID of the original execution */
    executionId?: string;
    /** Whether automatic retry is enabled */
    retry: boolean;
    /** Number of retry attempts made */
    attempts: number;
    /** Size of the incomplete execution bundle in bytes */
    size: number;
};

/**
 * Bundle data for an incomplete execution.
 * Contains the contextual data at the time the execution failed.
 */
export type IncompleteExecutionBundles = Record<string, JSONValue>;

/**
 * Response format for listing incomplete executions.
 */
type ListIncompleteExecutionsResponse = {
    /** List of incomplete executions (DLQ items) */
    dlqs: IncompleteExecution[];
};

/**
 * Response format for getting an incomplete execution.
 */
type GetIncompleteExecutionResponse = {
    /** The requested incomplete execution */
    dlq: IncompleteExecution;
};

/**
 * Response format for updating an incomplete execution.
 */
type UpdateIncompleteExecutionResponse = {
    /** The updated incomplete execution information */
    dlq: {
        /** ID of the module that failed */
        failer: number;
        /** Blueprint of the scenario at the time of failure */
        blueprint: Blueprint;
    };
};

/**
 * Parameters for updating an incomplete execution.
 */
export type UpdateIncompleteExecutionBody = {
    /** Updated blueprint to use for retrying the execution */
    blueprint?: Blueprint | string;
    /** ID of the module that failed */
    failer?: number;
};

/**
 * Response format for retrying an incomplete execution.
 */
type RetryIncompleteExecutionResponse = {
    /** ID of the retried incomplete execution */
    dlq: string;
};

/**
 * Parameters for retrying multiple incomplete executions.
 */
export type RetryMultipleIncompleteExecutionsBody = {
    /** Specific incomplete execution IDs to retry */
    ids?: string[];
    /** Whether to retry all incomplete executions for the scenario */
    all?: boolean;
    /** IDs to exclude from retrying when using the all option */
    exceptIds?: string[];
};

/**
 * Response format for getting an incomplete execution bundle.
 */
type BundleIncompleteExecutionResponse = {
    /** Response code */
    code: string;
    /** Bundle data for the incomplete execution */
    response: IncompleteExecutionBundles;
};

/**
 * Class providing methods for working with Make incomplete executions.
 * Incomplete executions (also known as DLQ items) are scenario runs
 * that didn't complete successfully and are stored for later resolution.
 */
export class IncompleteExecutions {
    readonly #fetch: FetchFunction;

    /**
     * Create a new IncompleteExecutions instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all incomplete executions for a scenario.
     * @param scenarioId The scenario ID to list incomplete executions for
     * @returns Promise with the list of incomplete executions
     */
    async list(scenarioId: number): Promise<IncompleteExecution[]> {
        return (
            await this.#fetch<ListIncompleteExecutionsResponse>('/dlqs', {
                query: {
                    scenarioId,
                },
            })
        ).dlqs;
    }

    /**
     * Get details of a specific incomplete execution.
     * @param incompleteExecutionId The incomplete execution ID to get
     * @returns Promise with the incomplete execution details
     */
    async get(incompleteExecutionId: string): Promise<IncompleteExecution> {
        return (await this.#fetch<GetIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}`)).dlq;
    }

    /**
     * Update an incomplete execution's blueprint or failer module.
     * @param incompleteExecutionId The incomplete execution ID to update
     * @param body The updates to apply to the incomplete execution
     * @returns Promise with the updated incomplete execution data
     */
    async update(
        incompleteExecutionId: string,
        body: UpdateIncompleteExecutionBody,
    ): Promise<UpdateIncompleteExecutionResponse['dlq']> {
        return (
            await this.#fetch<UpdateIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}`, {
                method: 'PATCH',
                body: Object.assign({}, body, {
                    blueprint: isObject(body.blueprint) ? JSON.stringify(body.blueprint) : body.blueprint,
                }),
            })
        ).dlq;
    }

    /**
     * Retry a specific incomplete execution.
     * @param incompleteExecutionId The incomplete execution ID to retry
     */
    async retry(incompleteExecutionId: string): Promise<void> {
        await this.#fetch<RetryIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}/retry`, {
            method: 'POST',
        });
    }

    /**
     * Retry multiple incomplete executions for a scenario.
     * @param scenarioId The scenario ID whose incomplete executions should be retried
     * @param body Configuration specifying which incomplete executions to retry
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
     * Get the data bundle for an incomplete execution.
     * Contains the context data at the time of failure.
     * @param incompleteExecutionId The incomplete execution ID
     * @returns Promise with the bundle data
     */
    async bundle(incompleteExecutionId: string): Promise<IncompleteExecutionBundles> {
        return (await this.#fetch<BundleIncompleteExecutionResponse>(`/dlqs/${incompleteExecutionId}/bundle`)).response;
    }
}
