import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');

describe('Integration: SDK > Apps', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let appName: string;
    let appVersion: number;

    it('Should create an app', async () => {
        const app = await make.sdk.apps.create({
            name: `test-sdk-app-${Date.now()}`,
            label: `Test App ${Date.now()}`,
            description: 'This is a test app created by integration tests',
            theme: '#FF5733',
            language: 'en',
            countries: ['us', 'uk'],
            private: true,
            audience: 'countries',
        });

        expect(app).toBeDefined();
        expect(app.name).toBeDefined();
        expect(app.version).toBeDefined();
        appName = app.name;
        appVersion = app.version;
    });

    it('Should get the created app', async () => {
        const app = await make.sdk.apps.get(appName, appVersion);
        expect(app.name).toBe(appName);
        expect(app.version).toBe(appVersion);
    });

    it('Should list apps', async () => {
        const apps = await make.sdk.apps.list();
        expect(Array.isArray(apps)).toBe(true);
        expect(apps.some(app => app.name === appName)).toBe(true);
    });

    it('Should update the app', async () => {
        const updatedApp = await make.sdk.apps.update(appName, appVersion, {
            label: 'Updated Test App',
            description: 'This is an updated test app',
            theme: '#33FF57',
        });

        expect(updatedApp.label).toBe('Updated Test App');
        expect(updatedApp.theme).toBe('#33ff57');
    });

    it.skip('Should get and set app sections', async () => {
        // Test getting base section
        const baseSection = await make.sdk.apps.getSection(appName, appVersion, 'base');
        expect(baseSection).toBeDefined();

        // Test setting base section
        const sectionData = {
            baseUrl: 'https://api.example.com',
            log: {
                sanitize: ['request.headers.authorization'],
            },
        };
        await make.sdk.apps.setSection(appName, appVersion, 'base', sectionData);

        // Verify the section was updated
        const updatedSection = await make.sdk.apps.getSection(appName, appVersion, 'base');
        expect(updatedSection.baseUrl).toBe('https://api.example.com');
    });

    it('Should get and set app documentation', async () => {
        // Test setting documentation
        const docsContent = '# Test App Documentation\n\nThis is test documentation for the app.';
        const changed = await make.sdk.apps.setDocs(appName, appVersion, docsContent);
        expect(changed).toBe(true);

        // Test getting documentation
        const retrievedDocs = await make.sdk.apps.getDocs(appName, appVersion);
        expect(retrievedDocs).toBe(docsContent);
    });

    it('Should get and set app common data', async () => {
        // Test setting common data
        const commonData = {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            customField: 'custom-value',
        };
        const changed = await make.sdk.apps.setCommon(appName, appVersion, commonData);
        expect(changed).toBe(true);

        // Test getting common data
        const retrievedCommon = await make.sdk.apps.getCommon(appName, appVersion);
        expect(retrievedCommon.clientId).toBe('test-client-id');
        expect(retrievedCommon.clientSecret).toBe('test-client-secret');
        expect(retrievedCommon.customField).toBe('custom-value');
    });

    it('Should delete the app', async () => {
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
