import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/data-table-records/list.json';
import * as getMock from './mocks/data-table-records/get.json';
import * as createMock from './mocks/data-table-records/create.json';
import * as bulkCreateMock from './mocks/data-table-records/bulk-create.json';
import * as updateMock from './mocks/data-table-records/update.json';
import * as bulkUpdateMock from './mocks/data-table-records/bulk-update.json';
import * as deleteMock from './mocks/data-table-records/delete.json';
import * as bulkDeleteMock from './mocks/data-table-records/bulk-delete.json';
import * as existsMock from './mocks/data-table-records/exists.json';
import * as validateQueryMock from './mocks/data-table-records/validate-query.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const DATA_TABLE_ID = 137;

describe('Endpoints: DataTableRecords', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list data table records', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`, listMock);

        const result = await make.dataTables.records.list(DATA_TABLE_ID);
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should list data table records with search options', async () => {
        mockFetch(
            `GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records?limit=10&page=2&query=john&keys%5B%5D=customer-1&keys%5B%5D=customer-2&sortBy=name&sortDir=asc`,
            listMock,
        );

        const result = await make.dataTables.records.list(DATA_TABLE_ID, {
            limit: 10,
            page: 2,
            query: 'john',
            keys: ['customer-1', 'customer-2'],
            sortBy: 'name',
            sortDir: 'asc',
        });
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should serialize a structured filter when listing data table records', async () => {
        const filter = [[{ columnName: 'status', operator: 'text:equal' as const, value: 'active' }]];
        mockFetch(
            `GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records?filter=${encodeURIComponent(JSON.stringify(filter))}`,
            listMock,
        );

        const result = await make.dataTables.records.list(DATA_TABLE_ID, { filter });
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should pass a string filter through when listing data table records', async () => {
        const filter = JSON.stringify([[{ columnName: 'status', operator: 'text:equal', value: 'active' }]]);
        mockFetch(
            `GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records?filter=${encodeURIComponent(filter)}`,
            listMock,
        );

        const result = await make.dataTables.records.list(DATA_TABLE_ID, { filter });
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should get a data table record by key', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1`, getMock);

        const result = await make.dataTables.records.get(DATA_TABLE_ID, 'customer-1');
        expect(result).toStrictEqual({
            key: 'customer-1',
            data: { name: 'John Doe', email: 'john.doe@example.com' },
        });
    });

    it('Should check whether a data table record exists', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1/exists`, existsMock);

        const result = await make.dataTables.records.exists(DATA_TABLE_ID, 'customer-1');
        expect(result).toBe(true);
    });

    it('Should create a data table record', async () => {
        const body = { key: 'customer-1', data: { name: 'John Doe', email: 'john.doe@example.com' } };
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.dataTables.records.create(DATA_TABLE_ID, body);
        expect(result).toStrictEqual({
            key: 'customer-1',
            data: { name: 'John Doe', email: 'john.doe@example.com' },
        });
    });

    it('Should bulk create data table records', async () => {
        const body = {
            records: [{ data: { name: 'John Doe' } }, { data: { name: 'Jane Doe' } }],
            overwrite: false,
        };
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/bulk`, bulkCreateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataTables.records.createMany(DATA_TABLE_ID, body);
        expect(result).toStrictEqual(bulkCreateMock.records);
    });

    it('Should update a data table record', async () => {
        const data = { email: 'new.email@example.com' };
        mockFetch(
            `PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1`,
            updateMock,
            req => {
                expect(req.body).toStrictEqual({ data });
            },
        );

        const result = await make.dataTables.records.update(DATA_TABLE_ID, 'customer-1', data);
        expect(result).toStrictEqual({
            key: 'customer-1',
            data: { name: 'John Doe', email: 'new.email@example.com' },
        });
    });

    it('Should bulk update data table records', async () => {
        const records = [
            { key: 'customer-1', data: { status: 'active' } },
            { key: 'customer-2', data: { status: 'inactive' } },
        ];
        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`, bulkUpdateMock, req => {
            expect(req.body).toStrictEqual({ records });
        });

        const result = await make.dataTables.records.updateMany(DATA_TABLE_ID, records);
        expect(result).toStrictEqual(bulkUpdateMock.records);
    });

    it('Should delete a data table record', async () => {
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1`, deleteMock);

        await make.dataTables.records.delete(DATA_TABLE_ID, 'customer-1');
    });

    it('Should URL-encode record keys in paths', async () => {
        // Keys may contain any non-blank characters, incl. `/`, `?` and `#` that break URL routing
        const key = 'a/b?c#d';
        const encodedKey = 'a%2Fb%3Fc%23d';

        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/${encodedKey}`, getMock);
        await make.dataTables.records.get(DATA_TABLE_ID, key);

        mockFetch(
            `GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/${encodedKey}/exists`,
            existsMock,
        );
        await make.dataTables.records.exists(DATA_TABLE_ID, key);

        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/${encodedKey}`, updateMock);
        await make.dataTables.records.update(DATA_TABLE_ID, key, { status: 'active' });

        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/${encodedKey}`, deleteMock);
        await make.dataTables.records.delete(DATA_TABLE_ID, key);
    });

    it('Should bulk delete data table records', async () => {
        const keys = ['customer-1', 'customer-2'];
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`, bulkDeleteMock, req => {
            expect(req.body).toStrictEqual({ keys });
        });

        const result = await make.dataTables.records.deleteMany(DATA_TABLE_ID, keys);
        expect(result).toStrictEqual(keys);
    });

    it('Should validate a data table query', async () => {
        const body = { query: "status = 'active'" };
        mockFetch(
            `POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/query/validate`,
            validateQueryMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.dataTables.records.validateQuery(DATA_TABLE_ID, body);
        expect(result).toStrictEqual({ valid: true });
    });

    it('Should validate a data table filter', async () => {
        const body = {
            filter: [
                [
                    { columnName: 'status', operator: 'text:equal' as const, value: 'active' },
                    { columnName: 'age', operator: 'number:greater' as const, value: 30 },
                ],
                [{ columnName: 'vip', operator: 'boolean:istrue' as const }],
            ],
        };
        mockFetch(
            `POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/query/validate`,
            validateQueryMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.dataTables.records.validateQuery(DATA_TABLE_ID, body);
        expect(result).toStrictEqual({ valid: true });
    });
});
