import type { Make } from '../make.js';
import type { JSONSchema, MakeTool } from '../tools.js';
import type {
    CreateEventSubscriptionBody,
    EventSubscriptionState,
    EventSubscriptionsSortBy,
    UpdateEventSubscriptionBody,
} from './event-subscriptions.js';

const organizationIdProperty: JSONSchema = {
    type: 'number',
    description: 'The ID of the organization that owns the event subscriptions',
};

const subscriptionIdProperty: JSONSchema = {
    type: 'string',
    description: 'The ID (UUID) of the event subscription, as returned by event-subscriptions_list',
};

/** JSON Schema of the writable subscription fields, shared by create and update. */
const writableProperties: Record<string, JSONSchema> = {
    name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'The name of the subscription. It must contain at least one non-whitespace character.',
    },
    url: {
        type: 'string',
        maxLength: 2048,
        description:
            'The HTTPS endpoint that receives the events. It must be publicly reachable and must not contain a username or password.',
    },
    events: {
        type: 'object',
        description:
            "Which event types the subscription receives: { mode: 'all' } for every event type, including ones added later, or { mode: 'selected', types: [...] } with exact type values from event-subscriptions_list-event-types.",
        properties: {
            mode: { type: 'string', enum: ['all', 'selected'] },
            types: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 100,
                description: "Event types to receive. Required when mode is 'selected', not allowed otherwise.",
            },
        },
        required: ['mode'],
        additionalProperties: false,
    },
    teams: {
        type: 'object',
        description:
            "Which teams' events the subscription receives: { mode: 'all' } or { mode: 'selected', ids: [...] }. Applies only to event types whose supportsTeamSelection is true; organization-level events are received regardless. Defaults to all teams.",
        properties: {
            mode: { type: 'string', enum: ['all', 'selected'] },
            ids: {
                type: 'array',
                items: { type: 'number' },
                minItems: 1,
                description:
                    "Team IDs to receive events from. Required when mode is 'selected', not allowed otherwise.",
            },
        },
        required: ['mode'],
        additionalProperties: false,
    },
};

