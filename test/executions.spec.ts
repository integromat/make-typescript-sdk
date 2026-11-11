import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import type { SearchIoDataOptions } from '../src/endpoints/executions.js';
import { mockFetch } from './test.utils.js';

import * as executionsListMock from './mocks/executions/list.json';
import * as executionsDlqListMock from './mocks/executions/dlq-list.json';
import * as executionsGetMock from './mocks/executions/get.json';
import * as executionsDlqGetMock from './mocks/executions/dlq-get.json';
import * as executionsGetDetailMock from './mocks/executions/get-detail.json';
import * as executionsSearchIoDataMock from './mocks/executions/search-io-data.json';
import * as executionsSearchMock from './mocks/executions/search.json';
import * as executionsIoDataCountsMock from './mocks/executions/io-data-counts.json';
import * as executionsSearchIoDataInExecutionMock from './mocks/executions/search-io-data-in-execution.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Executions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    describe('Executions', () => {
        it('Should list executions', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios/123456/logs', executionsListMock);

            const result = await make.executions.list(123456);
            expect(result).toStrictEqual(executionsListMock.scenarioLogs);
        });

        it('Should list executions with status and time range filters', async () => {
            mockFetch(
                'GET https://make.local/api/v2/scenarios/123456/logs?pg%5Blimit%5D=20&status=3&from=1704067200000&to=1704153600000',
                executionsListMock,
            );

            const result = await make.executions.list(123456, {
                pg: { limit: 20 },
                status: 3,
                from: 1704067200000,
                to: 1704153600000,
            });
            expect(result).toStrictEqual(executionsListMock.scenarioLogs);
        });

        it('Should search IO data across an organization', async () => {
            const body: SearchIoDataOptions = {
                query: '"order_id":"12345"',
                teamId: 27,
                status: [3],
                pageSize: 5,
                pageIndex: 1,
            };
            mockFetch(
                'POST https://make.local/api/v2/organizations/11/scenarios/executions/io-data/search',
                executionsSearchIoDataMock,
                req => {
                    expect(req.body).toStrictEqual(body);
                    expect(req.headers.get('content-type')).toBe('application/json');
                },
            );

            const result = await make.executions.searchIoData(11, body);
            expect(result).toStrictEqual(executionsSearchIoDataMock.results);
        });

        it('Should search executions across an organization', async () => {
            const body = { teamId: 27, errorMessage: 'timeout', status: [3 as const], pageSize: 5, pageIndex: 1 };
            mockFetch(
                'POST https://make.local/api/v2/organizations/11/scenarios/executions/search',
                executionsSearchMock,
                req => {
                    expect(req.body).toStrictEqual(body);
                },
            );

            const result = await make.executions.search(11, body);
            expect(result).toStrictEqual(executionsSearchMock.results);
        });

        it('Should search executions across an organization without filters', async () => {
            mockFetch(
                'POST https://make.local/api/v2/organizations/11/scenarios/executions/search',
                executionsSearchMock,
                req => {
                    expect(req.body).toStrictEqual({});
                },
            );

            const result = await make.executions.search(11);
            expect(result).toStrictEqual(executionsSearchMock.results);
        });

        it('Should count IO-data matches across an organization', async () => {
            const body = { query: '"order_id":"12345"', teamId: 27, scenarioIds: [1229], status: [1 as const] };
            mockFetch(
                'POST https://make.local/api/v2/organizations/11/scenarios/executions/io-data/counts',
                executionsIoDataCountsMock,
                req => {
                    expect(req.body).toStrictEqual(body);
                },
            );

            const result = await make.executions.countIoDataMatches(11, body);
            expect(result).toStrictEqual(executionsIoDataCountsMock);
        });

        it('Should search IO data within a single execution', async () => {
            const body = { query: '"order_id":"12345"', appNames: ['http'], moduleNames: ['ActionSendData'] };
            mockFetch(
                'POST https://make.local/api/v2/organizations/11/scenarios/1229/executions/da518adcd14b4b64ac6358823ccb80ca/io-data/search',
                executionsSearchIoDataInExecutionMock,
                req => {
                    expect(req.body).toStrictEqual(body);
                },
            );

            const result = await make.executions.searchIoDataInExecution(
                11,
                1229,
                'da518adcd14b4b64ac6358823ccb80ca',
                body,
            );
            expect(result).toStrictEqual(executionsSearchIoDataInExecutionMock);
        });

        it('Should get execution', async () => {
            mockFetch(
                'GET https://make.local/api/v2/scenarios/123456/logs/cc1c49323b344687a324888762206003',
                executionsGetMock,
            );

            const result = await make.executions.get(123456, 'cc1c49323b344687a324888762206003');
            expect(result).toStrictEqual(executionsGetMock.scenarioLog);
        });

        it('Should get execution detail', async () => {
            mockFetch(
                'GET https://make.local/api/v2/scenarios/123456/executions/cc1c49323b344687a324888762206003',
                executionsGetDetailMock,
            );

            const result = await make.executions.getDetail(123456, 'cc1c49323b344687a324888762206003');
            expect(result).toStrictEqual(executionsGetDetailMock);
        });

        it('Should get execution detail with maxBytes', async () => {
            mockFetch(
                'GET https://make.local/api/v2/scenarios/123456/executions/cc1c49323b344687a324888762206003?maxBytes=512000',
                executionsGetDetailMock,
            );

            const result = await make.executions.getDetail(123456, 'cc1c49323b344687a324888762206003', {
                maxBytes: 512000,
            });
            expect(result).toStrictEqual(executionsGetDetailMock);
        });

        it('Should list executions for incomplete execution', async () => {
            mockFetch('GET https://make.local/api/v2/dlqs/123456/logs', executionsDlqListMock);

            const result = await make.executions.listForIncompleteExecution('123456');
            expect(result).toStrictEqual(executionsDlqListMock.dlqLogs);
        });

        it('Should list executions for incomplete execution with filters', async () => {
            mockFetch(
                'GET https://make.local/api/v2/dlqs/123456/logs?pg%5Blimit%5D=20&status=3&from=1704067200000&to=1704153600000',
                executionsDlqListMock,
            );

            const result = await make.executions.listForIncompleteExecution('123456', {
                pg: { limit: 20 },
                status: 3,
                from: 1704067200000,
                to: 1704153600000,
            });
            expect(result).toStrictEqual(executionsDlqListMock.dlqLogs);
        });

        it('Should get execution for incomplete execution', async () => {
            mockFetch(
                'GET https://make.local/api/v2/dlqs/123456/logs/cc1c49323b344687a324888762206003',
                executionsDlqGetMock,
            );

            const result = await make.executions.getForIncompleteExecution(
                '123456',
                'cc1c49323b344687a324888762206003',
            );
            expect(result).toStrictEqual(executionsDlqGetMock.dlqLog);
        });
    });
});
