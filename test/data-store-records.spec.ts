import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as dataStoreRecordsListMock from './mocks/data-store-records/list.json';
import * as dataStoreRecordsCreateMock from './mocks/data-store-records/create.json';
import * as dataStoreRecordsUpdateMock from './mocks/data-store-records/update.json';
import * as dataStoreRecordsReplaceMock from './mocks/data-store-records/replace.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: DataStoreRecords', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list records in a data store', async () => {
        mockFetch(
            'GET https://make.local/api/v2/data-stores/137/data?pg%5Blimit%5D=10&pg%5Boffset%5D=0',
            dataStoreRecordsListMock,
        );

        const result = await make.dataStores.records.list(137, {
            pg: {
                limit: 10,
                offset: 0,
            },
        });

        expect(result).toStrictEqual(dataStoreRecordsListMock.records);
    });

    it('Should create a record in a data store', async () => {
        const body = {
            name: 'Alice Brown',
            email: 'alice.brown@example.com',
            status: 'active',
        };

        mockFetch('POST https://make.local/api/v2/data-stores/137/data', dataStoreRecordsCreateMock, req => {
            expect(req.body).toStrictEqual({ data: body });
        });

        const result = await make.dataStores.records.create(137, body);
        expect(result).toStrictEqual(dataStoreRecordsCreateMock);
    });

    it('Should update a record in a data store', async () => {
        const body = {
            email: 'john.updated@example.com',
            status: 'inactive',
        };

        mockFetch(
            'PATCH https://make.local/api/v2/data-stores/137/data/8f7162828bc0',
            dataStoreRecordsUpdateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.dataStores.records.update(137, '8f7162828bc0', body);
        expect(result).toStrictEqual(dataStoreRecordsUpdateMock);
    });

    it('Should replace a record in a data store', async () => {
        const body = {
            name: 'John Smith',
            email: 'john.smith@example.com',
            status: 'active',
        };

        mockFetch(
            'PUT https://make.local/api/v2/data-stores/137/data/8f7162828bc0',
            dataStoreRecordsReplaceMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.dataStores.records.replace(137, '8f7162828bc0', body);
        expect(result).toStrictEqual(dataStoreRecordsReplaceMock);
    });

    it('Should delete records from a data store', async () => {
        const keys = ['8f7162828bc0', '9a8273939ad1'];

        mockFetch('DELETE https://make.local/api/v2/data-stores/137/data?confirmed=true', null, req => {
            expect(req.body).toStrictEqual({
                keys,
            });
        });

        await make.dataStores.records.delete(137, keys);
    });

    it('Should delete all records from a data store', async () => {
        mockFetch('DELETE https://make.local/api/v2/data-stores/137/data?confirmed=true', null);

        await make.dataStores.records.deleteAll(137);
    });

    it('Should delete all records except specified ones from a data store', async () => {
        const exceptKeys = ['8f7162828bc0'];

        mockFetch('DELETE https://make.local/api/v2/data-stores/137/data?confirmed=true', null, req => {
            expect(req.body).toStrictEqual({
                all: true,
                exceptKeys,
            });
        });

        await make.dataStores.records.deleteAll(137, exceptKeys);
    });
});
