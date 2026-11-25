import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/keys/list.json';
import * as getMock from './mocks/keys/get.json';
import * as createMock from './mocks/keys/create.json';
import * as updateMock from './mocks/keys/update.json';
import * as listTypesMock from './mocks/keys/list-types.json';
import * as listLockedMock from './mocks/keys/list-locked.json';
import * as listUnusableMock from './mocks/keys/list-unusable.json';
import * as makeLockedMock from './mocks/keys/make-locked.json';
import * as makeTeamMock from './mocks/keys/make-team.json';
const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Keys', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list keys', async () => {
        mockFetch('GET https://make.local/api/v2/keys?teamId=789', listMock);

        const result = await make.keys.list(789);
        expect(result).toStrictEqual(listMock.keys);
    });

    it('Should list the usable locked keys', async () => {
        mockFetch(
            'GET https://make.local/api/v2/keys?teamId=22&cols%5B%5D=*&visibility=locked&usable=true',
            listLockedMock,
        );

        const result = await make.keys.list(22, { cols: ['*'], visibility: 'locked', usable: true });
        expect(result).toStrictEqual(listLockedMock.keys);
    });

    it('Should list the keys the caller cannot use', async () => {
        mockFetch('GET https://make.local/api/v2/keys?teamId=22&usable=false', listUnusableMock);

        const result = await make.keys.list(22, { usable: false });
        expect(result).toStrictEqual(listUnusableMock.keys);
    });

    it('Should type acl on the rows listed with both id and visibility', async () => {
        mockFetch('GET https://make.local/api/v2/keys?teamId=22&cols%5B%5D=id&cols%5B%5D=visibility', {
            keys: [{ id: 8, visibility: 'locked', acl: { permissions: ['entity use'], isOrphaned: false } }],
        });

        const result = await make.keys.list(22, { cols: ['id', 'visibility'] });
        expect(result[0]?.acl?.permissions).toStrictEqual(['entity use']);
    });

    it('Should not type acl on the rows listed without id', async () => {
        mockFetch('GET https://make.local/api/v2/keys?teamId=22&cols%5B%5D=visibility', {
            keys: [{ visibility: 'locked' }],
        });

        const result = await make.keys.list(22, { cols: ['visibility'] });
        // @ts-expect-error without `id` the API sends no `acl`
        expect(result[0]?.acl).toBeUndefined();
    });

    it('Should not accept acl as a column', async () => {
        mockFetch(
            'GET https://make.local/api/v2/keys?teamId=22&cols%5B%5D=acl',
            { message: 'Validation of query columns failed' },
            400,
        );

        // @ts-expect-error `acl` is derived by the API, not a column
        const request = make.keys.list(22, { cols: ['acl'] });
        await expect(request).rejects.toMatchObject({ statusCode: 400 });
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

    it('Should lock a key', async () => {
        mockFetch('POST https://make.local/api/v2/keys/8/make-locked', makeLockedMock);

        const result = await make.keys.makeLocked(8);
        expect(result).toStrictEqual(makeLockedMock.key);
    });

    it('Should make a key available to the team', async () => {
        mockFetch('POST https://make.local/api/v2/keys/8/make-team', makeTeamMock);

        const result = await make.keys.makeTeam(8);
        expect(result).toStrictEqual(makeTeamMock.key);
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
