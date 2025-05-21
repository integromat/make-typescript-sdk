import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';
import { randomUUID } from 'node:crypto';

const MAKE_API_KEY = randomUUID();
const MAKE_ZONE = 'make.local';

describe('Make SDK', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should initialize SDK', async () => {
        expect(make).toBeDefined();
    });

    it('Should send correct authorization header', async () => {
        mockFetch('GET https://make.local/api/v2/users/me', { authUser: null }, req => {
            expect(req.headers.get('authorization')).toBe(`Token ${MAKE_API_KEY}`);
        });

        expect(await make.users.me()).toBe(null);
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

    it('Should allow overriding user-agent header', async () => {
        const makeWithCustomHeaders = new Make(MAKE_API_KEY, MAKE_ZONE, {
            headers: { 'user-agent': 'CustomUserAgent' },
        });
        mockFetch('GET https://make.local/api/v2/users/me', { authUser: null }, req => {
            expect(req.headers.get('user-agent')).toBe('CustomUserAgent');
        });

        expect(await makeWithCustomHeaders.users.me()).toBe(null);
    });

    it('Should allow passing custom headers to all requests', async () => {
        const makeWithCustomHeaders = new Make(MAKE_API_KEY, MAKE_ZONE, { headers: { 'x-custom-header': 'FooBar' } });
        mockFetch('GET https://make.local/api/v2/users/me', { authUser: null }, req => {
            expect(req.headers.get('x-custom-header')).toBe('FooBar');
        });

        expect(await makeWithCustomHeaders.users.me()).toBe(null);
    });

    it('Should allow passing custom headers per request', async () => {
        const makeWithCustomHeaders = new Make(MAKE_API_KEY, MAKE_ZONE, { headers: { 'x-custom-header': 'FooBar' } });
        mockFetch('GET https://make.local/api/v2/users/me', { authUser: null }, req => {
            expect(req.headers.get('x-custom-header')).toBe('FooBar');
            expect(req.headers.get('x-custom-header-2')).toBe('CustomValue');
        });

        await makeWithCustomHeaders.fetch('/users/me', { headers: { 'x-custom-header-2': 'CustomValue' } });
    });

    it('Should allow overriding internals', async () => {
        class CustomMake extends Make {
            protected override prepareHeaders(headers?: Record<string, string>): Record<string, string> {
                return {
                    ...super.prepareHeaders(headers),
                    'x-custom-header': 'test',
                };
            }
            protected override prepareURL(url: string): string {
                return url;
            }
            protected override async handleRequest(url: string, options?: RequestInit): Promise<Response> {
                expect(url).toBe('/users/me');
                expect(options?.headers).toStrictEqual({
                    authorization: `Token ${MAKE_API_KEY}`,
                    'user-agent': 'MakeTypeScriptSDK/development',
                    'x-custom-header': 'test',
                });
                return new Response('{"authUser": {"id": 1}}', {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                });
            }
            protected override async handleResponse<T>(res: Response): Promise<T> {
                expect(res.status).toBe(200);
                expect(await res.clone().text()).toBe('{"authUser": {"id": 1}}');
                return (await res.json()) as T;
            }
        }

        const customMake = new CustomMake(MAKE_API_KEY, MAKE_ZONE);
        expect(await customMake.users.me()).toStrictEqual({ id: 1 });
    });
});
