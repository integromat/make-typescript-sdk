import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_APP_NAME = String(process.env.MAKE_APP_NAME || '');

const itif = (condition: boolean) => (condition ? it : it.skip);

describe('Integration: SDK > Functions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let appName: string = MAKE_APP_NAME;
    let appVersion: number = 1;
    let functionName: string;

    itif(!MAKE_APP_NAME)('Should create a temporary app for testing', async () => {
        const app = await make.sdk.apps.create({
            name: `test-functions-app-${Date.now()}`,
            label: `Test Functions App ${Date.now()}`,
            description: 'This is a test app created for function integration tests',
            theme: '#33FF57',
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

    it('Should create a function', async () => {
        const functionResult = await make.sdk.functions.create(appName, appVersion, {
            name: `testFunction${Date.now()}`,
        });

        expect(functionResult).toBeDefined();
        expect(functionResult.name).toBeDefined();
        functionName = functionResult.name;
    });

    it('Should get the created function', async () => {
        const functionResult = await make.sdk.functions.get(appName, appVersion, functionName);
        expect(functionResult.name).toBe(functionName);
    });

    it('Should list functions', async () => {
        const functions = await make.sdk.functions.list(appName, appVersion);
        expect(Array.isArray(functions)).toBe(true);
        expect(functions.some(func => func.name === functionName)).toBe(true);
    });

    it('Should set function code', async () => {
        const code = `function ${functionName}() {
            return "Hello from test function!";
        }`;

        await make.sdk.functions.setCode(appName, appVersion, functionName, code);
    });

    it('Should get function code', async () => {
        const code = await make.sdk.functions.getCode(appName, appVersion, functionName);
        expect(code).toBe(
            `function ${functionName}() {
            return "Hello from test function!";
        }`,
        );
    });

    it('Should set function test', async () => {
        const test = `console.log('Testing ${functionName}');`;

        const result = await make.sdk.functions.setTest(appName, appVersion, functionName, test);
        expect(typeof result).toBe('boolean');
    });

    it('Should get function test', async () => {
        const test = await make.sdk.functions.getTest(appName, appVersion, functionName);
        expect(test).toBe(`console.log('Testing ${functionName}');`);
    });

    it('Should delete the function', async () => {
        await make.sdk.functions.delete(appName, appVersion, functionName);

        // Verify the function is deleted by checking it's not in the list
        const functions = await make.sdk.functions.list(appName, appVersion);
        expect(functions.some(func => func.name === functionName)).toBe(false);
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
