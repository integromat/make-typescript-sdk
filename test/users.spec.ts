import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as meMock from './mocks/users/me.json';
import * as currentAuthorizationMock from './mocks/users/current-authorization.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Users', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should receive current user', async () => {
        mockFetch('GET https://make.local/api/v2/users/me', meMock);

        const result = await make.users.me();
        expect(result).toStrictEqual(meMock.authUser);
    });

    it('Should receive current authorization', async () => {
        mockFetch('GET https://make.local/api/v2/users/me/current-authorization', currentAuthorizationMock);

        const result = await make.users.currentAuthorization();
        expect(result).toStrictEqual(currentAuthorizationMock.authorization);
    });
});
