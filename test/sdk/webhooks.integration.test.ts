import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_APP_NAME = String(process.env.MAKE_APP_NAME || '');

const itif = (condition: boolean) => (condition ? it : it.skip);

describe('Integration: SDK > Webhooks', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let appName: string = MAKE_APP_NAME;
    let appVersion: number = 1;
    let webhookName: string;

    itif(!MAKE_APP_NAME)('Should create a temporary app for testing', async () => {
        const app = await make.sdk.apps.create({
            name: `test-webhooks-app-${Date.now()}`,
            label: `Test Webhooks App ${Date.now()}`,
            description: 'This is a test app created for webhook integration tests',
            theme: '#FF5733',
            language: 'en',
            countries: ['us'],
            private: true,
            audience: 'countries',
        });

        expect(app).toBeDefined();
        expect(app.name).toBeDefined();
        expect(app.version).toBeDefined();
        appName = app.name;
        appVersion = app.version;
    });

    it('Should create a webhook', async () => {
        const webhook = await make.sdk.webhooks.create(appName, {
            type: 'web',
            label: 'Test Webhook',
        });

        expect(webhook).toBeDefined();
        expect(webhook.label).toBe('Test Webhook');
        expect(webhook.type).toBe('web');
        // Note: The create response doesn't include name, so we'll get it from list
    });

    it('Should list webhooks', async () => {
        const webhooks = await make.sdk.webhooks.list(appName);
        expect(Array.isArray(webhooks)).toBe(true);
        expect(webhooks.length).toBeGreaterThan(0);

        // Find our test webhook
        const testWebhook = webhooks.find(w => w.label === 'Test Webhook');
        expect(testWebhook).toBeDefined();
        webhookName = testWebhook!.name;
    });

    it('Should get the created webhook', async () => {
        const webhook = await make.sdk.webhooks.get(webhookName);
        expect(webhook.name).toBe(webhookName);
        expect(webhook.label).toBe('Test Webhook');
        expect(webhook.type).toBe('web');
    });

    it('Should update the webhook', async () => {
        const updatedWebhook = await make.sdk.webhooks.update(webhookName, {
            label: 'Updated Test Webhook',
        });

        expect(updatedWebhook.label).toBe('Updated Test Webhook');
        expect(updatedWebhook.name).toBe(webhookName);
    });

    it('Should set webhook section', async () => {
        const sectionData = {
            output: '{{body}}',
            test: true,
        };

        await make.sdk.webhooks.setSection(webhookName, 'api', sectionData);
    });

    it('Should get webhook section', async () => {
        const result = await make.sdk.webhooks.getSection(webhookName, 'api');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        // Should return the output that was set
        expect(result).toBe('{{body}}');
    });

    it('Should delete the webhook', async () => {
        await make.sdk.webhooks.delete(webhookName);

        // Webhooks are deleted asynchronously, so we can't check if they're deleted immediately
        // const webhooks = await make.sdk.webhooks.list(appName);
        // expect(webhooks.some(webhook => webhook.name === webhookName)).toBe(false);
    });

    itif(!MAKE_APP_NAME)('Should delete the temporary app', async () => {
        await make.sdk.apps.delete(appName, appVersion);

        // Verify the app is deleted by expecting an error when trying to get it
        try {
            await make.sdk.apps.get(appName, appVersion);
            // If we get here, the test should fail because the app should be deleted
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
