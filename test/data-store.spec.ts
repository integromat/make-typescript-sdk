import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as dataStoresMock from './mocks/data-stores/list.json';
import * as dataStoreCreateMock from './mocks/data-stores/create.json';
import * as dataStoreGetMock from './mocks/data-stores/get.json';
import * as dataStoreUpdateMock from './mocks/data-stores/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: DataStores', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list data stores', async () => {
        mockFetch(
            'GET https://make.local/api/v2/data-stores?teamId=123&pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc',
            dataStoresMock,
        );

        const result = await make.dataStores.list(123, {
            pg: {
                sortBy: 'name',
                sortDir: 'asc',
            },
        });

        expect(result).toStrictEqual(dataStoresMock.dataStores);
    });

    it('Should create a data store', async () => {
        const body = {
            name: 'New Customers',
            teamId: 123,
            maxSizeMB: 1,
        };

        mockFetch('POST https://make.local/api/v2/data-stores', dataStoreCreateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataStores.create(body);

        expect(result).toStrictEqual(dataStoreCreateMock.dataStore);
    });

    it('Should get a data store', async () => {
        mockFetch('GET https://make.local/api/v2/data-stores/137', dataStoreGetMock);

        const result = await make.dataStores.get(137);

        expect(result).toStrictEqual(dataStoreGetMock.dataStore);
    });

    it('Should update a data store', async () => {
        const body = {
            name: 'Updated Customers',
        };

        mockFetch('PATCH https://make.local/api/v2/data-stores/137', dataStoreUpdateMock, req => {
            // The teamId is removed from the body and added to the query params
            expect(req.body).toStrictEqual({ name: 'Updated Customers' });
        });

        const result = await make.dataStores.update(137, body);

        expect(result).toStrictEqual(dataStoreUpdateMock.dataStore);
    });

    it('Should delete a data store', async () => {
        mockFetch('DELETE https://make.local/api/v2/data-stores/137?confirmed=true', null);

        await make.dataStores.delete(137);
    });
});
