import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/scenario-labels/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 5;

describe('Endpoints: ScenarioLabels', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list scenario labels for a team', async () => {
        mockFetch(`GET https://make.local/api/v2/scenario-labels?teamId=${TEAM_ID}`, listMock);

        const result = await make.scenarioLabels.list(TEAM_ID);
        expect(result).toStrictEqual(listMock.labels);
    });
});
