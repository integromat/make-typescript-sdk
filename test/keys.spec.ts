import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/keys/list.json';
import * as getMock from './mocks/keys/get.json';
import * as createMock from './mocks/keys/create.json';
import * as updateMock from './mocks/keys/update.json';
import * as listTypesMock from './mocks/keys/list-types.json';
const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Keys', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list keys', async () => {
        mockFetch('GET https://make.local/api/v2/keys?teamId=789', listMock);

        const result = await make.keys.list(789);
        expect(result).toStrictEqual(listMock.keys);
    });

    it('Should get a key', async () => {
        mockFetch(`GET https://make.local/api/v2/keys/1`, getMock);

        const result = await make.keys.get(1);
        expect(result).toStrictEqual(getMock.key);
    });

    it('Should create a key', async () => {
        const body = {
            name: 'Basic Auth',
            teamId: 22,
            typeName: 'basicauth',
            parameters: {
                username: 'user',
                password: 'password',
            },
        };

        mockFetch('POST https://make.local/api/v2/keys', createMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.keys.create(body);
        expect(result).toStrictEqual(createMock.key);
    });

    it('Should update a key', async () => {
        const body = {
            name: 'Updated basic auth key',
        };

        mockFetch(`PATCH https://make.local/api/v2/keys/16`, updateMock, req => {
            expect(req.body).toStrictEqual({ name: 'Updated basic auth key' });
        });

        const result = await make.keys.update(16, body);
        expect(result).toStrictEqual(updateMock.key);
    });

    it('Should delete a key', async () => {
        mockFetch(`DELETE https://make.local/api/v2/keys/16?confirmed=true`, null);

        await make.keys.delete(16);
    });

    it('Should list key types', async () => {
        mockFetch('GET https://make.local/api/v2/keys/types', listTypesMock);

        const result = await make.keys.types();
        expect(result).toStrictEqual(listTypesMock.keysTypes);
    });
});
