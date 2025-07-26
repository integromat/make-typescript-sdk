import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/functions/list.json';
import * as getMock from '../mocks/sdk/functions/get.json';
import * as createMock from '../mocks/sdk/functions/create.json';
import * as deleteMock from '../mocks/sdk/functions/delete.json';
import * as setTestMock from '../mocks/sdk/functions/set-test.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > Functions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);
    const appName = 'test-app';
    const appVersion = 1;
    const functionName = 'parseTime';

    it('Should list SDK app functions', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions`, listMock);

        const result = await make.sdk.functions.list(appName, appVersion);
        expect(result).toStrictEqual(listMock.appFunctions);
    });

    it('Should get SDK app function by name', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions/${functionName}`, getMock);

        const result = await make.sdk.functions.get(appName, appVersion, functionName);
        expect(result).toStrictEqual(getMock.appFunction);
    });

    it('Should create SDK app function', async () => {
        const body = {
            name: 'parseTime',
        };
        mockFetch(`POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.functions.create(appName, appVersion, body);
        expect(result).toStrictEqual(createMock.appFunction);
    });

    it('Should delete SDK app function', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions/${functionName}`,
            deleteMock,
        );

        await make.sdk.functions.delete(appName, appVersion, functionName);
    });

    it('Should get function code', async () => {
        const codeResponse = `function parseTime() {

}`;
        mockFetch(
            `GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions/${functionName}/code`,
            codeResponse,
            req => {
                expect(req.headers.get('accept')).toBe('text/plain');
            },
        );

        const result = await make.sdk.functions.getCode(appName, appVersion, functionName);
        expect(result).toBe(codeResponse);
    });

    it('Should set function code', async () => {
        const code = 'function parseTime() {\n\tconst a = "Hey There"\n}';
        mockFetch(
            `PUT https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions/${functionName}/code`,
            null,
            req => {
                expect(req.body).toBe(code);
                expect(req.headers.get('content-type')).toBe('application/javascript');
            },
        );

        await make.sdk.functions.setCode(appName, appVersion, functionName, code);
    });

    it('Should get function test', async () => {
        const testResponse = "console.log('Test');";
        mockFetch(
            `GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions/${functionName}/test`,
            testResponse,
            req => {
                expect(req.headers.get('accept')).toBe('text/plain');
            },
        );

        const result = await make.sdk.functions.getTest(appName, appVersion, functionName);
        expect(result).toBe(testResponse);
    });

    it('Should set function test', async () => {
        const test = 'console.log("AAA");';
        mockFetch(
            `PUT https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/functions/${functionName}/test`,
            setTestMock,
            req => {
                expect(req.body).toBe(test);
                expect(req.headers.get('content-type')).toBe('application/javascript');
            },
        );

        const result = await make.sdk.functions.setTest(appName, appVersion, functionName, test);
        expect(result).toBe(setTestMock.changed);
    });
});
