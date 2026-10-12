import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/data-tables/list.json';
import * as getMock from './mocks/data-tables/get.json';
import * as createMock from './mocks/data-tables/create.json';
import * as updateMock from './mocks/data-tables/update.json';
import * as deleteMock from './mocks/data-tables/delete.json';
import * as importMock from './mocks/data-tables/import.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const MAKE_TEAM = 5;

describe('Endpoints: DataTables', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list data tables', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables?teamId=${MAKE_TEAM}`, listMock);

        const result = await make.dataTables.list(MAKE_TEAM);
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should list data tables with pagination and sorting', async () => {
        mockFetch(
            `GET https://make.local/api/v2/data-tables?teamId=${MAKE_TEAM}&limit=10&page=2&sortBy=name&sortDir=desc`,
            listMock,
        );

        const result = await make.dataTables.list(MAKE_TEAM, {
            limit: 10,
            page: 2,
            sortBy: 'name',
            sortDir: 'desc',
        });
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should get a data table by ID', async () => {
        mockFetch('GET https://make.local/api/v2/data-tables/137', getMock);

        const result = await make.dataTables.get(137);
        expect(result).toStrictEqual({ id: 137, name: 'Customers', maxStorageSizeMb: 1 });
    });

    it('Should create a data table', async () => {
        const body = { teamId: MAKE_TEAM, name: 'Customers' };
        mockFetch('POST https://make.local/api/v2/data-tables', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.dataTables.create(body);
        expect(result).toStrictEqual({ id: 137, name: 'Customers', maxStorageSizeMb: 1 });
    });

    it('Should update a data table', async () => {
        const body = { name: 'Updated Table', maxStorageSizeMb: 2 };
        mockFetch('PATCH https://make.local/api/v2/data-tables/137', updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataTables.update(137, body);
        expect(result).toStrictEqual({ id: 137, name: 'Updated Table', maxStorageSizeMb: 2 });
    });

    it('Should delete a data table', async () => {
        mockFetch('DELETE https://make.local/api/v2/data-tables/137', deleteMock);

        await make.dataTables.delete(137);
    });

    it('Should import records into a data table', async () => {
        const body = {
            fileType: 'csv' as const,
            content: 'name,email\nJohn,john@example.com',
            firstRowContainsHeaders: true,
        };
        mockFetch('POST https://make.local/api/v2/data-tables/137/import', importMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataTables.import(137, body);
        expect(result).toBe(2);
    });
});
