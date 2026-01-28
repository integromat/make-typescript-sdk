import { describe, expect, it, beforeEach } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('Make SDK Retry Logic', () => {
    const MAKE_API_KEY = 'test-api-key';
    const MAKE_ZONE = 'make.local';

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('Should retry on 429 Rate Limit and succeed', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10, // Fast retries for testing
                maxRetries: 3,
            },
        });

        // First call fails with 429, second succeeds
        fetchMock.mockResponses(
            [
                JSON.stringify({ message: 'Rate limit exceeded' }),
                { status: 429, headers: { 'content-type': 'application/json' } }
            ],
            [
                JSON.stringify({ authUser: { id: 1 } }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            ]
        );

        const result = await make.users.me();
        expect(result).toEqual({ id: 1 });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('Should throw error after max retries exhausted', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxRetries: 2,
            },
        });

        // All calls fail with 429
        fetchMock.mockResponse(JSON.stringify({ message: 'Rate limit exceeded' }), { 
            status: 429, 
            headers: { 'content-type': 'application/json' } 
        });

        await expect(make.users.me()).rejects.toThrow(MakeError);
        // Initial call + 2 retries = 3 calls total
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('Should respect Retry-After header', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxRetries: 3,
            },
        });

        // Mock response with Retry-After header
        fetchMock.mockResponses(
            [
                JSON.stringify({ message: 'Rate limit exceeded' }),
                { status: 429, headers: { 'Retry-After': '1', 'content-type': 'application/json' } } // 1 second
            ],
            [
                JSON.stringify({ authUser: { id: 1 } }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            ]
        );

        const startTime = Date.now();
        await make.users.me();
        const duration = Date.now() - startTime;

        // Should wait at least ~1000ms (we allow some buffer for execution time)
        // Using 900ms to account for slight timing variations
        expect(duration).toBeGreaterThan(900);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('Should cap delay at maxDelay', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxDelay: 100, // Cap delay at 100ms
                maxRetries: 3,
            },
        });

        // Mock response with huge Retry-After header (10 seconds)
        fetchMock.mockResponses(
            [
                JSON.stringify({ message: 'Rate limit exceeded' }),
                { status: 429, headers: { 'Retry-After': '10', 'content-type': 'application/json' } }
            ],
            [
                JSON.stringify({ authUser: { id: 1 } }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            ]
        );

        const startTime = Date.now();
        await make.users.me();
        const duration = Date.now() - startTime;

        // Should NOT wait 10 seconds, but around 100ms
        expect(duration).toBeLessThan(500); // 500ms buffer is plenty for a 100ms delay
        expect(duration).toBeGreaterThan(80); // Should be at least close to 100ms
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('Should handle mixed errors (e.g. 500 then 429)', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxRetries: 3,
                retryOnServerError: true,
            },
        });

        // 500 -> 429 -> 200
        fetchMock.mockResponses(
            [
                JSON.stringify({ message: 'Internal Server Error' }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            ],
            [
                JSON.stringify({ message: 'Rate limit exceeded' }),
                { status: 429, headers: { 'content-type': 'application/json' } }
            ],
            [
                JSON.stringify({ authUser: { id: 1 } }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            ]
        );

        const result = await make.users.me();
        expect(result).toEqual({ id: 1 });
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('Should retry on server errors (5xx) if enabled', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxRetries: 3,
                retryOnServerError: true,
            },
        });

        // 500 error then success
        fetchMock.mockResponses(
            [
                JSON.stringify({ message: 'Internal Server Error' }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            ],
            [
                JSON.stringify({ authUser: { id: 1 } }),
                { status: 200, headers: { 'content-type': 'application/json' } }
            ]
        );

        const result = await make.users.me();
        expect(result).toEqual({ id: 1 });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('Should NOT retry on server errors (5xx) if disabled', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxRetries: 3,
                retryOnServerError: false, // Default
            },
        });

        fetchMock.mockResponse(JSON.stringify({ message: 'Internal Server Error' }), { 
            status: 500,
            headers: { 'content-type': 'application/json' }
        });

        await expect(make.users.me()).rejects.toThrow(MakeError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('Should NOT retry on 4xx errors (except 429)', async () => {
        const make = new Make(MAKE_API_KEY, MAKE_ZONE, {
            retryOptions: {
                baseDelay: 10,
                maxRetries: 3,
            },
        });

        // 400 Bad Request
        fetchMock.mockResponse(JSON.stringify({ message: 'Bad Request' }), { 
            status: 400,
            headers: { 'content-type': 'application/json' }
        });

        await expect(make.users.me()).rejects.toThrow(MakeError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
