import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/apps/list.json';
import * as getMock from '../mocks/sdk/apps/get.json';
import * as createMock from '../mocks/sdk/apps/create.json';
import * as updateMock from '../mocks/sdk/apps/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > Apps', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list SDK apps', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps', listMock);

        const result = await make.sdk.apps.list();
        expect(result).toStrictEqual(listMock.apps);
    });

    it('Should list SDK apps with options', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps?all=true&cols%5B%5D=name&cols%5B%5D=label', listMock);

        const result = await make.sdk.apps.list({ all: true, cols: ['name', 'label'] });
        expect(result).toStrictEqual(listMock.apps);
    });

    it('Should get SDK app by name and version', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/postman-test-app-1/1', getMock);

        const result = await make.sdk.apps.get('postman-test-app-1', 1);
        expect(result).toStrictEqual(getMock.app);
    });

    it('Should get SDK app with options', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/postman-test-app-1/1', getMock);

        const result = await make.sdk.apps.get('postman-test-app-1', 1);
        expect(result).toStrictEqual(getMock.app);
    });

    it('Should create SDK app', async () => {
        const body = {
            name: 'postman-test-app-7',
            label: 'Postman Test App',
            description: 'This is a testing app from Postman',
            theme: '#FF00FF',
            language: 'en',
            countries: [],
            private: false,
            audience: 'countries',
        };
        mockFetch('POST https://make.local/api/v2/sdk/apps', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.apps.create(body);
        expect(result).toStrictEqual(createMock.app);
    });

    it('Should update SDK app', async () => {
        const body = {
            audience: 'countries',
            description: 'Hey there, Charlie!',
            countries: ['us', 'uk', 'cz'],
            label: 'Multiverse',
            theme: '#AABBCC',
            language: 'en',
        };
        mockFetch('PATCH https://make.local/api/v2/sdk/apps/postman-test-app-1/1', updateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.apps.update('postman-test-app-1', 1, body);
        expect(result).toStrictEqual(updateMock.app);
    });

    it('Should delete SDK app', async () => {
        mockFetch('DELETE https://make.local/api/v2/sdk/apps/postman-test-app-1/1', null);

        await make.sdk.apps.delete('postman-test-app-1', 1);
    });
});