export const tools: MakeTool[] = [
    {
        name: 'event-subscriptions_list',
        title: 'List event subscriptions',
        description:
            "List the event subscriptions of an organization. An event subscription sends selected Make events (for example scenario changes) to an HTTPS endpoint. Each subscription's status.state is active (receives events), inactive (disabled) or suspended (Make stopped sending after repeated failed deliveries). Returns at most limit subscriptions; when you get exactly limit, call again with offset increased by limit to get the next page. Signing secrets are never returned.",
        category: 'event-subscriptions',
        scope: 'event-subscriptions:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: organizationIdProperty,
                status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'suspended'],
                    description: 'Return only subscriptions in this state',
                },
                sortBy: {
                    type: 'string',
                    enum: ['createdAt', 'name'],
                    description: 'Property to sort the subscriptions by. Defaults to createdAt.',
                },
                sortDir: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Sort direction. Defaults to desc, newest first.',
                },
                limit: {
                    type: 'number',
                    minimum: 1,
                    maximum: 100,
                    description: 'Maximum number of subscriptions to return. Defaults to 20.',
                },
                offset: {
                    type: 'number',
                    minimum: 0,
                    description: 'Number of subscriptions to skip. Defaults to 0.',
                },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 3 }, { organizationId: 3, status: 'suspended' }],
        execute: async (
            make: Make,
            args: {
                organizationId: number;
                status?: EventSubscriptionState;
                sortBy?: EventSubscriptionsSortBy;
                sortDir?: 'asc' | 'desc';
                limit?: number;
                offset?: number;
            },
        ) => {
            return await make.eventSubscriptions.list(args.organizationId, {
                status: args.status,
                pg: { sortBy: args.sortBy, sortDir: args.sortDir, limit: args.limit, offset: args.offset },
            });
        },
    },
    {
        name: 'event-subscriptions_get',
        title: 'Get event subscription',
        description:
            'Get an event subscription and its current status: name, URL, state, subscribed event types with their payload versions, and team selection. The signing secret is never returned.',
        category: 'event-subscriptions',
        scope: 'event-subscriptions:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'subscriptionId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: organizationIdProperty,
                subscriptionId: subscriptionIdProperty,
            },
            required: ['organizationId', 'subscriptionId'],
        },
        examples: [{ organizationId: 3, subscriptionId: '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c' }],
        execute: async (make: Make, args: { organizationId: number; subscriptionId: string }) => {
            return await make.eventSubscriptions.get(args.organizationId, args.subscriptionId);
        },
    },
    {
        name: 'event-subscriptions_create',
        title: 'Create event subscription',
        description:
            "Create an event subscription that sends the selected Make events of an organization to an HTTPS endpoint. It receives events immediately unless enabled is false. Make does not test the URL. Payload versions are assigned by Make. Fails with SUBSCRIPTION_LIMIT_REACHED when the organization's plan allows no more subscriptions. The result includes signingSecret, which this call returns once and no other tool returns: give it to the user so they can configure their endpoint to verify deliveries, and do not store, log or repeat it otherwise. If the call fails with a timeout or a 5xx error, check event-subscriptions_list before retrying, because retrying blindly can create a duplicate.",
        category: 'event-subscriptions',
        scope: 'event-subscriptions:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to create the subscription in' },
                ...writableProperties,
                enabled: {
                    type: 'boolean',
                    description:
                        'If false, the subscription is created inactive and receives no events until it is enabled. Defaults to true.',
                },
            },
            required: ['organizationId', 'name', 'url', 'events'],
        },
        examples: [
            {
                organizationId: 3,
                name: 'Scenario changes',
                url: 'https://example.com/make-events',
                events: { mode: 'selected', types: ['scenario.created', 'scenario.deleted'] },
                teams: { mode: 'selected', ids: [212] },
            },
            { organizationId: 3, name: 'Everything', url: 'https://example.com/make-events', events: { mode: 'all' } },
        ],
        execute: async (make: Make, args: { organizationId: number } & CreateEventSubscriptionBody) => {
            const { organizationId, ...body } = args;
            return await make.eventSubscriptions.create(organizationId, body);
        },
    },
    {
        name: 'event-subscriptions_update',
        title: 'Update event subscription',
        description:
            'Update an event subscription. Send only the fields to change; omitted fields keep their current value. events and teams each replace the whole selection, so send the complete list of event types or team IDs you want, not only additions. Changing url sends all future events to the new endpoint. To change whether the subscription receives events, use event-subscriptions_enable or event-subscriptions_disable. If the error is SUBSCRIPTION_RECREATION_REQUIRED, tell the user instead of deleting and recreating it yourself, because a new subscription gets a new signing secret.',
        category: 'event-subscriptions',
        scope: 'event-subscriptions:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'subscriptionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: organizationIdProperty,
                subscriptionId: subscriptionIdProperty,
                ...writableProperties,
            },
            required: ['organizationId', 'subscriptionId'],
        },
        examples: [
            {
                organizationId: 3,
                subscriptionId: '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c',
                name: 'Scenario lifecycle',
            },
            {
                organizationId: 3,
                subscriptionId: '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c',
                teams: { mode: 'all' },
            },
        ],
        execute: async (
            make: Make,
            args: { organizationId: number; subscriptionId: string } & UpdateEventSubscriptionBody,
        ) => {
            const { organizationId, subscriptionId, ...body } = args;
            return await make.eventSubscriptions.update(organizationId, subscriptionId, body);
        },
    },
    {
        name: 'event-subscriptions_delete',
        title: 'Delete event subscription',
        description:
            'Permanently delete an event subscription. It stops receiving events immediately and its delivery history becomes inaccessible. This cannot be undone: a replacement gets a new ID and a new signing secret, and its endpoint must be reconfigured. Confirm with the user before calling. Use event-subscriptions_disable to only stop events.',
        category: 'event-subscriptions',
        scope: 'event-subscriptions:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'subscriptionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: organizationIdProperty,
                subscriptionId: subscriptionIdProperty,
            },
            required: ['organizationId', 'subscriptionId'],
        },
        examples: [{ organizationId: 3, subscriptionId: '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c' }],
        execute: async (make: Make, args: { organizationId: number; subscriptionId: string }) => {
            await make.eventSubscriptions.delete(args.organizationId, args.subscriptionId);
            return `Event subscription has been deleted.`;
        },
    },
    {
        name: 'event-subscriptions_enable',
        title: 'Enable event subscription',
        description:
            'Start sending events to an inactive or suspended event subscription again. Events that occurred while it was not receiving are not delivered later; resend specific recorded deliveries with event-subscription-deliveries_resend. Make does not test the URL. Enabling an active subscription has no effect and succeeds.',
        category: 'event-subscriptions',
        scope: 'event-subscriptions:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'subscriptionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: organizationIdProperty,
                subscriptionId: subscriptionIdProperty,
            },
            required: ['organizationId', 'subscriptionId'],
        },
        examples: [{ organizationId: 3, subscriptionId: '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c' }],
        execute: async (make: Make, args: { organizationId: number; subscriptionId: string }) => {
            return await make.eventSubscriptions.enable(args.organizationId, args.subscriptionId);
        },
    },
    {
        name: 'event-subscriptions_disable',
        title: 'Disable event subscription',
        description:
            'Stop sending events to an event subscription until it is enabled again with event-subscriptions_enable. Events that occur meanwhile are not delivered later. Its configuration, signing secret and delivery history are kept. Disabling an inactive subscription has no effect and succeeds.',
        category: 'event-subscriptions',
        scope: 'event-subscriptions:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'subscriptionId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: organizationIdProperty,
                subscriptionId: subscriptionIdProperty,
            },
            required: ['organizationId', 'subscriptionId'],
        },
        examples: [{ organizationId: 3, subscriptionId: '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c' }],
        execute: async (make: Make, args: { organizationId: number; subscriptionId: string }) => {
            return await make.eventSubscriptions.disable(args.organizationId, args.subscriptionId);
        },
    },
    {
        name: 'event-subscriptions_list-event-types',
        title: 'List event subscription event types',
        description:
            "List the event types an event subscription in the organization can receive, with the JSON Schema of each payload version's data. Use the exact type values in events.types when creating or updating a subscription. Availability differs between organizations and can change. supportsTeamSelection tells whether a subscription's teams selection filters that event type.",
        category: 'event-subscriptions',
        scope: 'event-subscriptions:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to list event types for' },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 3 }],
        execute: async (make: Make, args: { organizationId: number }) => {
            return await make.eventSubscriptions.listEventTypes(args.organizationId);
        },
    },
];
