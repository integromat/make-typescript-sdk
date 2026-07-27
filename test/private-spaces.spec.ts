import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';
import type { PrivateSpace } from '../src/endpoints/private-spaces.js';

import * as privateSpacesListMock from './mocks/private-spaces/list.json';

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
});
