import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/event-subscriptions/list.json';
import * as getMock from './mocks/event-subscriptions/get.json';
import * as createMock from './mocks/event-subscriptions/create.json';
import * as updateMock from './mocks/event-subscriptions/update.json';
import * as deleteMock from './mocks/event-subscriptions/delete.json';
import * as enableMock from './mocks/event-subscriptions/enable.json';
import * as disableMock from './mocks/event-subscriptions/disable.json';
import * as eventTypesMock from './mocks/event-subscriptions/event-types.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const BASE = 'https://make.local/api/v2/event-subscriptions/v1/organizations/3';
const SUBSCRIPTION_ID = '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c';

describe('Endpoints: EventSubscriptions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list event subscriptions', async () => {
        mockFetch(`GET ${BASE}/subscriptions`, listMock);

        const result = await make.eventSubscriptions.list(3);
        expect(result).toStrictEqual(listMock.subscriptions);
    });

    it('Should list event subscriptions with a status filter, sorting and pagination', async () => {
        mockFetch(
            `GET ${BASE}/subscriptions?pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc&pg%5Blimit%5D=10&pg%5Boffset%5D=20&status=suspended`,
            listMock,
        );

        const result = await make.eventSubscriptions.list(3, {
            pg: { sortBy: 'name', sortDir: 'asc', limit: 10, offset: 20 },
            status: 'suspended',
        });
        expect(result).toStrictEqual(listMock.subscriptions);
    });

    it('Should get an event subscription', async () => {
        mockFetch(`GET ${BASE}/subscriptions/${SUBSCRIPTION_ID}`, getMock);

        const result = await make.eventSubscriptions.get(3, SUBSCRIPTION_ID);
        expect(result).toStrictEqual(getMock.subscription);
    });

    it('Should create an event subscription and return its signing secret', async () => {
        const body = {
            name: 'Scenario changes',
            url: 'https://example.com/make-events',
            events: { mode: 'selected' as const, types: ['scenario.created', 'scenario.deleted'] },
            teams: { mode: 'selected' as const, ids: [212] },
        };
        mockFetch(`POST ${BASE}/subscriptions`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.eventSubscriptions.create(3, body);
        expect(result.subscription).toStrictEqual(createMock.subscription);
        expect(result.signingSecret).toBe(createMock.signingSecret);
    });

    it('Should update an event subscription with only the given fields', async () => {
        const body = { name: 'Scenario lifecycle' };
        mockFetch(`PATCH ${BASE}/subscriptions/${SUBSCRIPTION_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.eventSubscriptions.update(3, SUBSCRIPTION_ID, body);
        expect(result).toStrictEqual(updateMock.subscription);
    });

    it('Should delete an event subscription', async () => {
        mockFetch(`DELETE ${BASE}/subscriptions/${SUBSCRIPTION_ID}`, deleteMock);

        await expect(make.eventSubscriptions.delete(3, SUBSCRIPTION_ID)).resolves.toBeUndefined();
    });

    it('Should enable an event subscription', async () => {
        mockFetch(`POST ${BASE}/subscriptions/${SUBSCRIPTION_ID}/enable`, enableMock);

        const result = await make.eventSubscriptions.enable(3, SUBSCRIPTION_ID);
        expect(result).toStrictEqual(enableMock.subscription);
    });

    it('Should disable an event subscription', async () => {
        mockFetch(`POST ${BASE}/subscriptions/${SUBSCRIPTION_ID}/disable`, disableMock);

        const result = await make.eventSubscriptions.disable(3, SUBSCRIPTION_ID);
        expect(result).toStrictEqual(disableMock.subscription);
    });

    it('Should list event types', async () => {
        mockFetch(`GET ${BASE}/event-types`, eventTypesMock);

        const result = await make.eventSubscriptions.listEventTypes(3);
        expect(result).toStrictEqual(eventTypesMock.eventTypes);
    });

    it('Should keep a crafted subscription ID inside the subscription path', async () => {
        mockFetch(`DELETE ${BASE}/subscriptions/..%2F..%2F..%2F..%2F..%2Fscenarios%2F5`, deleteMock);

        await expect(make.eventSubscriptions.delete(3, '../../../../../scenarios/5')).resolves.toBeUndefined();
    });

    it('Should surface API errors as MakeError', async () => {
        mockFetch(
            `GET ${BASE}/subscriptions/${SUBSCRIPTION_ID}`,
            {
                code: 'SUBSCRIPTION_NOT_FOUND',
                message: 'Subscription not found',
                detail: 'The subscription does not exist in this organization.',
            },
            404,
        );

        await expect(make.eventSubscriptions.get(3, SUBSCRIPTION_ID)).rejects.toMatchObject({
            name: 'MakeError',
            statusCode: 404,
        });
    });
});
