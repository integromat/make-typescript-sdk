import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import { FunctionV2ExecutionUncertainError } from '../src/endpoints/functions-v2.js';
import { MakeTools } from '../src/tools.js';

fetchMock.enableMocks();
const runId = '4b75e102-2c25-42de-8000-000000000001';
const content = {
    source: 'export default async function(input: unknown) { return input; }',
    inputSchema: {},
    outputSchema: {},
};
const version = {
    ...content,
    version: 2,
    connections: {},
    endpoints: [],
    retryPolicy: { maximumAttempts: 1 },
    createdAt: '2026-01-01T00:00:00Z',
};
const fn = { id: 42, teamId: 7, name: 'Echo', active: false, latestVersion: version };
const run = { id: runId, functionId: 42, origin: { type: 'version', version: 2 }, status: 'queued' };
const pg = { limit: 10, offset: 10, sortBy: 'id', sortDir: 'desc' as const };
let make: Make;
function respond(body: unknown, status = 200, headers = {}) {
    fetchMock.mockResponseOnce(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', ...headers },
    });
}
function request(index = 0) {
    const [url, options] = fetchMock.mock.calls[index]!;
    return {
        url: new URL(String(url)),
        method: options?.method ?? 'GET',
        headers: options?.headers,
        body: options?.body ? JSON.parse(String(options.body)) : undefined,
    };
}
beforeEach(() => {
    fetchMock.resetMocks();
    make = new Make('test-token', 'make.local', {
        retry: { onRateLimit: true, onServerError: true, maxRetries: 3, baseDelay: 1 },
    });
});

