import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as executionsListMock from './mocks/executions/list.json';
import * as executionsDlqListMock from './mocks/executions/dlq-list.json';
import * as executionsSearchIoDataMock from './mocks/executions/search-io-data.json';
import * as executionsSearchMock from './mocks/executions/search.json';
import * as executionsIoDataCountsMock from './mocks/executions/io-data-counts.json';
import * as executionsSearchIoDataInExecutionMock from './mocks/executions/search-io-data-in-execution.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: executions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute executions_list with filters', async () => {
        mockFetch(
            'GET https://make.local/api/v2/scenarios/123456/logs?status=3&from=1704067200000&to=1704153600000',
            executionsListMock,
        );

        const tool = getTool('executions_list');
        const result = await tool.execute(make, {
            scenarioId: 123456,
            status: 3,
            from: 1704067200000,
            to: 1704153600000,
        });

        expect(result).toStrictEqual(executionsListMock.scenarioLogs);
    });

    it('Should execute executions_list-for-incomp-exec with a limit', async () => {
        mockFetch('GET https://make.local/api/v2/dlqs/123456/logs?pg%5Blimit%5D=10', executionsDlqListMock);

        const tool = getTool('executions_list-for-incomp-exec');
        const result = await tool.execute(make, { incompleteExecutionId: '123456', limit: 10 });

        expect(result).toStrictEqual(executionsDlqListMock.dlqLogs);
    });

    it('Should execute executions_search-io-data with a small default page size', async () => {
        mockFetch(
            'POST https://make.local/api/v2/organizations/11/scenarios/executions/io-data/search',
            executionsSearchIoDataMock,
            req => {
                expect(req.body).toStrictEqual({ query: 'timeout', status: [3], pageSize: 10 });
            },
        );

        const tool = getTool('executions_search-io-data');
        const result = await tool.execute(make, { organizationId: 11, query: 'timeout', status: [3] });

        expect(result).toStrictEqual(executionsSearchIoDataMock.results);
    });

    it('Should keep an explicit page size for executions_search-io-data', async () => {
        mockFetch(
            'POST https://make.local/api/v2/organizations/11/scenarios/executions/io-data/search',
            executionsSearchIoDataMock,
            req => {
                expect(req.body).toStrictEqual({ query: 'timeout', pageSize: 50 });
            },
        );

        const tool = getTool('executions_search-io-data');
        await tool.execute(make, { organizationId: 11, query: 'timeout', pageSize: 50 });
    });

    it('Should declare executions_search-io-data as a read-only, organization-scoped tool', () => {
        const tool = getTool('executions_search-io-data');

        expect(tool.scope).toBe('organizations:read');
        expect(tool.scopeId).toBe('organizationId');
        expect(tool.annotations?.readOnlyHint).toBe(true);
        expect(tool.inputSchema.required).toStrictEqual(['organizationId', 'query']);
    });

    it('Should execute executions_search with a small default page size', async () => {
        mockFetch(
            'POST https://make.local/api/v2/organizations/11/scenarios/executions/search',
            executionsSearchMock,
            req => {
                expect(req.body).toStrictEqual({ status: [3], errorMessage: 'timeout', pageSize: 20 });
            },
        );

        const tool = getTool('executions_search');
        const result = await tool.execute(make, { organizationId: 11, status: [3], errorMessage: 'timeout' });

        expect(result).toStrictEqual(executionsSearchMock.results);
    });

    it('Should keep an explicit page size for executions_search', async () => {
        mockFetch(
            'POST https://make.local/api/v2/organizations/11/scenarios/executions/search',
            executionsSearchMock,
            req => {
                expect(req.body).toStrictEqual({ pageSize: 50, pageIndex: 2 });
            },
        );

        const tool = getTool('executions_search');
        await tool.execute(make, { organizationId: 11, pageSize: 50, pageIndex: 2 });
    });

    it('Should execute executions_count-io-data-matches', async () => {
        mockFetch(
            'POST https://make.local/api/v2/organizations/11/scenarios/executions/io-data/counts',
            executionsIoDataCountsMock,
            req => {
                expect(req.body).toStrictEqual({ query: 'timeout', teamId: 27 });
            },
        );

        const tool = getTool('executions_count-io-data-matches');
        const result = await tool.execute(make, { organizationId: 11, query: 'timeout', teamId: 27 });

        expect(result).toStrictEqual(executionsIoDataCountsMock);
    });

    it('Should execute executions_search-io-data-in-execution', async () => {
        mockFetch(
            'POST https://make.local/api/v2/organizations/11/scenarios/1229/executions/da518adcd14b4b64ac6358823ccb80ca/io-data/search',
            executionsSearchIoDataInExecutionMock,
            req => {
                expect(req.body).toStrictEqual({ query: 'timeout', status: [3] });
            },
        );

        const tool = getTool('executions_search-io-data-in-execution');
        const result = await tool.execute(make, {
            organizationId: 11,
            scenarioId: 1229,
            executionId: 'da518adcd14b4b64ac6358823ccb80ca',
            query: 'timeout',
            status: [3],
        });

        expect(result).toStrictEqual(executionsSearchIoDataInExecutionMock);
    });

    it.each([
        ['executions_search', ['organizationId']],
        ['executions_count-io-data-matches', ['organizationId', 'query']],
        ['executions_search-io-data-in-execution', ['organizationId', 'scenarioId', 'executionId', 'query']],
    ])('Should declare %s as a read-only, organization-scoped tool', (name, required) => {
        const tool = getTool(name);

        expect(tool.scope).toBe('organizations:read');
        expect(tool.scopeId).toBe('organizationId');
        expect(tool.annotations?.readOnlyHint).toBe(true);
        expect(tool.inputSchema.required).toStrictEqual(required);
    });
});
