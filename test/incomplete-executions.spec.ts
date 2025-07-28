import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/incomplete-executions/list.json';
import * as getMock from './mocks/incomplete-executions/get.json';
import * as updateMock from './mocks/incomplete-executions/update.json';
import * as bundleMock from './mocks/incomplete-executions/bundle.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: IncompleteExecutions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list incomplete executions', async () => {
        mockFetch('GET https://make.local/api/v2/dlqs?scenarioId=1', listMock);

        const result = await make.incompleteExecutions.list(1);

        expect(result).toStrictEqual(listMock.dlqs);
    });

    it('Should get an incomplete execution', async () => {
        const id = 'a07e16f2ad134bf49cf83a00aa95c0a5';
        mockFetch(`GET https://make.local/api/v2/dlqs/${id}`, getMock);

        const result = await make.incompleteExecutions.get(id);

        expect(result).toStrictEqual(getMock.dlq);
    });

    it('Should update an incomplete execution', async () => {
        const id = 'a07e16f2ad134bf49cf83a00aa95c0a5';
        const body = {
            blueprint: '{}',
            failer: 1,
        };

        mockFetch(`PATCH https://make.local/api/v2/dlqs/${id}`, updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.incompleteExecutions.update(id, body);

        expect(result).toStrictEqual(updateMock.dlq);
    });

    it('Should retry an incomplete execution', async () => {
        const id = 'a07e16f2ad134bf49cf83a00aa95c0a5';
        mockFetch(`POST https://make.local/api/v2/dlqs/${id}/retry`, null);

        await make.incompleteExecutions.retry(id);
    });

    it('Should retry multiple incomplete executions', async () => {
        mockFetch('POST https://make.local/api/v2/dlqs/retry?scenarioId=1', null, req => {
            expect(req.body).toStrictEqual({
                ids: ['a07e16f2ad134bf49cf83a00aa95c0a5'],
            });
        });

        await make.incompleteExecutions.retryMultiple(1, {
            ids: ['a07e16f2ad134bf49cf83a00aa95c0a5'],
        });
    });

    it('Should get bundle information for an incomplete execution', async () => {
        const id = 'a07e16f2ad134bf49cf83a00aa95c0a5';
        mockFetch(`GET https://make.local/api/v2/dlqs/${id}/bundle`, bundleMock);

        const result = await make.incompleteExecutions.bundle(id);

        expect(result).toStrictEqual(bundleMock.response);
    });
});
