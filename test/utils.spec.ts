import { describe, expect, it } from '@jest/globals';
import { buildUrl, createMakeError } from '../src/utils.js';

describe('Utils', () => {
    describe('buildUrl', () => {
        it('Should build URL without parameters', () => {
            expect(buildUrl('https://example.com')).toBe('https://example.com');
        });

        it('Should build URL with simple parameters', () => {
            expect(buildUrl('https://example.com', { name: 'John', age: 30 })).toBe(
                'https://example.com?name=John&age=30',
            );
        });

        it('Should build URL with array parameters', () => {
            expect(buildUrl('https://example.com', { tags: ['a', 'b', 'c'] })).toBe(
                'https://example.com?tags%5B%5D=a&tags%5B%5D=b&tags%5B%5D=c',
            );
        });

        it('Should build URL with nested parameters', () => {
            expect(
                buildUrl('https://example.com', {
                    pg: {
                        limit: 10,
                        offset: 0,
                    },
                }),
            ).toBe('https://example.com?pg%5Blimit%5D=10&pg%5Boffset%5D=0');
        });

        it('Should handle URL with existing query string', () => {
            expect(buildUrl('https://example.com?existing=1', { name: 'John' })).toBe(
                'https://example.com?existing=1&name=John',
            );
        });

        it('Should skip undefined values', () => {
            expect(
                buildUrl('https://example.com', {
                    name: 'John',
                    age: undefined,
                    city: undefined,
                }),
            ).toBe('https://example.com?name=John');
        });
    });

    describe('createMakeError', () => {
        it('Should create error with message from response', async () => {
            const res = new Response(JSON.stringify({ message: 'Not found' }), {
                status: 404,
                statusText: 'Not Found',
            });

            const error = await createMakeError(res);
            expect(error.message).toBe('Not found');
            expect(error.statusCode).toBe(404);
            expect(error.name).toBe('MakeError');
        });

        it('Should create error with detail from response', async () => {
            const res = new Response(
                JSON.stringify({
                    message: 'Error',
                    detail: 'Detailed error message',
                }),
                {
                    status: 400,
                    statusText: 'Bad Request',
                },
            );

            const error = await createMakeError(res);
            expect(error.message).toBe('Detailed error message');
            expect(error.statusCode).toBe(400);
            expect(error.toString()).toBe('MakeError: Detailed error message');
        });

        it('Should create error with sub-errors', async () => {
            const res = new Response(
                JSON.stringify({
                    message: 'Validation failed',
                    suberrors: [{ message: 'Name is required' }, { message: 'Email is invalid' }],
                }),
                {
                    status: 422,
                    statusText: 'Unprocessable Entity',
                },
            );

            const error = await createMakeError(res);
            expect(error.message).toBe('Validation failed\n - Name is required\n - Email is invalid');
            expect(error.statusCode).toBe(422);
        });

        it('Should handle non-JSON response', async () => {
            const res = new Response('Plain text error', {
                status: 500,
                statusText: 'Internal Server Error',
            });

            const error = await createMakeError(res);
            expect(error.message).toBe('Internal Server Error');
            expect(error.statusCode).toBe(500);
        });

        it('Should handle invalid JSON response', async () => {
            const res = new Response('Invalid JSON', {
                status: 500,
                statusText: 'Internal Server Error',
            });

            const error = await createMakeError(res);
            expect(error.message).toBe('Internal Server Error');
            expect(error.statusCode).toBe(500);
        });
    });
});
