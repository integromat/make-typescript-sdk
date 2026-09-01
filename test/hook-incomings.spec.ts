import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/hook-incomings/list.json';

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
});
