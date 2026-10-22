import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

/**
 * The API key needs the `event-subscriptions:read` and `event-subscriptions:write` scopes and the
 * Event subscriptions permissions in the organization. The subscription is created inactive, so no
 * events are sent to its URL, and deleted at the end.
 */
describe('Integration: EventSubscriptions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let subscriptionId: string;

    it('Should list event types', async () => {
        const eventTypes = await make.eventSubscriptions.listEventTypes(MAKE_ORGANIZATION);

        expect(Array.isArray(eventTypes)).toBe(true);
    });

    it('Should create an inactive event subscription', async () => {
        const { subscription, signingSecret } = await make.eventSubscriptions.create(MAKE_ORGANIZATION, {
            name: `SDK integration ${Date.now()}`,
            url: 'https://example.com/make-events',
            events: { mode: 'all' },
            enabled: false,
        });

        expect(subscription.status.state).toBe('inactive');
        expect(signingSecret).toBeTruthy();
        subscriptionId = subscription.id;
    });

    it('Should get and list the created subscription', async () => {
        const subscription = await make.eventSubscriptions.get(MAKE_ORGANIZATION, subscriptionId);
        expect(subscription.id).toBe(subscriptionId);

        const subscriptions = await make.eventSubscriptions.list(MAKE_ORGANIZATION, { status: 'inactive' });
        expect(subscriptions.some(entry => entry.id === subscriptionId)).toBe(true);
    });

    it('Should update the subscription', async () => {
        const subscription = await make.eventSubscriptions.update(MAKE_ORGANIZATION, subscriptionId, {
            name: 'SDK integration (renamed)',
        });

        expect(subscription.name).toBe('SDK integration (renamed)');
    });

    it('Should list the deliveries of the subscription', async () => {
        const deliveries = await make.eventSubscriptions.deliveries.list(MAKE_ORGANIZATION, subscriptionId);

        expect(deliveries).toStrictEqual([]);
    });

    it('Should delete the subscription', async () => {
        await make.eventSubscriptions.delete(MAKE_ORGANIZATION, subscriptionId);

        await expect(make.eventSubscriptions.get(MAKE_ORGANIZATION, subscriptionId)).rejects.toMatchObject({
            statusCode: 404,
        });
    });
});
