import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as deliveriesListMock from './mocks/event-subscriptions/deliveries-list.json';
import * as deliveryGetMock from './mocks/event-subscriptions/delivery-get.json';
import * as resendMock from './mocks/event-subscriptions/resend.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const SUBSCRIPTION_ID = '7f2c1e9a-4b3d-4c1e-9a2b-6d5e4f3a2b1c';
const DELIVERY_ID = '0b8e5d1c-2f4a-4e6b-8c9d-1a2b3c4d5e6f';
const BASE = `https://make.local/api/v2/event-subscriptions/v1/organizations/3/subscriptions/${SUBSCRIPTION_ID}/deliveries`;

describe('Endpoints: EventSubscriptionDeliveries', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list deliveries', async () => {
        mockFetch(`GET ${BASE}`, deliveriesListMock);

        const result = await make.eventSubscriptions.deliveries.list(3, SUBSCRIPTION_ID);
        expect(result).toStrictEqual(deliveriesListMock.deliveries);
    });

    it('Should list deliveries with filters and a cursor', async () => {
        mockFetch(
            `GET ${BASE}?pg%5Blimit%5D=10&pg%5BsortDir%5D=asc&pg%5Blast%5D=${DELIVERY_ID}&eventType=scenario.created&createdFrom=2026-10-01T00%3A00%3A00.000Z&createdTo=2026-10-08T00%3A00%3A00.000Z`,
            deliveriesListMock,
        );

        const result = await make.eventSubscriptions.deliveries.list(3, SUBSCRIPTION_ID, {
            pg: { limit: 10, sortDir: 'asc', last: DELIVERY_ID },
            eventType: 'scenario.created',
            createdFrom: '2026-10-01T00:00:00.000Z',
            createdTo: '2026-10-08T00:00:00.000Z',
        });
        expect(result).toStrictEqual(deliveriesListMock.deliveries);
    });

    it('Should get a delivery with its event and attempts', async () => {
        mockFetch(`GET ${BASE}/${DELIVERY_ID}`, deliveryGetMock);

        const result = await make.eventSubscriptions.deliveries.get(3, SUBSCRIPTION_ID, DELIVERY_ID);
        expect(result).toStrictEqual(deliveryGetMock.delivery);
    });

    it('Should resend a delivery', async () => {
        mockFetch(`POST ${BASE}/${DELIVERY_ID}/resend`, resendMock);

        const result = await make.eventSubscriptions.deliveries.resend(3, SUBSCRIPTION_ID, DELIVERY_ID);
        expect(result).toStrictEqual(resendMock.resend);
    });
});
