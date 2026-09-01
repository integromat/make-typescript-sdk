import type { FetchFunction, JSONValue, Pagination } from '../types.js';

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
 * Detail of a single webhook queue item, including its payload.
 */
export type HookIncomingDetail = HookIncoming & {
    /** The queued payload. Omitted when the hook is confidential. */
    data?: JSONValue;
    /** Whether the hook is confidential, in which case the payload is withheld */
    isHookConfidential?: boolean;
};

/**
 * Response format for getting a webhook queue item's detail.
 */
type GetHookIncomingResponse = {
    /** The requested queue item, including its payload */
    incoming: HookIncomingDetail;
};

/**
 * Options for deleting items from a webhook's queue.
 * Either `ids` or `all` must be specified.
 */
export type DeleteHookIncomingsOptions =
    | {
          /** IDs of the queue items to delete */
          ids: string[];
          /** Not available when deleting specific queue items */
          exceptIds?: never;
          /** Not available when deleting specific queue items */
          all?: never;
          /** Not available when deleting specific queue items */
          confirmed?: never;
      }
    | {
          /** Not available when deleting the entire queue */
          ids?: never;
          /** IDs of queue items to keep instead of deleting */
          exceptIds?: string[];
          /** Delete every item in the queue */
          all: true;
          /** Confirm the bulk deletion */
          confirmed: true;
      };

/**
 * Result of deleting items from a webhook's queue.
 */
export type DeleteHookIncomingsResult = {
    /** IDs of the queue items that were actually deleted */
    deletedIds: string[];
    /** Present when some items could not be deleted because they were being processed */
    error?: {
        /** Name of the error */
        name: string;
        /** Description of the error */
        message: string;
    };
};

/**
 * Response format for deleting items from a webhook's queue.
 */
type DeleteHookIncomingsResponse = {
    /** IDs of the queue items that were actually deleted */
    incomings: string[];
    /** Present when some items could not be deleted because they were being processed */
    error?: {
        name: string;
        message: string;
    };
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

    /**
     * Get detail of a single queued item, including its payload.
     * @param hookId The hook ID the queue item belongs to
     * @param incomingId The ID of the queue item to retrieve
     * @returns Promise with the queue item detail
     */
    async get(hookId: number, incomingId: string): Promise<HookIncomingDetail> {
        return (await this.#fetch<GetHookIncomingResponse>(`/hooks/${hookId}/incomings/${incomingId}`)).incoming;
    }

    /**
     * Delete items from a webhook's queue.
     * @param hookId The hook ID to delete queue items for
     * @param options Which items to delete
     * @returns Promise with the IDs that were deleted and an optional partial-failure error
     */
    async delete(hookId: number, options: DeleteHookIncomingsOptions): Promise<DeleteHookIncomingsResult> {
        const deletesSpecificItems = options.ids !== undefined;
        const deletesAllItems = options.all === true;

        if (deletesSpecificItems === deletesAllItems) {
            throw new TypeError('Exactly one of `ids` or `all: true` must be specified');
        }
        if (deletesAllItems && options.confirmed !== true) {
            throw new TypeError('`confirmed` must be `true` when `all` is used');
        }

        const { confirmed, ...body } = options;
        const response = await this.#fetch<DeleteHookIncomingsResponse>(`/hooks/${hookId}/incomings`, {
            method: 'DELETE',
            query: { confirmed },
            body,
        });
        return { deletedIds: response.incomings, error: response.error };
    }
}
