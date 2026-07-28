import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';
import type { PrivateSpace } from '../src/endpoints/private-spaces.js';

import * as privateSpacesListMock from './mocks/private-spaces/list.json';
import * as privateSpaceGetMock from './mocks/private-spaces/get.json';
import * as privateSpaceUpdateMock from './mocks/private-spaces/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: PrivateSpaces', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list private spaces', async () => {
        mockFetch('GET https://make.local/api/v2/private-spaces?organizationId=5', privateSpacesListMock);

        const result = await make.privateSpaces.list(5);

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should list private spaces filtered by externalId with pagination', async () => {
        mockFetch(
            'GET https://make.local/api/v2/private-spaces?organizationId=5&externalId=ext-1&pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc',
            privateSpacesListMock,
        );

        const result = await make.privateSpaces.list(5, {
            externalId: 'ext-1',
            pg: {
                sortBy: 'name',
                sortDir: 'asc',
            },
        });

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should list private spaces with selected columns', async () => {
        const cols: (keyof PrivateSpace)[] = ['id', 'name', 'isPaused'];
        mockFetch(
            `GET https://make.local/api/v2/private-spaces?organizationId=5&cols%5B%5D=${cols.join('&cols%5B%5D=')}`,
            privateSpacesListMock,
        );

        const result = await make.privateSpaces.list(5, {
            cols,
        });

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should get a private space', async () => {
        mockFetch('GET https://make.local/api/v2/private-spaces/101', privateSpaceGetMock);

        const result = await make.privateSpaces.get(101);

        expect(result).toStrictEqual(privateSpaceGetMock.privateSpace);
    });

    it('Should get a private space with usage columns', async () => {
        const cols: (keyof PrivateSpace)[] = ['id', 'operations', 'transfer', 'centicredits'];
        mockFetch(
            `GET https://make.local/api/v2/private-spaces/101?cols%5B%5D=${cols.join('&cols%5B%5D=')}`,
            privateSpaceGetMock,
        );

        const result = await make.privateSpaces.get(101, {
            cols,
        });

        expect(result).toStrictEqual(privateSpaceGetMock.privateSpace);
    });

    it('Should update a private space', async () => {
        const body = {
            operationsLimit: 100,
        };

        mockFetch('PATCH https://make.local/api/v2/private-spaces/101', privateSpaceUpdateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.privateSpaces.update(101, body);

        expect(result).toStrictEqual(privateSpaceUpdateMock.privateSpace);
    });

    it('Should update a private space with confirmation and null limit', async () => {
        const body = {
            operationsLimit: null,
        };

        mockFetch('PATCH https://make.local/api/v2/private-spaces/101?confirmed=true', privateSpaceUpdateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.privateSpaces.update(101, body, { confirmed: true });

        expect(result).toStrictEqual(privateSpaceUpdateMock.privateSpace);
    });
});