describe('Functions v2 HTTP contracts', () => {
    it('maps collection filters and preserves pagination', async () => {
        respond({ functions: [fn], pg });
        expect(
            await make.functionsV2.list(7, {
                ids: [42, 43],
                endpointAppNames: ['http'],
                search: 'Echo',
                pg: { ...pg, sortBy: 'id' },
            }),
        ).toEqual({ functions: [fn], pg });
        expect(Object.fromEntries(request().url.searchParams)).toMatchObject({
            teamId: '7',
            'endpointAppNames[]': 'http',
            search: 'Echo',
            'pg[limit]': '10',
            'pg[offset]': '10',
            'pg[sortBy]': 'id',
            'pg[sortDir]': 'desc',
        });
        expect(request().url.searchParams.getAll('ids[]')).toEqual(['42', '43']);
    });
    it('reads an ETag without consuming the response', async () => {
        respond({ function: fn }, 200, { ETag: '"opaque-1"' });
        expect(await make.functionsV2.get(42)).toEqual({ function: fn, etag: '"opaque-1"' });
        expect(request().url.pathname).toBe('/api/v2/functions/v2/42');
    });
    it('omits unavailable ETags', async () => {
        respond({ function: fn });
        expect(await make.functionsV2.get(42)).toEqual({ function: fn });
    });
    it('creates with team scope and initial content', async () => {
        respond({ function: fn }, 201, { ETag: '"new"' });
        expect(await make.functionsV2.create(7, { name: 'Echo', content })).toEqual({ function: fn, etag: '"new"' });
        expect(request()).toMatchObject({ method: 'POST', body: { name: 'Echo', content } });
        expect(request().url.searchParams.get('teamId')).toBe('7');
    });
    it.each(['update', 'activate', 'deactivate', 'delete'] as const)(
        'requires and forwards ETag for %s',
        async operation => {
            const invoke = (etag: string) =>
                operation === 'update'
                    ? make.functionsV2.update(42, { description: null }, etag)
                    : make.functionsV2[operation](42, etag);
            for (const etag of ['', ' ', '*']) await expect(invoke(etag)).rejects.toThrow('Supply the ETag');
            expect(fetchMock).not.toHaveBeenCalled();
            if (operation === 'delete') fetchMock.mockResponseOnce('', { status: 204 });
            else respond({ function: fn }, 200, { ETag: '"next"' });
            const result = await invoke('"current"');
            expect(request().headers).toMatchObject({ 'If-Match': '"current"' });
            expect(request().method).toBe(
                operation === 'update' ? 'PATCH' : operation === 'delete' ? 'DELETE' : 'POST',
            );
            expect(request().url.pathname).toBe(
                `/api/v2/functions/v2/42${['activate', 'deactivate'].includes(operation) ? `/${operation}` : ''}`,
            );
            expect(result).toEqual(operation === 'delete' ? undefined : { function: fn, etag: '"next"' });
        },
    );
    it('does not refresh or retry a stale write, preserving structured diagnostics', async () => {
        const error = {
            code: 'STALE_VERSION',
            message: 'Stale ETag',
            suberrors: [{ message: 'Read current representation', field: 'If-Match' }],
        };
        respond(error, 412);
        await expect(make.functionsV2.update(42, { name: 'Updated' }, '"old"')).rejects.toMatchObject({
            statusCode: 412,
            apiError: error,
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it('lists, reads and publishes exact version contracts', async () => {
        respond({ versions: [version], pg: { ...pg, sortBy: 'version' } });
        expect(
            await make.functionsV2.versions.list(42, { pg: { limit: 10, offset: 10, sortBy: 'version' } }),
        ).toHaveProperty('versions', [version]);
        expect(request().url.searchParams.get('pg[sortBy]')).toBe('version');
        respond({ functionVersion: version });
        expect(await make.functionsV2.versions.get(42, 2)).toEqual(version);
        expect(request(1).url.pathname).toBe('/api/v2/functions/v2/42/versions/2');
        respond({ functionVersion: version }, 201);
        expect(await make.functionsV2.versions.publish(42, { content, expectedLatestVersion: 1 })).toEqual(version);
        expect(request(2)).toMatchObject({ method: 'POST', body: { content, expectedLatestVersion: 1 } });
        expect(request(2).headers).not.toHaveProperty('If-Match');
    });
    it('lists filtered Runs and observes accepted cancellation without inventing completion', async () => {
        respond({ runs: [run], pg });
        const options = {
            version: 2,
            createdFrom: '2026-01-01T00:00:00Z',
            createdTo: '2026-01-02T00:00:00Z',
            pg: { limit: 10, offset: 10, sortBy: 'createdAt' as const },
        };
        expect(await make.functionsV2.runs.list(42, options)).toEqual({ runs: [run], pg });
        expect(request().url.searchParams.get('version')).toBe('2');
        expect(request().url.searchParams.get('createdFrom')).toBe(options.createdFrom);
        respond({ run: { ...run, status: 'terminating' } }, 202);
        expect(await make.functionsV2.runs.cancel(runId)).toHaveProperty('status', 'terminating');
        expect(request(1).url.pathname).toBe(`/api/v2/functions/v2/runs/${runId}/cancellation`);
    });
    it.each([null, false, 0, '', [], { nested: [null, false] }])('preserves explicit JSON output %p', async output => {
        const detail = { ...run, status: 'succeeded', output, attempts: [], endpointCalls: [] };
        respond({ run: detail });
        expect(await make.functionsV2.runs.get(runId)).toEqual(detail);
    });
    it('preserves catalog availability and declarations', async () => {
        const identity = { appName: 'http', appVersion: 3, endpointName: 'Request' };
        const catalog = {
            catalogStatus: 'unavailable',
            endpoints: [{ ...identity, typeStatus: 'catalog_unavailable' }],
        };
        respond(catalog);
        expect(await make.functionsV2.endpoints.list(7)).toEqual(catalog);
        expect(request().url.searchParams.get('teamId')).toBe('7');
        const types = {
            catalogStatus: 'ready',
            endpoints: ['available', 'definition_missing', 'not_authorized'].map(typeStatus => ({
                ...identity,
                typeStatus,
                available: typeStatus === 'available',
                ...(typeStatus === 'available'
                    ? { definition: { declarations: 'type Input = string', inputType: 'Input', outputType: 'string' } }
                    : {}),
            })),
        };
        respond(types);
        const body = { teamId: 7, functionId: 42, functionVersion: 2, endpoints: [identity] };
        expect(await make.functionsV2.endpoints.types(body)).toEqual(types);
        expect(request(1)).toMatchObject({ method: 'POST', body });
        expect(request(1).url.pathname).toBe('/api/v2/functions/v2/endpoint-catalog/types');
    });
    it('keeps structured diagnostics out of ordinary error serialization', async () => {
        respond({ message: 'Rejected', diagnostics: { source: 'customer source' } }, 400);
        const error = await make.functionsV2.get(42).catch((error: unknown) => error);
        expect(error).toMatchObject({ apiError: { diagnostics: { source: 'customer source' } } });
        expect(JSON.stringify(error)).not.toContain('customer source');
    });
    it('calls the success callback before decoding, only on successful responses', async () => {
        const callback = jest.fn((response: Response) => expect(response.bodyUsed).toBe(false));
        respond({ message: 'Busy' }, 503);
        respond({ value: false });
        expect(await make.fetch('/test', { onResponse: callback })).toEqual({ value: false });
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe('one-shot execution admission', () => {
    const submitters = {
        published: () => make.functionsV2.runs.create(42, { version: 2, data: null, responsive: false }),
        inline: () =>
            make.functionsV2.runs.createInline(7, { content, functionId: 42, data: false, responsive: false }),
    };
    describe.each(Object.entries(submitters))('%s', (_name, submit) => {
        it('returns the admitted Run immediately', async () => {
            respond({ run }, 202);
            expect(await submit()).toEqual(run);
            expect(request().body.responsive).toBe(false);
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
        it('reports a lost admission response without resubmitting', async () => {
            fetchMock.mockRejectOnce(new TypeError('Connection reset after admission'));
            await expect(submit()).rejects.toMatchObject({
                code: 'FUNCTION_EXECUTION_UNCERTAIN',
                sideEffectPossible: true,
                runId: undefined,
                message: expect.stringContaining('Do not retry'),
            });
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
        it.each([408, 500, 502, 503, 504])(
            'treats HTTP %s as uncertain even with global retries enabled',
            async status => {
                respond({ message: 'Unknown outcome' }, status);
                await expect(submit()).rejects.toBeInstanceOf(FunctionV2ExecutionUncertainError);
                expect(fetchMock).toHaveBeenCalledTimes(1);
            },
        );
        it.each([400, 401, 403, 404, 409, 422, 429])(
            'preserves confirmed HTTP %s rejection without retrying',
            async status => {
                respond({ code: 'REFUSED', message: 'Rejected' }, status);
                await expect(submit()).rejects.toMatchObject({ name: 'MakeError', statusCode: status });
                expect(fetchMock).toHaveBeenCalledTimes(1);
            },
        );
        it('retains a Location Run ID when the admitted response is unreadable, then retrieves it', async () => {
            fetchMock.mockResponseOnce('{broken', {
                status: 202,
                headers: { 'content-type': 'application/json', Location: `/api/v2/functions/v2/runs/${runId}` },
            });
            await expect(submit()).rejects.toMatchObject({ runId, sideEffectPossible: true });
            respond({ run: { ...run, status: 'succeeded', output: 0 } });
            expect(await make.functionsV2.runs.get(runId)).toHaveProperty('output', 0);
            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(request(1).method).toBe('GET');
        });
        it.each([{ run: { id: runId } }, { run: { id: runId, status: 'unknown' } }])(
            'retains a known body Run ID in a malformed response',
            async body => {
                respond(body, 202);
                await expect(submit()).rejects.toMatchObject({ runId, code: 'FUNCTION_EXECUTION_UNCERTAIN' });
            },
        );
        it('never invents a Run ID from an invalid response', async () => {
            respond({ run: { id: 'invalid', status: 'queued' } }, 202);
            await expect(submit()).rejects.toMatchObject({ runId: undefined, sideEffectPossible: true });
        });
    });
    it('retains responsive SDK execution options', async () => {
        respond({ run: { ...run, status: 'succeeded', output: false } });
        expect(await make.functionsV2.runs.create(42, { responsive: true, maxWaitSeconds: 5 })).toHaveProperty(
            'output',
            false,
        );
        expect(request().body).toEqual({ responsive: true, maxWaitSeconds: 5 });
    });
    it.each([
        ['create', () => make.functionsV2.create(7, { name: 'Echo', content })],
        ['update', () => make.functionsV2.update(42, { name: 'Echo' }, '"etag"')],
        ['delete', () => make.functionsV2.delete(42, '"etag"')],
        ['activate', () => make.functionsV2.activate(42, '"etag"')],
        ['deactivate', () => make.functionsV2.deactivate(42, '"etag"')],
        ['publish', () => make.functionsV2.versions.publish(42, { content, expectedLatestVersion: 1 })],
        ['cancel', () => make.functionsV2.runs.cancel(runId)],
    ] as Array<[string, () => Promise<unknown>]>)('%s never retries mutations', async (_name, invoke) => {
        respond({ message: 'Unavailable' }, 503);
        await expect(invoke()).rejects.toBeInstanceOf(MakeError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe('Functions v2 tool bindings', () => {
    const tools = MakeTools.filter(tool => tool.name.startsWith('functions_v2_'));
    it('registers all 17 unique tools alongside legacy Functions', () => {
        expect(tools).toHaveLength(17);
        expect(new Set(tools.map(tool => tool.name)).size).toBe(17);
        expect(MakeTools.some(tool => tool.name === 'functions_list')).toBe(true);
        expect(make.functions).toBeDefined();
    });
    it.each(['functions_v2_runs_create', 'functions_v2_runs_create_inline'])(
        '%s forces asynchronous admission even with injected wait options',
        async name => {
            const tool = tools.find(tool => tool.name === name)!;
            respond({ run }, 202);
            expect(
                await tool.execute(make, {
                    teamId: 7,
                    functionId: 42,
                    content,
                    data: null,
                    version: 2,
                    responsive: true,
                    maxWaitSeconds: 60,
                }),
            ).toEqual(run);
            expect(request().body).toMatchObject({ responsive: false, data: null });
            expect(request().body).not.toHaveProperty('maxWaitSeconds');
            expect(tool.annotations).toMatchObject({ idempotentHint: false, openWorldHint: true });
        },
    );
    it('marks publishing as non-idempotent and both catalog tools as reads', () => {
        expect(tools.find(tool => tool.name === 'functions_v2_versions_publish')?.annotations?.idempotentHint).toBe(
            false,
        );
        for (const tool of tools.filter(tool => tool.name.startsWith('functions_v2_endpoints_')))
            expect(tool.scope).toBe('functions:read');
    });
});
