import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/locked-entities/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: LockedEntities', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list the locked entities of a team', async () => {
        mockFetch('GET https://make.local/api/v2/teams/22/locked-entities', listMock);

        const result = await make.lockedEntities.list(22);
        expect(result).toStrictEqual(listMock.lockedEntities);
    });
});
