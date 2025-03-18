import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as executionsListMock from './mocks/executions/list.json';
import * as executionsGetMock from './mocks/executions/get.json';

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

        it('Should get execution', async () => {
            mockFetch(
                'GET https://make.local/api/v2/scenarios/123456/logs/cc1c49323b344687a324888762206003',
                executionsGetMock,
            );

            const result = await make.executions.get(123456, 'cc1c49323b344687a324888762206003');
            expect(result).toStrictEqual(executionsGetMock.scenarioLogs);
        });

        it('Should list executions for incomplete execution', async () => {
            mockFetch('GET https://make.local/api/v2/dlqs/123456/logs', executionsListMock);

            const result = await make.executions.listForIncompleteExecution('123456');
            expect(result).toStrictEqual(executionsListMock.scenarioLogs);
        });

        it('Should get execution for incomplete execution', async () => {
            mockFetch(
                'GET https://make.local/api/v2/dlqs/123456/logs/cc1c49323b344687a324888762206003',
                executionsGetMock,
            );

            const result = await make.executions.getForIncompleteExecution(
                '123456',
                'cc1c49323b344687a324888762206003',
            );
            expect(result).toStrictEqual(executionsGetMock.scenarioLogs);
        });
    });
});
