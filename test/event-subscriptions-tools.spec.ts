import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/event-subscriptions/list.json';
import * as getMock from './mocks/event-subscriptions/get.json';
import * as createMock from './mocks/event-subscriptions/create.json';
import * as updateMock from './mocks/event-subscriptions/update.json';
import * as deleteMock from './mocks/event-subscriptions/delete.json';
import * as enableMock from './mocks/event-subscriptions/enable.json';
import * as disableMock from './mocks/event-subscriptions/disable.json';
import * as eventTypesMock from './mocks/event-subscriptions/event-types.json';
import * as deliveriesListMock from './mocks/event-subscriptions/deliveries-list.json';
import * as deliveryGetMock from './mocks/event-subscriptions/delivery-get.json';
import * as resendMock from './mocks/event-subscriptions/resend.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 3;
const SUBSCRIPTION_ID = '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c';
const DELIVERY_ID = '0b8e5d1c-2f4a-4e6b-8c9d-1a2b3c4d5e6f';
const BASE = `https://make.local/api/v2/event-subscriptions/v1/organizations/${ORGANIZATION_ID}`;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: event-subscriptions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should expose exactly the eleven event subscription tools', () => {
        expect(
            MakeTools.filter(tool => tool.category.startsWith('event-subscription')).map(tool => tool.name),
        ).toStrictEqual([
            'event-subscriptions_list',
            'event-subscriptions_get',
            'event-subscriptions_create',
            'event-subscriptions_update',
            'event-subscriptions_delete',
            'event-subscriptions_enable',
            'event-subscriptions_disable',
            'event-subscriptions_list-event-types',
            'event-subscription-deliveries_list',
            'event-subscription-deliveries_get',
            'event-subscription-deliveries_resend',
        ]);
    });

    it('Should require organizationId and the event-subscriptions scopes on every tool', () => {
        MakeTools.filter(tool => tool.category.startsWith('event-subscription')).forEach(tool => {
            expect(tool.scopeId).toBe('organizationId');
            expect(tool.inputSchema.required).toContain('organizationId');
            expect(tool.scope).toBe(
                tool.annotations?.readOnlyHint ? 'event-subscriptions:read' : 'event-subscriptions:write',
            );
        });
    });

    // Clients decide whether to ask the user before a call from these hints, so they are pinned.
    it('Should declare the agreed behavioral hints', () => {
        const hints = (name: string) => getTool(name).annotations;

        expect(hints('event-subscriptions_create')).toStrictEqual({
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        });
        expect(hints('event-subscriptions_update')).toStrictEqual({
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: true,
        });
        expect(hints('event-subscriptions_delete')).toStrictEqual({
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        });
        expect(hints('event-subscriptions_enable')).toStrictEqual({
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        });
        expect(hints('event-subscriptions_disable')).toStrictEqual({
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        });
        expect(hints('event-subscription-deliveries_resend')).toStrictEqual({
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: false,
            openWorldHint: true,
        });
    });

    it('Should point the user to the web app for the signing secret', () => {
        expect(getTool('event-subscriptions_create').description).toMatch(/signing secret is not returned/);
        expect(getTool('event-subscriptions_get').description).toMatch(/signing secret is not returned/);
    });

    it('Should accept only UUIDs as subscription and delivery IDs', () => {
        const pattern = new RegExp(
            getTool('event-subscription-deliveries_get').inputSchema.properties?.deliveryId?.pattern as string,
        );
        expect(pattern.test(DELIVERY_ID)).toBe(true);
        expect(pattern.test('../../../../../scenarios/5')).toBe(false);

        const idPatterns = MakeTools.filter(tool => tool.category.startsWith('event-subscription')).flatMap(tool =>
            ['subscriptionId', 'deliveryId', 'last']
                .map(name => tool.inputSchema.properties?.[name])
                .filter(property => property !== undefined)
                .map(property => property.pattern),
        );
        expect(idPatterns.length).toBeGreaterThan(0);
        expect(new Set(idPatterns)).toStrictEqual(new Set([pattern.source]));
    });

    it('Should execute event-subscriptions_list with filters and pagination', async () => {
        mockFetch(
            `GET ${BASE}/subscriptions?pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc&pg%5Blimit%5D=10&pg%5Boffset%5D=10&status=active`,
            listMock,
        );

        const result = await getTool('event-subscriptions_list').execute(make, {
            organizationId: ORGANIZATION_ID,
            status: 'active',
            sortBy: 'name',
            sortDir: 'asc',
            limit: 10,
            offset: 10,
        });

        expect(result).toStrictEqual(listMock.subscriptions);
    });

    it('Should execute event-subscriptions_get', async () => {
        mockFetch(`GET ${BASE}/subscriptions/${SUBSCRIPTION_ID}`, getMock);

        const result = await getTool('event-subscriptions_get').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
        });

        expect(result).toStrictEqual(getMock.subscription);
    });

    it('Should execute event-subscriptions_create without sending organizationId or returning the signing secret', async () => {
        const body = {
            name: 'Everything',
            url: 'https://example.com/make-events',
            events: { mode: 'all' },
            enabled: false,
        };
        mockFetch(`POST ${BASE}/subscriptions`, createMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await getTool('event-subscriptions_create').execute(make, {
            organizationId: ORGANIZATION_ID,
            ...body,
        });

        expect(result).toStrictEqual(createMock.subscription);
    });

    it('Should execute event-subscriptions_update with only the given fields', async () => {
        const body = { events: { mode: 'selected', types: ['scenario.created'] } };
        mockFetch(`PATCH ${BASE}/subscriptions/${SUBSCRIPTION_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await getTool('event-subscriptions_update').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
            ...body,
        });

        expect(result).toStrictEqual(updateMock.subscription);
    });

    it('Should execute event-subscriptions_delete', async () => {
        mockFetch(`DELETE ${BASE}/subscriptions/${SUBSCRIPTION_ID}`, deleteMock);

        const result = await getTool('event-subscriptions_delete').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
        });

        expect(result).toBe('Event subscription has been deleted.');
    });

    it('Should execute event-subscriptions_enable', async () => {
        mockFetch(`POST ${BASE}/subscriptions/${SUBSCRIPTION_ID}/enable`, enableMock);

        const result = await getTool('event-subscriptions_enable').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
        });

        expect(result).toStrictEqual(enableMock.subscription);
    });

    it('Should execute event-subscriptions_disable', async () => {
        mockFetch(`POST ${BASE}/subscriptions/${SUBSCRIPTION_ID}/disable`, disableMock);

        const result = await getTool('event-subscriptions_disable').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
        });

        expect(result).toStrictEqual(disableMock.subscription);
    });

    it('Should execute event-subscriptions_list-event-types', async () => {
        mockFetch(`GET ${BASE}/event-types`, eventTypesMock);

        const result = await getTool('event-subscriptions_list-event-types').execute(make, {
            organizationId: ORGANIZATION_ID,
        });

        expect(result).toStrictEqual(eventTypesMock.eventTypes);
    });

    it('Should execute event-subscription-deliveries_list with filters and a cursor', async () => {
        mockFetch(
            `GET ${BASE}/subscriptions/${SUBSCRIPTION_ID}/deliveries?pg%5BsortDir%5D=desc&pg%5Blimit%5D=5&pg%5Blast%5D=${DELIVERY_ID}&eventType=scenario.created`,
            deliveriesListMock,
        );

        const result = await getTool('event-subscription-deliveries_list').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
            eventType: 'scenario.created',
            sortDir: 'desc',
            limit: 5,
            last: DELIVERY_ID,
        });

        expect(result).toStrictEqual(deliveriesListMock.deliveries);
    });

    it('Should execute event-subscription-deliveries_get', async () => {
        mockFetch(`GET ${BASE}/subscriptions/${SUBSCRIPTION_ID}/deliveries/${DELIVERY_ID}`, deliveryGetMock);

        const result = await getTool('event-subscription-deliveries_get').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
            deliveryId: DELIVERY_ID,
        });

        expect(result).toStrictEqual(deliveryGetMock.delivery);
    });

    it('Should execute event-subscription-deliveries_resend', async () => {
        mockFetch(`POST ${BASE}/subscriptions/${SUBSCRIPTION_ID}/deliveries/${DELIVERY_ID}/resend`, resendMock);

        const result = await getTool('event-subscription-deliveries_resend').execute(make, {
            organizationId: ORGANIZATION_ID,
            subscriptionId: SUBSCRIPTION_ID,
            deliveryId: DELIVERY_ID,
        });

        expect(result).toStrictEqual(resendMock.resend);
    });
});
