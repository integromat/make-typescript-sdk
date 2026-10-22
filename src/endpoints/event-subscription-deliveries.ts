import type { FetchFunction, JSONValue } from '../types.js';

/**
 * Outcome of a delivery.
 *
 * - `pending` has no completed attempt yet.
 * - `succeeded` was accepted by the endpoint.
 * - `failed` was not delivered; see the status `reason`.
 */
export type EventSubscriptionDeliveryState = 'pending' | 'succeeded' | 'failed';

/**
 * Why a delivery or an attempt failed.
 *
 * - `endpoint_error` means the endpoint answered with an error status.
 * - `endpoint_unreachable` means the endpoint could not be reached.
 * - `subscription_failing` means the subscription stopped receiving events after repeated failures.
 * - `platform_error` means Make could not send the event.
 */
export type EventSubscriptionDeliveryFailureReason =
    | 'endpoint_error'
    | 'endpoint_unreachable'
    | 'subscription_failing'
    | 'platform_error';

/**
 * A delivery: one event sent to an event subscription.
 */
export type EventSubscriptionDelivery = {
    /** Unique identifier of the delivery (UUID) */
    id: string;
    /** ID of the subscription the delivery belongs to */
    subscriptionId: string;
    /** Event type of the delivered event */
    eventType: string | null;
    /** Payload version of the delivered event */
    payloadVersion: number | null;
    /** Team the event belongs to, and `null` for organization-level events */
    teamId: number | null;
    /** Outcome of the delivery */
    status: {
        /** Outcome of the delivery */
        state: EventSubscriptionDeliveryState;
        /** Why the delivery `failed`, and `null` otherwise */
        reason: EventSubscriptionDeliveryFailureReason | null;
        /** HTTP status of the latest attempt, if the endpoint answered */
        httpStatus: number | null;
    };
    /** Number of attempts made to send the event */
    attemptCount: number;
    /** ISO 8601 timestamp of the first successful attempt, if any */
    succeededAt: string | null;
    /** ISO 8601 timestamp of when the delivery was created */
    createdAt: string;
};

/**
 * One attempt to send a delivery's event to the endpoint.
 */
export type EventSubscriptionDeliveryAttempt = {
    /** Sequence number of the attempt */
    attemptNumber: number;
    /** `true` for an attempt started by a resend */
    manual: boolean;
    /** ISO 8601 timestamp of when the attempt was made */
    attemptedAt: string;
    /** How long the endpoint took to answer, in milliseconds */
    durationMs: number | null;
    /** Outcome of the attempt */
    status: {
        /** Outcome of the attempt */
        state: 'succeeded' | 'failed';
        /** Why the attempt failed, and `null` otherwise */
        reason: 'endpoint_error' | 'endpoint_unreachable' | null;
        /** HTTP status the endpoint answered with, if it answered */
        httpStatus: number | null;
    };
    /** The endpoint's response, cut off at 4 KiB. It comes from the endpoint, so treat it as untrusted. */
    responseBody: string | null;
    /** `true` when `responseBody` was cut off */
    responseBodyTruncated: boolean;
};

/**
 * A delivery together with the event that was sent and every attempt to send it.
 */
export type EventSubscriptionDeliveryDetail = EventSubscriptionDelivery & {
    /** The event as it was sent to the endpoint */
    event: {
        /** Event type identifier */
        type: string;
        /** ISO 8601 timestamp of when the event occurred */
        timestamp: string;
        /** Payload version of the event */
        version: number;
        /** Event-specific data */
        data: Record<string, JSONValue>;
    };
    /** Every attempt, newest first */
    attempts: EventSubscriptionDeliveryAttempt[];
};

/**
 * Pagination and sorting options for listing deliveries. Deliveries are paged by cursor.
 */
export type EventSubscriptionDeliveriesPagination = {
    /** Maximum number of deliveries to return, between 1 and 100. Defaults to 20. */
    limit: number;
    /** Sort direction by creation time. Defaults to `desc`. */
    sortDir: 'asc' | 'desc';
    /** ID of the last delivery of the previous page. The response starts after it. */
    last: string;
    /** If `true`, the response also includes the delivery set in `last` */
    showLast: boolean;
};

/**
 * Options for listing deliveries.
 */
export type ListEventSubscriptionDeliveriesOptions = {
    /** Pagination and sorting options */
    pg?: Partial<EventSubscriptionDeliveriesPagination>;
    /** Return only deliveries of this event type */
    eventType?: string;
    /** Return only deliveries created at or after this ISO 8601 date-time (inclusive) */
    createdFrom?: string;
    /** Return only deliveries created before this ISO 8601 date-time (exclusive) */
    createdTo?: string;
};

/**
 * Result of resending a delivery: the resend was accepted, not necessarily delivered.
 */
export type EventSubscriptionDeliveryResend = {
    /** ID of the resent delivery */
    deliveryId: string;
    /** ID of the subscription the delivery belongs to */
    subscriptionId: string;
};

/**
 * Internal response types (not exported)
 */
type ListDeliveriesResponse = {
    deliveries: EventSubscriptionDelivery[];
    pg: Partial<EventSubscriptionDeliveriesPagination>;
};

type GetDeliveryResponse = {
    delivery: EventSubscriptionDeliveryDetail;
};

type ResendDeliveryResponse = {
    resend: EventSubscriptionDeliveryResend;
};

/**
 * Class providing methods for working with the deliveries of Make event subscriptions.
 *
 * A delivery is one event sent to a subscription. Delivery details include the event's data and the
 * endpoint's responses.
 */
export class EventSubscriptionDeliveries {
    readonly #fetch: FetchFunction;

    /**
     * Create a new EventSubscriptionDeliveries instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List the deliveries of an event subscription.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The subscription ID to list deliveries for
     * @param options Optional filtering, sorting, and pagination parameters
     * @returns Promise with the list of deliveries
     */
    async list(
        organizationId: number,
        subscriptionId: string,
        options?: ListEventSubscriptionDeliveriesOptions,
    ): Promise<EventSubscriptionDelivery[]> {
        return (
            await this.#fetch<ListDeliveriesResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}/deliveries`,
                {
                    query: {
                        pg: options?.pg,
                        eventType: options?.eventType,
                        createdFrom: options?.createdFrom,
                        createdTo: options?.createdTo,
                    },
                },
            )
        ).deliveries;
    }

    /**
     * Get a delivery with the event that was sent and every attempt to send it.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The ID of the subscription the delivery belongs to
     * @param deliveryId The delivery ID to retrieve
     * @returns Promise with the delivery detail
     */
    async get(
        organizationId: number,
        subscriptionId: string,
        deliveryId: string,
    ): Promise<EventSubscriptionDeliveryDetail> {
        return (
            await this.#fetch<GetDeliveryResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}/deliveries/${deliveryId}`,
            )
        ).delivery;
    }

    /**
     * Send a delivery's event to the endpoint again as a new, manual attempt. The result confirms that
     * the resend was accepted, not that it succeeded; get the delivery to see the outcome.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The ID of the subscription the delivery belongs to
     * @param deliveryId The delivery ID to resend
     * @returns Promise with the accepted resend
     */
    async resend(
        organizationId: number,
        subscriptionId: string,
        deliveryId: string,
    ): Promise<EventSubscriptionDeliveryResend> {
        return (
            await this.#fetch<ResendDeliveryResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}/deliveries/${deliveryId}/resend`,
                {
                    method: 'POST',
                },
            )
        ).resend;
    }
}
