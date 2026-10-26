import type { FetchFunction, JSONValue } from '../types.js';
import { EventSubscriptionDeliveries } from './event-subscription-deliveries.js';

/**
 * Whether an event subscription receives events.
 *
 * - `active` receives events.
 * - `inactive` was disabled and receives no events until it is enabled.
 * - `suspended` stopped receiving events after repeated failed deliveries; enabling it resumes delivery.
 */
export type EventSubscriptionState = 'active' | 'inactive' | 'suspended';

/**
 * Which event types a subscription receives, as sent when creating or updating it.
 *
 * `all` also includes event types that become available later.
 */
export type EventSubscriptionEventsSelection =
    | {
          /** Receive every event type available to the organization */
          mode: 'all';
      }
    | {
          /** Receive only the listed event types */
          mode: 'selected';
          /** Event type identifiers, as returned by `EventSubscriptions.listEventTypes` */
          types: string[];
      };

/**
 * Which teams' events a subscription receives, as sent when creating or updating it.
 *
 * Applies only to event types that support team selection; organization-level events are
 * received regardless.
 */
export type EventSubscriptionTeamsSelection =
    | {
          /** Receive events from every team */
          mode: 'all';
      }
    | {
          /** Receive events only from the listed teams */
          mode: 'selected';
          /** IDs of the teams to receive events from */
          ids: number[];
      };

/**
 * Represents a Make event subscription: an HTTPS endpoint that receives selected Make events.
 */
export type EventSubscription = {
    /** Unique identifier of the subscription (UUID) */
    id: string;
    /** ID of the organization that owns the subscription */
    organizationId: number;
    /** Name of the subscription */
    name: string;
    /** HTTPS endpoint that receives the events */
    url: string;
    /** Current status of the subscription */
    status: {
        /** Whether the subscription receives events */
        state: EventSubscriptionState;
        /**
         * Why the subscription is `suspended` (currently always `repeated_failures`), and `null` for
         * other states. New reasons may be added, so accept unknown values.
         */
        reason: string | null;
    };
    /** Which event types the subscription receives */
    events: {
        /** `all` event types, or only the `selected` ones */
        mode: 'all' | 'selected';
        /** Subscribed event types, present when `mode` is `selected` */
        types?: string[];
        /** Payload version this subscription receives for each subscribed event type. Read-only. */
        payloadVersions: Record<string, number>;
    };
    /** Which teams' events the subscription receives */
    teams: {
        /** `all` teams, or only the `selected` ones */
        mode: 'all' | 'selected';
        /** Selected team IDs, present when `mode` is `selected` */
        ids?: number[];
    };
    /** ISO 8601 timestamp of when the subscription was created */
    createdAt: string;
    /** ISO 8601 timestamp of when the subscription was last changed */
    updatedAt: string;
};

/**
 * An event type a subscription can receive.
 */
export type EventSubscriptionEventType = {
    /** Event type identifier, for example `scenario.created` */
    type: string;
    /** If `true`, a subscription's `teams` selection filters this event type */
    supportsTeamSelection: boolean;
    /** Payload version new subscriptions receive. Existing subscriptions keep their version. */
    defaultPayloadVersion: number;
    /** Payload versions of the event type */
    payloads: {
        /** Payload version number */
        version: number;
        /** JSON Schema of the event's `data` at this payload version */
        schema: Record<string, JSONValue>;
    }[];
};

/**
 * Property the event subscriptions can be sorted by.
 */
export type EventSubscriptionsSortBy = 'createdAt' | 'name';

/**
 * Pagination and sorting options for listing event subscriptions.
 *
 * The endpoint also accepts `returnTotalCount`, which is deliberately absent here: it only
 * populates the response's own pagination object, and `list` returns just the subscriptions.
 */
export type EventSubscriptionsPagination = {
    /** Property to sort results by. Defaults to `createdAt`. */
    sortBy: EventSubscriptionsSortBy;
    /** Sort direction. Defaults to `desc`. */
    sortDir: 'asc' | 'desc';
    /** Maximum number of subscriptions to return, between 1 and 100. Defaults to 20. */
    limit: number;
    /** Number of subscriptions to skip. Defaults to 0. */
    offset: number;
};

/**
 * Options for listing event subscriptions.
 */
export type ListEventSubscriptionsOptions = {
    /** Pagination and sorting options */
    pg?: Partial<EventSubscriptionsPagination>;
    /** Return only subscriptions in this state */
    status?: EventSubscriptionState;
};

/**
 * Body for creating a new event subscription.
 */
export type CreateEventSubscriptionBody = {
    /** Name of the subscription. Must contain at least one non-whitespace character. */
    name: string;
    /** HTTPS endpoint that receives the events. Must be publicly reachable and contain no username or password. */
    url: string;
    /** Which event types the subscription receives */
    events: EventSubscriptionEventsSelection;
    /** Which teams' events the subscription receives. Defaults to all teams. */
    teams?: EventSubscriptionTeamsSelection;
    /** If `false`, the subscription is created inactive and receives no events until it is enabled. Defaults to `true`. */
    enabled?: boolean;
};

