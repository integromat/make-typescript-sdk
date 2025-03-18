import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Make SDK', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should initialize SDK', async () => {
        expect(make).toBeDefined();
    });

    it('Should throw error when status code is 400', async () => {
        mockFetch(
            'GET https://make.local/api/v2/users/me',
            {
                message: 'Bad Request',
            },
            400,
        );

        await expect(make.users.me()).rejects.toThrow('Bad Request');
    });
});
