import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/hook-incomings/list.json';
import * as statsMock from './mocks/hook-incomings/stats.json';
import * as getMock from './mocks/hook-incomings/get.json';
import * as deleteMock from './mocks/hook-incomings/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const HOOK_ID = 11;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: hook-incomings', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute hook-incomings_list', async () => {
        mockFetch(`GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings`, listMock);

        const tool = getTool('hook-incomings_list');
        const result = await tool.execute(make, { hookId: HOOK_ID });

        expect(result).toStrictEqual(listMock.incomings);
    });

    it('Should execute hook-incomings_stats', async () => {
        mockFetch(`GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings/stats`, statsMock);

        const tool = getTool('hook-incomings_stats');
        const result = await tool.execute(make, { hookId: HOOK_ID });

        expect(result).toStrictEqual(statsMock.incomingStat);
    });

    it('Should execute hook-incomings_get', async () => {
        mockFetch(`GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings/8d88f6f5b0484908890ef11fe7e5bf63`, getMock);

        const tool = getTool('hook-incomings_get');
        const result = await tool.execute(make, { hookId: HOOK_ID, incomingId: '8d88f6f5b0484908890ef11fe7e5bf63' });

        expect(result).toStrictEqual(getMock.incoming);
    });

    it('Should constrain hook-incomings_get to queue item IDs', () => {
        const tool = getTool('hook-incomings_get');

        expect(tool.inputSchema.properties?.incomingId?.pattern).toBe('^[0-9a-f]{32}$');
    });

    it('Should execute hook-incomings_delete', async () => {
        const ids = ['d1efa5318a034d36ad7cbeac543573cf', '29d9a7410dff494ab739036f6c332335'];

        mockFetch(`DELETE https://make.local/api/v2/hooks/${HOOK_ID}/incomings`, deleteMock, req => {
            expect(req.body).toStrictEqual({ ids });
        });

        const tool = getTool('hook-incomings_delete');
        const result = await tool.execute(make, { hookId: HOOK_ID, ids });

        expect(result).toStrictEqual({ deletedIds: deleteMock.incomings, error: undefined });
    });

    it('Should describe the valid hook-incomings_delete input variants', () => {
        const tool = getTool('hook-incomings_delete');
        const idsVariant = tool.inputSchema.oneOf?.find(schema => schema.required?.includes('ids'));

        expect(tool.inputSchema.oneOf).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ required: ['ids'] }),
                expect.objectContaining({
                    required: ['all', 'confirmed'],
                    properties: expect.objectContaining({
                        all: expect.objectContaining({ const: true }),
                        confirmed: expect.objectContaining({ const: true }),
                    }),
                }),
            ]),
        );
        expect(tool.inputSchema.properties?.ids?.minItems).toBe(1);
        expect(idsVariant?.properties?.ids?.minItems).toBe(1);
    });
});
