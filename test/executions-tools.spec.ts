import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as executionsListMock from './mocks/executions/list.json';
import * as executionsDlqListMock from './mocks/executions/dlq-list.json';
import * as executionsSearchIoDataMock from './mocks/executions/search-io-data.json';

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
});
