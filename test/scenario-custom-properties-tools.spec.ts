import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as getMock from './mocks/scenario-custom-properties/get.json';
import * as createMock from './mocks/scenario-custom-properties/create.json';
import * as replaceMock from './mocks/scenario-custom-properties/replace.json';
import * as updateMock from './mocks/scenario-custom-properties/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const SCENARIO_ID = 80;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: scenario-custom-properties', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute scenario-custom-properties_get', async () => {
        mockFetch('GET https://make.local/api/v2/scenarios/22/custom-properties', getMock);

        const tool = getTool('scenario-custom-properties_get');
        const result = await tool.execute(make, { scenarioId: 22 });

        expect(result).toStrictEqual(getMock.customProperties);
    });

    it('Should execute scenario-custom-properties_create', async () => {
        const customProperties = { companyTeam: 'marketing', customId: 60 };

        mockFetch(`POST https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, createMock, req => {
            expect(req.body).toStrictEqual(customProperties);
        });

        const tool = getTool('scenario-custom-properties_create');
        const result = await tool.execute(make, { scenarioId: SCENARIO_ID, customProperties });

        expect(result).toStrictEqual(createMock.customProperties);
    });

    it('Should execute scenario-custom-properties_replace', async () => {
        const customProperties = { companyTeam: 'engineering', customId: 50 };

        mockFetch(`PUT https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, replaceMock, req => {
            expect(req.body).toStrictEqual(customProperties);
        });

        const tool = getTool('scenario-custom-properties_replace');
        const result = await tool.execute(make, { scenarioId: SCENARIO_ID, customProperties });

        expect(result).toStrictEqual(replaceMock.customProperties);
    });

    it('Should execute scenario-custom-properties_update', async () => {
        const customProperties = { location: 'Wien, AUS' };

        mockFetch(`PATCH https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, updateMock, req => {
            expect(req.body).toStrictEqual(customProperties);
        });

        const tool = getTool('scenario-custom-properties_update');
        const result = await tool.execute(make, { scenarioId: SCENARIO_ID, customProperties });

        expect(result).toStrictEqual(updateMock.customProperties);
    });

    it('Should execute scenario-custom-properties_delete', async () => {
        mockFetch(`DELETE https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, { ok: 1 });

        const tool = getTool('scenario-custom-properties_delete');
        const result = await tool.execute(make, { scenarioId: SCENARIO_ID });

        expect(result).toBe('Scenario custom properties data has been deleted.');
    });
});
