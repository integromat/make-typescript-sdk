import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import type { DeleteHookIncomingsOptions, ListHookIncomingsOptions } from '../src/endpoints/hook-incomings.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/hook-incomings/list.json';
import * as statsMock from './mocks/hook-incomings/stats.json';
import * as getMock from './mocks/hook-incomings/get.json';
import * as getConfidentialMock from './mocks/hook-incomings/get-confidential.json';
import * as deleteMock from './mocks/hook-incomings/delete.json';
import * as deletePartialErrorMock from './mocks/hook-incomings/delete-partial-error.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const HOOK_ID = 11;

describe('Endpoints: HookIncomings', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list queued items for a hook', async () => {
        mockFetch(`GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings`, listMock);

        const result = await make.hooks.incomings.list(HOOK_ID);

        expect(result).toStrictEqual(listMock.incomings);
    });

    it('Should forward from/to and pagination options when listing', async () => {
        mockFetch(
            `GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings?from=1000&to=2000&pg%5Blimit%5D=10&pg%5Boffset%5D=0`,
            listMock,
        );

        const result = await make.hooks.incomings.list(HOOK_ID, {
            from: 1000,
            to: 2000,
            pg: { limit: 10, offset: 0 },
        });

        expect(result).toStrictEqual(listMock.incomings);
    });

    it('Should reject an unsupported list sort field', async () => {
        const options = { pg: { sortBy: 'id' } } as unknown as ListHookIncomingsOptions;

        await expect(make.hooks.incomings.list(HOOK_ID, options)).rejects.toThrow(
            '`pg.sortBy` must be `created` when specified',
        );
    });

    it('Should reject an unsupported list sort direction', async () => {
        const options = { pg: { sortDir: 'sideways' } } as unknown as ListHookIncomingsOptions;

        await expect(make.hooks.incomings.list(HOOK_ID, options)).rejects.toThrow(
            '`pg.sortDir` must be `asc` or `desc` when specified',
        );
    });

    it.each([0, 1.5, 10_001])('Should reject an unsupported list limit: %s', async limit => {
        await expect(make.hooks.incomings.list(HOOK_ID, { pg: { limit } })).rejects.toThrow(
            '`pg.limit` must be an integer between 1 and 10000 when specified',
        );
    });

    it.each([-1, 1.5])('Should reject an unsupported list offset: %s', async offset => {
        await expect(make.hooks.incomings.list(HOOK_ID, { pg: { offset } })).rejects.toThrow(
            '`pg.offset` must be a non-negative integer when specified',
        );
    });

    it('Should get queue stats for a hook', async () => {
        mockFetch(`GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings/stats`, statsMock);

        const result = await make.hooks.incomings.stats(HOOK_ID);

        expect(result).toStrictEqual(statsMock.incomingStat);
    });

    it('Should get detail of a queued item', async () => {
        mockFetch(`GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings/8d88f6f5b0484908890ef11fe7e5bf63`, getMock);

        const result = await make.hooks.incomings.get(HOOK_ID, '8d88f6f5b0484908890ef11fe7e5bf63');

        expect(result).toStrictEqual(getMock.incoming);
    });

    it.each(['stats', '../../../users/me'])('Should reject malformed queue item ID %s', async incomingId => {
        await expect(make.hooks.incomings.get(HOOK_ID, incomingId)).rejects.toThrow(
            '`incomingId` must be a 32-character lowercase hexadecimal string',
        );
    });

    it('Should omit the payload for a confidential hook', async () => {
        mockFetch(
            `GET https://make.local/api/v2/hooks/${HOOK_ID}/incomings/7a567f385d1a4f5ab7bff89162b7605e`,
            getConfidentialMock,
        );

        const result = await make.hooks.incomings.get(HOOK_ID, '7a567f385d1a4f5ab7bff89162b7605e');

        expect(result).toStrictEqual(getConfidentialMock.incoming);
        expect(result.data).toBeUndefined();
    });

    it('Should delete specific queue items', async () => {
        const ids = ['d1efa5318a034d36ad7cbeac543573cf', '29d9a7410dff494ab739036f6c332335'];

        mockFetch(`DELETE https://make.local/api/v2/hooks/${HOOK_ID}/incomings`, deleteMock, req => {
            expect(req.body).toStrictEqual({ ids });
        });

        const result = await make.hooks.incomings.delete(HOOK_ID, { ids });

        expect(result).toStrictEqual({ deletedIds: deleteMock.incomings, error: undefined });
    });

    it('Should surface a partial-failure error alongside whatever was deleted', async () => {
        const ids = ['02731358e5ab4022aff040015a1f1a57', 'dcf18b685e5c4095b9ee24cea09146d3'];

        mockFetch(`DELETE https://make.local/api/v2/hooks/${HOOK_ID}/incomings`, deletePartialErrorMock, req => {
            expect(req.body).toStrictEqual({ ids });
        });

        const result = await make.hooks.incomings.delete(HOOK_ID, { ids });

        expect(result.deletedIds).toStrictEqual(deletePartialErrorMock.incomings);
        expect(result.error).toStrictEqual(deletePartialErrorMock.error);
    });

    it('Should confirm deletion of the entire queue', async () => {
        mockFetch(`DELETE https://make.local/api/v2/hooks/${HOOK_ID}/incomings?confirmed=true`, deleteMock, req => {
            expect(req.body).toStrictEqual({ all: true });
        });

        await make.hooks.incomings.delete(HOOK_ID, { all: true, confirmed: true });
    });

    it('Should reject deletion without a selector', async () => {
        await expect(make.hooks.incomings.delete(HOOK_ID, {} as DeleteHookIncomingsOptions)).rejects.toThrow(
            'Exactly one of `ids` or `all: true` must be specified',
        );
    });

    it('Should reject an empty list of deletion IDs', async () => {
        await expect(make.hooks.incomings.delete(HOOK_ID, { ids: [] })).rejects.toThrow(
            '`ids` must contain at least one queue item ID',
        );
    });

    it('Should require explicit confirmation when deleting the entire queue', async () => {
        await expect(make.hooks.incomings.delete(HOOK_ID, { all: true } as DeleteHookIncomingsOptions)).rejects.toThrow(
            '`confirmed` must be `true` when `all` is used',
        );
    });
});
