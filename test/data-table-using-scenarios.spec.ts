import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/data-table-using-scenarios/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const DATA_TABLE_ID = 137;

describe('Endpoints: DataTableUsingScenarios', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list using scenarios', async () => {
        mockFetch(`GET https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/using-scenarios`, listMock);

        const result = await make.dataTables.usingScenarios.list(DATA_TABLE_ID);
        expect(result).toStrictEqual(listMock.scenarios);
    });

    it('Should add a using scenario', async () => {
        const body = { scenarioId: 25, columnIds: [10, 11] };
        mockFetch(`POST https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/add-using-scenario`, '', req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        await make.dataTables.usingScenarios.add(DATA_TABLE_ID, body);
    });

    it('Should update a using scenario', async () => {
        const body = { scenarioId: 25, columnIds: [10] };
        mockFetch(`PATCH https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/using-scenario`, '', req => {
            expect(req.body).toStrictEqual(body);
        });

        await make.dataTables.usingScenarios.update(DATA_TABLE_ID, body);
    });

    it('Should remove a using scenario', async () => {
        mockFetch(`DELETE https://make.local/api/v2/data-tables/${DATA_TABLE_ID}/remove-using-scenario`, '', req => {
            expect(req.body).toStrictEqual({ scenarioId: 25 });
        });

        await make.dataTables.usingScenarios.remove(DATA_TABLE_ID, 25);
    });
});
