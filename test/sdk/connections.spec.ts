import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/connections/list.json';
import * as getMock from '../mocks/sdk/connections/get.json';
import * as createMock from '../mocks/sdk/connections/create.json';
import * as updateMock from '../mocks/sdk/connections/update.json';
import * as getSectionMock from '../mocks/sdk/connections/get-section.json';
import * as getCommonMock from '../mocks/sdk/connections/get-common.json';
import * as setCommonMock from '../mocks/sdk/connections/set-common.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > Connections', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list SDK connections for an app', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/test-app/connections', listMock);

        const result = await make.sdk.connections.list('test-app');
        expect(result).toStrictEqual(listMock.appConnections);
    });

    it('Should get SDK connection by name', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/connections/custom-app-13', getMock);

        const result = await make.sdk.connections.get('custom-app-13');
        expect(result).toStrictEqual(getMock.appConnection);
    });

    it('Should create SDK connection', async () => {
        const body = {
            type: 'basic',
            label: 'Main Connection',
        };
        mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/connections', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.connections.create('test-app', body);
        expect(result).toStrictEqual(createMock.appConnection);
    });

    it('Should update SDK connection', async () => {
        const body = {
            label: 'Updated Connection Label',
        };
        mockFetch('PATCH https://make.local/api/v2/sdk/apps/connections/charlie-1', updateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.connections.update('charlie-1', body);
        expect(result).toStrictEqual(updateMock.appConnection);
    });

    it('Should delete SDK connection', async () => {
        mockFetch('DELETE https://make.local/api/v2/sdk/apps/connections/custom-app-13', null);

        await make.sdk.connections.delete('custom-app-13');
    });

    it('Should get SDK connection section', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/connections/test-connection/api', getSectionMock);

        const result = await make.sdk.connections.getSection('test-connection', 'api');
        expect(result).toStrictEqual(getSectionMock);
    });

    it('Should set SDK connection section', async () => {
        const body = {
            test: 'value',
            nested: {
                key: 'value',
            },
        };
        mockFetch('PUT https://make.local/api/v2/sdk/apps/connections/test-connection/api', null, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        await make.sdk.connections.setSection('test-connection', 'api', body);
    });

    it('Should get SDK connection common configuration', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/connections/test-connection/common', getCommonMock);

        const result = await make.sdk.connections.getCommon('test-connection');
        expect(result).toStrictEqual(getCommonMock);
    });

    it('Should set SDK connection common configuration', async () => {
        const body = {
            clientId: 'ENTER_CLIENT_ID_HEREEEEE',
            clientSecret: 'ENTER_CLIENT_SECRET_HERE',
        };
        mockFetch('PUT https://make.local/api/v2/sdk/apps/connections/test-connection/common', setCommonMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.connections.setCommon('test-connection', body);
        expect(result).toBe(setCommonMock.changed);
    });
});
