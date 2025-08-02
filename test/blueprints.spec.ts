import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as blueprintMock from './mocks/blueprints/get.json';
import * as blueprintVersionsMock from './mocks/blueprints/versions.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Blueprints', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    describe('Blueprints', () => {
        it('Should get blueprint', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios/123456/blueprint', blueprintMock);

            const result = await make.blueprints.get(123456);
            expect(result).toStrictEqual({
                ...blueprintMock.response.blueprint,
                scheduling: blueprintMock.response.scheduling,
                interface: {
                    input: blueprintMock.response.metadata.input_spec,
                    output: blueprintMock.response.metadata.output_spec,
                },
            });
        });

        it('Should get blueprint versions', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios/789/blueprints', blueprintVersionsMock);

            const result = await make.blueprints.versions(789);
            expect(result).toStrictEqual(blueprintVersionsMock.scenariosBlueprints);
        });
    });
});
