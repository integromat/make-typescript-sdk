import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/endpoints/list.json';
import * as getMock from '../mocks/sdk/endpoints/get.json';
import * as createMock from '../mocks/sdk/endpoints/create.json';
import * as updateMock from '../mocks/sdk/endpoints/update.json';
import * as getSectionMock from '../mocks/sdk/endpoints/get-section.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > Endpoints', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);
    const appName = 'test-app';
    const appVersion = 1;
    const endpointName = 'getEntity';

    it('Should list SDK app endpoints', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints`, listMock);

        const result = await make.sdk.endpoints.list(appName, appVersion);
        expect(result).toStrictEqual(listMock.appEndpoints);
    });

    it('Should get SDK app endpoint by name', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}`, getMock);

        const result = await make.sdk.endpoints.get(appName, appVersion, endpointName);
        expect(result).toStrictEqual(getMock.appEndpoint);
    });

    it('Should create SDK app endpoint', async () => {
        const body = {
            name: 'getEntity',
            label: 'Get Entity',
            description: 'Retrieves the given entity.',
            attachedAccounts: ['my-connection'],
        };
        mockFetch(`POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.endpoints.create(appName, appVersion, body);
        expect(result).toStrictEqual(createMock.appEndpoint);
    });

    it('Should update SDK app endpoint', async () => {
        const body = {
            label: 'Get Entity (Updated)',
            description: 'Retrieves the given entity by its id.',
            context: 'Use to fetch a single entity by its id.',
            annotations: { readOnlyHint: true, idempotentHint: true },
            attachedAccounts: ['my-connection'],
        };
        mockFetch(
            `PATCH https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}`,
            updateMock,
            req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/json');
            },
        );

        const result = await make.sdk.endpoints.update(appName, appVersion, endpointName, body);
        expect(result).toStrictEqual(updateMock.appEndpoint);
    });

    it('Should delete SDK app endpoint', async () => {
        mockFetch(`DELETE https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}`, null);

        await make.sdk.endpoints.delete(appName, appVersion, endpointName);
    });

    it('Should make endpoint public and private', async () => {
        mockFetch(
            [
                `POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/public`,
                { changed: true },
                undefined,
            ],
            [
                `POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/private`,
                { changed: true },
                undefined,
            ],
        );

        await expect(make.sdk.endpoints.makePublic(appName, appVersion, endpointName)).resolves.toBeUndefined();
        await expect(make.sdk.endpoints.makePrivate(appName, appVersion, endpointName)).resolves.toBeUndefined();
    });

    it('Should get endpoint section', async () => {
        const section = 'api';
        mockFetch(
            `GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/${section}`,
            getSectionMock,
        );

        const result = await make.sdk.endpoints.getSection(appName, appVersion, endpointName, section);
        expect(result).toStrictEqual(getSectionMock);
    });

    it('Should set endpoint section', async () => {
        const section = 'api';
        const body = JSON.stringify({
            url: '/entities/{{parameters.id}}',
            method: 'GET',
            response: { output: '{{body}}' },
        });
        mockFetch(
            `PUT https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/${section}`,
            null,
            req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/jsonc');
            },
        );

        await make.sdk.endpoints.setSection(appName, appVersion, endpointName, section, body);
    });
});
