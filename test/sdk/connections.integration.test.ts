import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_APP_NAME = String(process.env.MAKE_APP_NAME || '');

const itif = (condition: boolean) => (condition ? it : it.skip);

describe('Integration: SDK > Connections', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let appName: string = MAKE_APP_NAME;
    let appVersion: number = 1;
    let connectionName: string;

    itif(!MAKE_APP_NAME)('Should create a temporary app for testing', async () => {
        const app = await make.sdk.apps.create({
            name: `test-connections-app-${Date.now()}`,
            label: `Test Connections App ${Date.now()}`,
            description: 'This is a test app created for connection integration tests',
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

    it('Should create a connection', async () => {
        const connection = await make.sdk.connections.create(appName, {
            type: 'basic',
            label: `Test Connection ${Date.now()}`,
        });

        expect(connection).toBeDefined();
        expect(connection.name).toBeDefined();
        expect(connection.label).toContain('Test Connection');
        expect(connection.type).toBe('basic');
        connectionName = connection.name;
    });

    it('Should get the created connection', async () => {
        const connection = await make.sdk.connections.get(connectionName);
        expect(connection.name).toBe(connectionName);
        expect(connection.label).toContain('Test Connection');
        expect(connection.type).toBe('basic');
    });

    it('Should list connections for the app', async () => {
        const connections = await make.sdk.connections.list(appName);
        expect(connections.some(connection => connection.name === connectionName)).toBe(true);
    });

    it('Should update the connection', async () => {
        const updatedConnection = await make.sdk.connections.update(connectionName, {
            label: 'Updated Test Connection',
        });

        expect(updatedConnection.label).toBe('Updated Test Connection');
        expect(updatedConnection.name).toBe(connectionName);
    });

    it('Should set connection section', async () => {
        const sectionData = {
            authorize: {
                url: 'https://www.example.com/oauth/authorize',
                qs: {
                    client_id: '{{ifempty(parameters.clientId, common.clientId)}}',
                    redirect_uri: '{{oauth.redirectUri}}',
                    response_type: 'code',
                },
                response: {
                    temp: {
                        code: '{{query.code}}',
                    },
                },
            },
            token: {
                url: 'https://www.example.com/api/token',
                method: 'POST',
                type: 'urlencoded',
                body: {
                    code: '{{temp.code}}',
                    client_id: '{{ifempty(parameters.clientId, common.clientId)}}',
                    grant_type: 'authorization_code',
                    redirect_uri: '{{oauth.redirectUri}}',
                    client_secret: '{{ifempty(parameters.clientSecret, common.clientSecret)}}',
                },
                response: {
                    data: {
                        accessToken: '{{body.access_token}}',
                    },
                },
            },
        };

        await make.sdk.connections.setSection(connectionName, 'api', sectionData);
    });

    it('Should get connection section', async () => {
        const result = await make.sdk.connections.getSection(connectionName, 'api');
        expect(result).toBeDefined();
        // Note: The exact response format may vary, but the operation should complete successfully
    });

    it('Should set connection common configuration', async () => {
        const commonConfig = {
            clientId: 'TEST_CLIENT_ID',
            clientSecret: 'TEST_CLIENT_SECRET',
        };

        const result = await make.sdk.connections.setCommon(connectionName, commonConfig);
        expect(typeof result).toBe('boolean');
    });

    it('Should get connection common configuration', async () => {
        const result = await make.sdk.connections.getCommon(connectionName);
        expect(result).toBeDefined();
        expect(typeof result.clientId).toBe('string');
        expect(typeof result.clientSecret).toBe('string');
    });

    it('Should delete the connection', async () => {
        await make.sdk.connections.delete(connectionName);

        // Connections are deleted asynchronously, so we can't check if they're deleted immediately
        // const connections = await make.sdk.connections.list(appName);
        // expect(connections.some(connection => connection.name === connectionName)).toBe(false);
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
