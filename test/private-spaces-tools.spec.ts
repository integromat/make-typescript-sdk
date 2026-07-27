import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as privateSpacesListMock from './mocks/private-spaces/list.json';
import * as privateSpaceGetMock from './mocks/private-spaces/get.json';
import * as privateSpaceUpdateMock from './mocks/private-spaces/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const PRIVATE_SPACE_ID = 101;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: private-spaces', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute private-spaces_list', async () => {
        mockFetch(
            `GET https://make.local/api/v2/private-spaces?organizationId=${ORGANIZATION_ID}&cols%5B%5D=*`,
            privateSpacesListMock,
        );

        const tool = getTool('private-spaces_list');
        const result = await tool.execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should execute private-spaces_get', async () => {
        mockFetch(`GET https://make.local/api/v2/private-spaces/${PRIVATE_SPACE_ID}?cols%5B%5D=*`, privateSpaceGetMock);

        const tool = getTool('private-spaces_get');
        const result = await tool.execute(make, { privateSpaceId: PRIVATE_SPACE_ID });

        expect(result).toStrictEqual(privateSpaceGetMock.privateSpace);
    });

    it('Should execute private-spaces_update', async () => {
        mockFetch(
            `PATCH https://make.local/api/v2/private-spaces/${PRIVATE_SPACE_ID}?confirmed=true`,
            privateSpaceUpdateMock,
            req => {
                expect(req.body).toStrictEqual({ operationsLimit: 100 });
            },
        );

        const tool = getTool('private-spaces_update');
        const result = await tool.execute(make, {
            privateSpaceId: PRIVATE_SPACE_ID,
            operationsLimit: 100,
            confirmed: true,
        });

        expect(result).toStrictEqual(privateSpaceUpdateMock.privateSpace);
    });
});
