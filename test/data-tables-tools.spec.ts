import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/data-tables/list.json';
import * as getMock from './mocks/data-tables/get.json';
import * as createMock from './mocks/data-tables/create.json';
import * as updateMock from './mocks/data-tables/update.json';
import * as deleteMock from './mocks/data-tables/delete.json';
import * as importMock from './mocks/data-tables/import.json';
import * as recordsListMock from './mocks/data-table-records/list.json';
import * as recordsGetMock from './mocks/data-table-records/get.json';
import * as recordsCreateMock from './mocks/data-table-records/create.json';
import * as recordsBulkCreateMock from './mocks/data-table-records/bulk-create.json';
import * as recordsUpdateMock from './mocks/data-table-records/update.json';
import * as recordsBulkUpdateMock from './mocks/data-table-records/bulk-update.json';
import * as recordsDeleteMock from './mocks/data-table-records/delete.json';
import * as recordsBulkDeleteMock from './mocks/data-table-records/bulk-delete.json';
import * as recordsExistsMock from './mocks/data-table-records/exists.json';
import * as recordsValidateQueryMock from './mocks/data-table-records/validate-query.json';
import * as columnsListMock from './mocks/data-table-columns/list.json';
import * as columnsGetMock from './mocks/data-table-columns/get.json';
import * as columnsCreateMock from './mocks/data-table-columns/create.json';
import * as columnsUpdateMock from './mocks/data-table-columns/update.json';
import * as columnsDeleteMock from './mocks/data-table-columns/delete.json';
import * as columnsReorderMock from './mocks/data-table-columns/reorder.json';
import * as usingScenariosListMock from './mocks/data-table-using-scenarios/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const MAKE_TEAM = 5;
const DATA_TABLE_ID = 137;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing tool: ${name}`);
    }
    return tool;
}

describe('Tools: data-tables', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute data-tables_list', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables?teamId=${MAKE_TEAM}`, listMock);

        const result = await getTool('data-tables_list').execute(make, { teamId: MAKE_TEAM });
        expect(result).toStrictEqual(listMock.data);
    });

    it('Should execute data-tables_get', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}`, getMock);

        const result = await getTool('data-tables_get').execute(make, { dataTableId: DATA_TABLE_ID });
        expect(result).toStrictEqual({ id: 137, name: 'Customers', maxStorageSizeMb: 1 });
    });

    it('Should execute data-tables_create', async () => {
        mockFetch('POST https://make.local/api/v2/data-tables', createMock, req => {
            expect(req.body).toStrictEqual({ teamId: MAKE_TEAM, name: 'Customers' });
        });

        const result = await getTool('data-tables_create').execute(make, { teamId: MAKE_TEAM, name: 'Customers' });
        expect(result).toStrictEqual({ id: 137, name: 'Customers', maxStorageSizeMb: 1 });
    });

    it('Should execute data-tables_update', async () => {
        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual({ name: 'Updated Table' });
        });

        const result = await getTool('data-tables_update').execute(make, {
            dataTableId: DATA_TABLE_ID,
            name: 'Updated Table',
        });
        expect(result).toStrictEqual({ id: 137, name: 'Updated Table', maxStorageSizeMb: 2 });
    });

    it('Should execute data-tables_delete', async () => {
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}`, deleteMock);

        await getTool('data-tables_delete').execute(make, { dataTableId: DATA_TABLE_ID });
    });

    it('Should execute data-tables_import', async () => {
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/import`, importMock, req => {
            expect(req.body).toStrictEqual({ fileType: 'json', content: '[{"name":"John"}]' });
        });

        const result = await getTool('data-tables_import').execute(make, {
            dataTableId: DATA_TABLE_ID,
            fileType: 'json',
            content: '[{"name":"John"}]',
        });
        expect(result).toBe(2);
    });
});

describe('Tools: data-table-records', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute data-table-records_list', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records?limit=10`, recordsListMock);

        const result = await getTool('data-table-records_list').execute(make, {
            dataTableId: DATA_TABLE_ID,
            limit: 10,
        });
        expect(result).toStrictEqual(recordsListMock.data);
    });

    it('Should execute data-table-records_get', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1`, recordsGetMock);

        const result = await getTool('data-table-records_get').execute(make, {
            dataTableId: DATA_TABLE_ID,
            key: 'customer-1',
        });
        expect(result).toStrictEqual({
            key: 'customer-1',
            data: { name: 'John Doe', email: 'john.doe@example.com' },
        });
    });

    it('Should execute data-table-records_exists', async () => {
        mockFetch(
            `GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1/exists`,
            recordsExistsMock,
        );

        const result = await getTool('data-table-records_exists').execute(make, {
            dataTableId: DATA_TABLE_ID,
            key: 'customer-1',
        });
        expect(result).toBe(true);
    });

    it('Should execute data-table-records_create', async () => {
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`, recordsCreateMock, req => {
            expect(req.body).toStrictEqual({ key: 'customer-1', data: { name: 'John Doe' } });
        });

        const result = await getTool('data-table-records_create').execute(make, {
            dataTableId: DATA_TABLE_ID,
            key: 'customer-1',
            data: { name: 'John Doe' },
        });
        expect(result).toStrictEqual({
            key: 'customer-1',
            data: { name: 'John Doe', email: 'john.doe@example.com' },
        });
    });

    it('Should execute data-table-records_bulk-create', async () => {
        mockFetch(
            `POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/bulk`,
            recordsBulkCreateMock,
            req => {
                expect(req.body).toStrictEqual({ records: [{ data: { name: 'John Doe' } }] });
            },
        );

        const result = await getTool('data-table-records_bulk-create').execute(make, {
            dataTableId: DATA_TABLE_ID,
            records: [{ data: { name: 'John Doe' } }],
        });
        expect(result).toStrictEqual(recordsBulkCreateMock.records);
    });

    it('Should execute data-table-records_update', async () => {
        mockFetch(
            `PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1`,
            recordsUpdateMock,
            req => {
                expect(req.body).toStrictEqual({ data: { email: 'new.email@example.com' } });
            },
        );

        const result = await getTool('data-table-records_update').execute(make, {
            dataTableId: DATA_TABLE_ID,
            key: 'customer-1',
            data: { email: 'new.email@example.com' },
        });
        expect(result).toStrictEqual({
            key: 'customer-1',
            data: { name: 'John Doe', email: 'new.email@example.com' },
        });
    });

    it('Should execute data-table-records_bulk-update', async () => {
        const records = [{ key: 'customer-1', data: { status: 'active' } }];
        mockFetch(
            `PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`,
            recordsBulkUpdateMock,
            req => {
                expect(req.body).toStrictEqual({ records });
            },
        );

        const result = await getTool('data-table-records_bulk-update').execute(make, {
            dataTableId: DATA_TABLE_ID,
            records,
        });
        expect(result).toStrictEqual(recordsBulkUpdateMock.records);
    });

    it('Should execute data-table-records_delete', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/customer-1`,
            recordsDeleteMock,
        );

        await getTool('data-table-records_delete').execute(make, {
            dataTableId: DATA_TABLE_ID,
            key: 'customer-1',
        });
    });

    it('Should execute data-table-records_bulk-delete', async () => {
        const keys = ['customer-1', 'customer-2'];
        mockFetch(
            `DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records`,
            recordsBulkDeleteMock,
            req => {
                expect(req.body).toStrictEqual({ keys });
            },
        );

        const result = await getTool('data-table-records_bulk-delete').execute(make, {
            dataTableId: DATA_TABLE_ID,
            keys,
        });
        expect(result).toStrictEqual(keys);
    });

    it('Should execute data-table-records_validate-query', async () => {
        mockFetch(
            `POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/records/query/validate`,
            recordsValidateQueryMock,
            req => {
                expect(req.body).toStrictEqual({ query: "status = 'active'" });
            },
        );

        const result = await getTool('data-table-records_validate-query').execute(make, {
            dataTableId: DATA_TABLE_ID,
            query: "status = 'active'",
        });
        expect(result).toStrictEqual({ valid: true });
    });
});

describe('Tools: data-table-columns', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute data-table-columns_list', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns`, columnsListMock);

        const result = await getTool('data-table-columns_list').execute(make, { dataTableId: DATA_TABLE_ID });
        expect(result).toStrictEqual(columnsListMock.data);
    });

    it('Should execute data-table-columns_get', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10`, columnsGetMock);

        const result = await getTool('data-table-columns_get').execute(make, {
            dataTableId: DATA_TABLE_ID,
            columnId: 10,
        });
        expect(result).toStrictEqual({
            id: 10,
            name: 'Name',
            type: 'text',
            locked: false,
            required: true,
            order: 1,
        });
    });

    it('Should execute data-table-columns_create', async () => {
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns`, columnsCreateMock, req => {
            expect(req.body).toStrictEqual({ name: 'Email', type: 'email', required: true });
        });

        const result = await getTool('data-table-columns_create').execute(make, {
            dataTableId: DATA_TABLE_ID,
            name: 'Email',
            type: 'email',
            required: true,
        });
        expect(result).toStrictEqual({
            id: 12,
            name: 'Email',
            type: 'email',
            locked: false,
            required: true,
            order: 3,
        });
    });

    it('Should execute data-table-columns_update with force', async () => {
        mockFetch(
            `PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10?force=true`,
            columnsUpdateMock,
            req => {
                expect(req.body).toStrictEqual({ name: 'Renamed Column' });
            },
        );

        const result = await getTool('data-table-columns_update').execute(make, {
            dataTableId: DATA_TABLE_ID,
            columnId: 10,
            name: 'Renamed Column',
            force: true,
        });
        expect(result).toStrictEqual({
            id: 10,
            name: 'Renamed Column',
            type: 'text',
            locked: false,
            required: true,
            order: 1,
        });
    });

    it('Should execute data-table-columns_delete', async () => {
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/10`, columnsDeleteMock);

        await getTool('data-table-columns_delete').execute(make, { dataTableId: DATA_TABLE_ID, columnId: 10 });
    });

    it('Should execute data-table-columns_reorder', async () => {
        const columnIds = [11, 10];
        mockFetch(
            `PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/columns/order`,
            columnsReorderMock,
            req => {
                expect(req.body).toStrictEqual({ columnIds });
            },
        );

        const result = await getTool('data-table-columns_reorder').execute(make, {
            dataTableId: DATA_TABLE_ID,
            columnIds,
        });
        expect(result).toStrictEqual(columnsReorderMock.data);
    });
});

describe('Tools: data-table-using-scenarios', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute data-table-using-scenarios_list', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/using-scenarios`, usingScenariosListMock);

        const result = await getTool('data-table-using-scenarios_list').execute(make, {
            dataTableId: DATA_TABLE_ID,
        });
        expect(result).toStrictEqual(usingScenariosListMock.scenarios);
    });

    it('Should execute data-table-using-scenarios_add', async () => {
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/add-using-scenario`, '', req => {
            expect(req.body).toStrictEqual({ scenarioId: 25, columnIds: [10, 11] });
        });

        await getTool('data-table-using-scenarios_add').execute(make, {
            dataTableId: DATA_TABLE_ID,
            scenarioId: 25,
            columnIds: [10, 11],
        });
    });

    it('Should execute data-table-using-scenarios_update', async () => {
        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/using-scenario`, '', req => {
            expect(req.body).toStrictEqual({ scenarioId: 25, columnIds: [10] });
        });

        await getTool('data-table-using-scenarios_update').execute(make, {
            dataTableId: DATA_TABLE_ID,
            scenarioId: 25,
            columnIds: [10],
        });
    });

    it('Should execute data-table-using-scenarios_remove', async () => {
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/remove-using-scenario`, '', req => {
            expect(req.body).toStrictEqual({ scenarioId: 25 });
        });

        await getTool('data-table-using-scenarios_remove').execute(make, {
            dataTableId: DATA_TABLE_ID,
            scenarioId: 25,
        });
    });
});
