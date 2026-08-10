import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/custom-property-structures/list.json';
import * as createMock from './mocks/custom-property-structures/create.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 57;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: custom-property-structures', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute custom-property-structures_list', async () => {
        mockFetch(
            `GET https://make.local/api/v2/custom-property-structures?organizationId=${ORGANIZATION_ID}`,
            listMock,
        );

        const tool = getTool('custom-property-structures_list');
        const result = await tool.execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(listMock.customPropertyStructures);
    });

    it('Should execute custom-property-structures_create', async () => {
        mockFetch('POST https://make.local/api/v2/custom-property-structures', createMock, req => {
            expect(req.body).toStrictEqual({
                associatedType: 'scenario',
                belongerType: 'organization',
                belongerId: ORGANIZATION_ID,
            });
        });

        const tool = getTool('custom-property-structures_create');
        const result = await tool.execute(make, {
            associatedType: 'scenario',
            belongerType: 'organization',
            belongerId: ORGANIZATION_ID,
        });

        expect(result).toStrictEqual(createMock.customPropertyStructure);
    });
});