/**
 * Body for updating an event subscription. Omitted fields keep their current value; `events`
 * and `teams` each replace the whole selection. Send at least one field.
 */
export type UpdateEventSubscriptionBody = Partial<Omit<CreateEventSubscriptionBody, 'enabled'>>;

/**
 * Result of creating an event subscription.
 */
export type CreatedEventSubscription = {
    /** The created subscription */
    subscription: EventSubscription;
    /**
     * Secret used to sign every delivery to this subscription. Store it to verify that deliveries
     * come from Make; no other API call returns it.
     */
    signingSecret: string;
};

/**
 * Internal response types (not exported)
 */
type ListEventSubscriptionsResponse = {
    subscriptions: EventSubscription[];
    pg: EventSubscriptionsPagination & { totalCount?: number };
};

type EventSubscriptionResponse = {
    subscription: EventSubscription;
};

type ListEventTypesResponse = {
    eventTypes: EventSubscriptionEventType[];
};

/**
 * Class providing methods for working with Make event subscriptions.
 *
 * Event subscriptions send selected Make events to an HTTPS endpoint. Reading them requires the
 * `event-subscriptions:read` scope, changing them `event-subscriptions:write`, and each action
 * also requires the matching Event subscriptions permission in the organization.
 */
export class EventSubscriptions {
    readonly #fetch: FetchFunction;

    /**
     * Access to methods for working with the deliveries of event subscriptions
     */
    public readonly deliveries: EventSubscriptionDeliveries;

    /**
     * Create a new EventSubscriptions instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
        this.deliveries = new EventSubscriptionDeliveries(fetch);
    }

    /**
     * List the event subscriptions of an organization.
     * @param organizationId The organization ID to list event subscriptions for
     * @param options Optional filtering, sorting, and pagination parameters
     * @returns Promise with the list of event subscriptions
     */
    async list(organizationId: number, options?: ListEventSubscriptionsOptions): Promise<EventSubscription[]> {
        return (
            await this.#fetch<ListEventSubscriptionsResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions`,
                {
                    query: {
                        pg: options?.pg,
                        status: options?.status,
                    },
                },
            )
        ).subscriptions;
    }

    /**
     * Get an event subscription and its current status.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The subscription ID to retrieve
     * @returns Promise with the event subscription
     */
    async get(organizationId: number, subscriptionId: string): Promise<EventSubscription> {
        return (
            await this.#fetch<EventSubscriptionResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}`,
            )
        ).subscription;
    }

    /**
     * Create a new event subscription.
     * @param organizationId The organization ID to create the subscription in
     * @param body The subscription to create
     * @returns Promise with the created subscription and its signing secret
     */
    async create(organizationId: number, body: CreateEventSubscriptionBody): Promise<CreatedEventSubscription> {
        return await this.#fetch<CreatedEventSubscription>(
            `/event-subscriptions/v1/organizations/${organizationId}/subscriptions`,
            {
                method: 'POST',
                body,
            },
        );
    }

    /**
     * Update an existing event subscription.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The subscription ID to update
     * @param body The fields to update
     * @returns Promise with the updated subscription
     */
    async update(
        organizationId: number,
        subscriptionId: string,
        body: UpdateEventSubscriptionBody,
    ): Promise<EventSubscription> {
        return (
            await this.#fetch<EventSubscriptionResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}`,
                {
                    method: 'PATCH',
                    body,
                },
            )
        ).subscription;
    }

    /**
     * Delete an event subscription. It stops receiving events immediately.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The subscription ID to delete
     * @returns Promise that resolves when the subscription is deleted
     */
    async delete(organizationId: number, subscriptionId: string): Promise<void> {
        await this.#fetch(`/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Enable an event subscription, including one that is `suspended`. Enabling an active subscription has no effect.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The subscription ID to enable
     * @returns Promise with the enabled subscription
     */
    async enable(organizationId: number, subscriptionId: string): Promise<EventSubscription> {
        return (
            await this.#fetch<EventSubscriptionResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}/enable`,
                {
                    method: 'POST',
                },
            )
        ).subscription;
    }

    /**
     * Disable an event subscription. Disabling an inactive subscription has no effect.
     * @param organizationId The ID of the organization that owns the subscription
     * @param subscriptionId The subscription ID to disable
     * @returns Promise with the disabled subscription
     */
    async disable(organizationId: number, subscriptionId: string): Promise<EventSubscription> {
        return (
            await this.#fetch<EventSubscriptionResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/subscriptions/${subscriptionId}/disable`,
                {
                    method: 'POST',
                },
            )
        ).subscription;
    }

    /**
     * List the event types a subscription in the organization can receive, with the JSON Schema of
     * each payload version.
     * @param organizationId The organization ID to list event types for
     * @returns Promise with the list of event types
     */
    async listEventTypes(organizationId: number): Promise<EventSubscriptionEventType[]> {
        return (
            await this.#fetch<ListEventTypesResponse>(
                `/event-subscriptions/v1/organizations/${organizationId}/event-types`,
            )
        ).eventTypes;
    }
}
