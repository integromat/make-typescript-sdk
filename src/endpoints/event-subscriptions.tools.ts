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
    pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
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
            'List the event subscriptions of an organization. status.state is active, inactive (disabled by a user) or suspended (Make stopped sending after repeated failed deliveries). For the next page, increase offset by limit.',
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
            'Get an event subscription: name, URL, status, event types with payload versions, and teams. The signing secret is not returned.',
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
            "Create an event subscription that sends an organization's selected events to an HTTPS endpoint. Take event types from event-subscriptions_list-event-types. The signing secret is not returned: tell the user to copy it from the subscription's page in the Make web app.",
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
                    default: true,
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
            // The signing secret stays out of the model's context; the web app can reveal it.
            const { subscription } = await make.eventSubscriptions.create(organizationId, body);
            return subscription;
        },
    },
    {
        name: 'event-subscriptions_update',
        title: 'Update event subscription',
        description:
            'Update an event subscription. Send only the fields to change; events and teams each replace the whole selection. Use event-subscriptions_enable or event-subscriptions_disable to turn it on or off. On SUBSCRIPTION_RECREATION_REQUIRED, tell the user instead of deleting and recreating it.',
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
            'Permanently delete an event subscription and its delivery history. Confirm with the user first. To only stop events, use event-subscriptions_disable.',
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
            'Start sending events to an inactive or suspended event subscription. Events missed meanwhile are not sent; resend recorded deliveries with event-subscription-deliveries_resend.',
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
            'Stop sending events to an event subscription until it is enabled again. Events that occur meanwhile are not sent later.',
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
            "List the event types an organization's event subscriptions can receive, with the JSON Schema of each payload version. Use the type values in events.types.",
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
