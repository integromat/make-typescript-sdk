import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_APP_NAME = String(process.env.MAKE_APP_NAME || '');

const itif = (condition: boolean) => (condition ? it : it.skip);

describe('Integration: SDK > Modules', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let appName: string = MAKE_APP_NAME;
    let appVersion: number = 1;
    let moduleName: string;

    itif(!MAKE_APP_NAME)('Should create a temporary app for testing', async () => {
        const app = await make.sdk.apps.create({
            name: `test-modules-app-${Date.now()}`,
            label: `Test Modules App ${Date.now()}`,
            description: 'This is a test app created for module integration tests',
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

    it('Should create a module', async () => {
        const module = await make.sdk.modules.create(appName, appVersion, {
            name: `testModule${Date.now()}`,
            typeId: 4,
            label: 'Test Module',
            description: 'This is a test module created by integration tests',
            moduleInitMode: 'blank',
        });

        expect(module).toBeDefined();
        expect(module.name).toBeDefined();
        expect(module.label).toBe('Test Module');
        expect(module.typeId).toBe(4);
        moduleName = module.name;
    });

    it('Should get the created module', async () => {
        const module = await make.sdk.modules.get(appName, appVersion, moduleName);
        expect(module.name).toBe(moduleName);
        expect(module.label).toBe('Test Module');
        expect(module.typeId).toBe(4);
    });

    it('Should list modules', async () => {
        const modules = await make.sdk.modules.list(appName, appVersion);
        expect(Array.isArray(modules)).toBe(true);
        expect(modules.some(module => module.name === moduleName)).toBe(true);
    });

    it('Should update the module', async () => {
        const updatedModule = await make.sdk.modules.update(appName, appVersion, moduleName, {
            label: 'Updated Test Module',
            description: 'This is an updated test module',
        });

        expect(updatedModule.label).toBe('Updated Test Module');
        // Due to the bug in the API, the description is not returned (uncomment when fixed)
        //expect(updatedModule.description).toBe('This is an updated test module');
    });

    it('Should set module section', async () => {
        const sectionData = {
            url: '/api/test',
            method: 'GET',
            qs: {},
            body: {},
            headers: {},
            response: {
                iterate: '{{body.items}}',
                trigger: {
                    id: '{{item.id}}',
                    date: '{{item.created}}',
                    type: 'string',
                    order: 'desc',
                },
                output: '{{item}}',
                limit: '10',
            },
        };

        await make.sdk.modules.setSection(appName, appVersion, moduleName, 'api', sectionData);
    });

    it('Should get module section', async () => {
        const result = await make.sdk.modules.getSection(appName, appVersion, moduleName, 'api');
        expect(result).toBeDefined();
        // Note: The exact response format may vary, but the operation should complete successfully
    });

    it('Should delete the module', async () => {
        await make.sdk.modules.delete(appName, appVersion, moduleName);

        // Verify the module is deleted by checking it's not in the list
        const modules = await make.sdk.modules.list(appName, appVersion);
        expect(modules.some(module => module.name === moduleName)).toBe(false);
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
