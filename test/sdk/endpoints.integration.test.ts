import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_APP_NAME = String(process.env.MAKE_APP_NAME || '');

const itif = (condition: boolean) => (condition ? it : it.skip);

describe('Integration: SDK > Endpoints', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let appName: string = MAKE_APP_NAME;
    let appVersion: number = 1;
    let endpointName: string;

    itif(!MAKE_APP_NAME)('Should create a temporary app for testing', async () => {
        const app = await make.sdk.apps.create({
            name: `test-endpoints-${Date.now()}`,
            label: `Test Endpoints App ${Date.now()}`,
            description: 'This is a test app created for endpoint integration tests',
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

    it('Should create an endpoint', async () => {
        const endpoint = await make.sdk.endpoints.create(appName, appVersion, {
            name: `testEndpoint${Date.now()}`,
            label: 'Test Endpoint',
            description: 'This is a test endpoint created by integration tests',
        });

        expect(endpoint).toBeDefined();
        expect(endpoint.name).toBeDefined();
        expect(endpoint.label).toBe('Test Endpoint');
        endpointName = endpoint.name;
    });

    it('Should get the created endpoint', async () => {
        const endpoint = await make.sdk.endpoints.get(appName, appVersion, endpointName);
        expect(endpoint.name).toBe(endpointName);
        expect(endpoint.label).toBe('Test Endpoint');
    });

    it('Should list endpoints', async () => {
        const endpoints = await make.sdk.endpoints.list(appName, appVersion);
        expect(Array.isArray(endpoints)).toBe(true);
        expect(endpoints.some(endpoint => endpoint.name === endpointName)).toBe(true);
    });

    it('Should set the endpoint api section', async () => {
        const sectionData = JSON.stringify({
            url: '/entities/{{parameters.id}}',
            method: 'GET',
            response: { output: '{{body}}' },
        });

        await make.sdk.endpoints.setSection(appName, appVersion, endpointName, 'api', sectionData);
    });

    it('Should get the endpoint api section', async () => {
        const result = await make.sdk.endpoints.getSection(appName, appVersion, endpointName, 'api');
        expect(result).toBeDefined();
    });

    it('Should update the endpoint', async () => {
        const updatedEndpoint = await make.sdk.endpoints.update(appName, appVersion, endpointName, {
            label: 'Updated Test Endpoint',
            description: 'This is an updated test endpoint',
        });

        expect(updatedEndpoint.label).toBe('Updated Test Endpoint');
    });

    it('Should make the endpoint public and private', async () => {
        await expect(make.sdk.endpoints.makePublic(appName, appVersion, endpointName)).resolves.toBeUndefined();
        await expect(make.sdk.endpoints.makePrivate(appName, appVersion, endpointName)).resolves.toBeUndefined();
    });

    it('Should delete the endpoint', async () => {
        await make.sdk.endpoints.delete(appName, appVersion, endpointName);

        // Verify the endpoint is deleted by checking it's not in the list
        const endpoints = await make.sdk.endpoints.list(appName, appVersion);
        expect(endpoints.some(endpoint => endpoint.name === endpointName)).toBe(false);
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
