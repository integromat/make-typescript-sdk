import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/scenario-labels/list.json';
import * as createMock from './mocks/scenario-labels/create.json';
import * as updateMock from './mocks/scenario-labels/update.json';
import * as deleteMock from './mocks/scenario-labels/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 5;
const LABEL_ID = 3;

describe('Endpoints: ScenarioLabels', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list scenario labels for a team', async () => {
        mockFetch(`GET https://make.local/api/v2/scenario-labels?teamId=${TEAM_ID}`, listMock);

        const result = await make.scenarioLabels.list(TEAM_ID);
        expect(result).toStrictEqual(listMock.labels);
    });

    it('Should create a scenario label', async () => {
        const body = { teamId: TEAM_ID, name: 'critical', colour: 'danger' as const };
        mockFetch('POST https://make.local/api/v2/scenario-labels', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.scenarioLabels.create(body);
        expect(result).toStrictEqual(createMock.label);
    });

    it('Should update a scenario label', async () => {
        const body = { name: 'high-priority', colour: 'warning' as const };
        mockFetch(`PATCH https://make.local/api/v2/scenario-labels/${LABEL_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.scenarioLabels.update(LABEL_ID, body);
        expect(result).toStrictEqual(updateMock.label);
    });

    it('Should clear a scenario label description with null', async () => {
        mockFetch(`PATCH https://make.local/api/v2/scenario-labels/${LABEL_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual({ description: null });
        });

        const result = await make.scenarioLabels.update(LABEL_ID, { description: null });
        expect(result).toStrictEqual(updateMock.label);
    });

    it('Should delete a scenario label', async () => {
        mockFetch(`DELETE https://make.local/api/v2/scenario-labels/${LABEL_ID}`, deleteMock);

        await make.scenarioLabels.delete(LABEL_ID);
    });
});
