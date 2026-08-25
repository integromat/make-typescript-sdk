import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as scenariosMock from './mocks/scenarios/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 18;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: scenarios', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute scenarios_list without filters (unchanged default request)', async () => {
        mockFetch(`GET https://make.local/api/v2/scenarios?teamId=${TEAM_ID}&cols%5B%5D=*`, scenariosMock);

        const tool = getTool('scenarios_list');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(scenariosMock.scenarios);
    });

    it('Should execute scenarios_list with folder and label filters', async () => {
        mockFetch(
            `GET https://make.local/api/v2/scenarios?teamId=${TEAM_ID}&folderId=123&includeSubfolders=true&labelIds%5B%5D=7&labelIds%5B%5D=9&cols%5B%5D=*`,
            scenariosMock,
        );

        const tool = getTool('scenarios_list');
        const result = await tool.execute(make, {
            teamId: TEAM_ID,
            folderId: 123,
            includeSubfolders: true,
            labelIds: [7, 9],
        });

        expect(result).toStrictEqual(scenariosMock.scenarios);
    });

    it('Should declare the scenarios_list filter parameters as optional', () => {
        const tool = getTool('scenarios_list');

        expect(tool.inputSchema.required).toStrictEqual(['teamId']);
        expect(Object.keys(tool.inputSchema.properties ?? {})).toStrictEqual([
            'teamId',
            'folderId',
            'includeSubfolders',
            'labelIds',
        ]);
        expect(tool.inputSchema.properties?.labelIds?.items?.type).toBe('number');
    });
});
