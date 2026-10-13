import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/data-table-columns/list.json';
import * as getMock from './mocks/data-table-columns/get.json';
import * as createMock from './mocks/data-table-columns/create.json';
import * as updateMock from './mocks/data-table-columns/update.json';
import * as deleteMock from './mocks/data-table-columns/delete.json';
import * as reorderMock from './mocks/data-table-columns/reorder.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const DATA_TABLE_ID = 137;

describe('Endpoints: DataTableColumns', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list data table columns', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns`, listMock);

        const result = await make.dataTables.columns.list(DATA_TABLE_ID);
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should list data table columns with pagination and sorting', async () => {
        mockFetch(
            `GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns?limit=10&page=2&sortBy=order&sortDir=asc`,
            listMock,
        );

        const result = await make.dataTables.columns.list(DATA_TABLE_ID, {
            limit: 10,
            page: 2,
            sortBy: 'order',
            sortDir: 'asc',
        });
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should get a data table column by ID', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10`, getMock);

        const result = await make.dataTables.columns.get(DATA_TABLE_ID, 10);
        expect(result).toStrictEqual({
            id: 10,
            name: 'Name',
            type: 'text',
            locked: false,
            required: true,
            order: 1,
        });
    });

    it('Should create a data table column', async () => {
        const body = { name: 'Email', type: 'email' as const, required: true };
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.dataTables.columns.create(DATA_TABLE_ID, body);
        expect(result).toStrictEqual({
            id: 12,
            name: 'Email',
            type: 'email',
            locked: false,
            required: true,
            order: 3,
        });
    });

    it('Should update a data table column', async () => {
        const body = { name: 'Renamed Column' };
        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10`, updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataTables.columns.update(DATA_TABLE_ID, 10, body);
        expect(result).toStrictEqual({
            id: 10,
            name: 'Renamed Column',
            type: 'text',
            locked: false,
            required: true,
            order: 1,
        });
    });

    it('Should update a data table column with force', async () => {
        const body = { type: 'number' as const };
        mockFetch(
            `PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10?force=true`,
            updateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.dataTables.columns.update(DATA_TABLE_ID, 10, body, { force: true });
        expect(result).toStrictEqual({
            id: 10,
            name: 'Renamed Column',
            type: 'text',
            locked: false,
            required: true,
            order: 1,
        });
    });

    it('Should delete a data table column', async () => {
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10`, deleteMock);

        await make.dataTables.columns.delete(DATA_TABLE_ID, 10);
    });

    it('Should reorder data table columns', async () => {
        const columnIds = [11, 10];
        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/order`, reorderMock, req => {
            expect(req.body).toStrictEqual({ columnIds });
        });

        const result = await make.dataTables.columns.reorder(DATA_TABLE_ID, columnIds);
        expect(result).toStrictEqual(reorderMock.data);
    });
});
