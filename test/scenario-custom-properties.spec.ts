import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as getMock from './mocks/scenario-custom-properties/get.json';
import * as createMock from './mocks/scenario-custom-properties/create.json';
import * as replaceMock from './mocks/scenario-custom-properties/replace.json';
import * as updateMock from './mocks/scenario-custom-properties/update.json';
import * as deleteMock from './mocks/scenario-custom-properties/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const SCENARIO_ID = 80;

describe('Endpoints: ScenarioCustomProperties', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should get scenario custom properties data', async () => {
        mockFetch('GET https://make.local/api/v2/scenarios/22/custom-properties', getMock);

        const result = await make.scenarios.customProperties.get(22);

        expect(result).toStrictEqual(getMock.customProperties);
    });

    it('Should fill in scenario custom properties data', async () => {
        const data = { companyTeam: 'marketing', customId: 60, category: ['eshop'], highPriority: false };

        mockFetch(`POST https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, createMock, req => {
            expect(req.body).toStrictEqual(data);
        });

        const result = await make.scenarios.customProperties.create(SCENARIO_ID, data);

        expect(result).toStrictEqual(createMock.customProperties);
    });

    it('Should replace scenario custom properties data', async () => {
        const data = { companyTeam: 'engineering', customId: 50, category: ['notifications', 'routing'] };

        mockFetch(`PUT https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, replaceMock, req => {
            expect(req.body).toStrictEqual(data);
        });

        const result = await make.scenarios.customProperties.replace(SCENARIO_ID, data);

        expect(result).toStrictEqual(replaceMock.customProperties);
    });

    it('Should update scenario custom properties data', async () => {
        const data = { customId: 48, location: 'Wien, AUS' };

        mockFetch(`PATCH https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties`, updateMock, req => {
            expect(req.body).toStrictEqual(data);
        });

        const result = await make.scenarios.customProperties.update(SCENARIO_ID, data);

        expect(result).toStrictEqual(updateMock.customProperties);
    });

    it('Should delete scenario custom properties data', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/scenarios/${SCENARIO_ID}/custom-properties?confirmed=true`,
            deleteMock,
        );

        await make.scenarios.customProperties.delete(SCENARIO_ID);
    });
});
