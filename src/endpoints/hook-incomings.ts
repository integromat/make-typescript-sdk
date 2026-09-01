import type { FetchFunction, Pagination } from '../types.js';

/**
 * A single item in a webhook's processing queue.
 * Queue items accumulate when a webhook receives data it can't immediately
 * hand off to a running scenario (e.g. because the scenario is inactive).
 */
export type HookIncoming = {
    /** Unique identifier of the queue item */
    id: string;
    /** Scope the item was queued under (e.g. 'hook') */
    scope: string;
    /** Size of the queued payload in bytes */
    size: number;
    /** ISO 8601 timestamp of when the item was queued */
    created: string;
};

/**
 * Options for listing a webhook's queued incoming items.
 */
export type ListHookIncomingsOptions = {
    /** Only include items queued at or after this Unix timestamp (ms) */
    from?: number;
    /** Only include items queued at or before this Unix timestamp (ms) */
    to?: number;
    /** Pagination options */
    pg?: Partial<Pagination<HookIncoming>>;
};

/**
 * Response format for listing a webhook's queued items.
 */
type ListHookIncomingsResponse = {
    /** Queue items matching the query */
    incomings: HookIncoming[];
    /** Pagination information */
    pg: Partial<Pagination<HookIncoming>>;
};

/**
 * Queue size and limit for a webhook.
 */
export type HookIncomingStats = {
    /** Number of items currently in the queue */
    queue: number;
    /** Maximum number of items the queue can hold */
    limit: number;
    /** Whether the queue is enabled */
    enabled: boolean;
};

/**
 * Response format for getting a webhook's queue stats.
 */
type GetHookIncomingStatsResponse = {
    /** The queue stats */
    incomingStat: HookIncomingStats;
};

/**
 * Class providing methods for working with a Make webhook's processing queue.
 * Items accumulate here when a webhook receives data it can't immediately
 * hand off to a running scenario.
 */
export class HookIncomings {
    readonly #fetch: FetchFunction;

    /**
     * Create a new HookIncomings instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List items currently queued for a webhook.
     * @param hookId The hook ID to list queued items for
     * @param options Optional filtering and pagination parameters
     * @returns Promise with the list of queued items
     */
    async list(hookId: number, options?: ListHookIncomingsOptions): Promise<HookIncoming[]> {
        return (
            await this.#fetch<ListHookIncomingsResponse>(`/hooks/${hookId}/incomings`, {
                query: {
                    from: options?.from,
                    to: options?.to,
                    pg: options?.pg,
                },
            })
        ).incomings;
    }

    /**
     * Get queue size and limit for a webhook.
     * @param hookId The hook ID to get queue stats for
     * @returns Promise with the queue stats
     */
    async stats(hookId: number): Promise<HookIncomingStats> {
        return (await this.#fetch<GetHookIncomingStatsResponse>(`/hooks/${hookId}/incomings/stats`)).incomingStat;
    }
}
