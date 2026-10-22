import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as teamsListMock from './mocks/teams/list.json';
import * as teamGetMock from './mocks/teams/get.json';
import * as teamCreateMock from './mocks/teams/create.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const TEAM_ID = 5;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: teams', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute teams_list', async () => {
        mockFetch(`GET https://make.local/api/v2/teams?organizationId=${ORGANIZATION_ID}&cols%5B%5D=*`, teamsListMock);

        const tool = getTool('teams_list');
        const result = await tool.execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(teamsListMock.teams);
    });

    it('Should execute teams_list including private spaces', async () => {
        mockFetch(
            `GET https://make.local/api/v2/teams?organizationId=${ORGANIZATION_ID}&cols%5B%5D=*&includePrivateSpaces=true`,
            teamsListMock,
        );

        const tool = getTool('teams_list');
        const result = await tool.execute(make, { organizationId: ORGANIZATION_ID, includePrivateSpaces: true });

        expect(result).toStrictEqual(teamsListMock.teams);
    });

    it('Should execute teams_get', async () => {
        mockFetch(`GET https://make.local/api/v2/teams/${TEAM_ID}?cols%5B%5D=*`, teamGetMock);

        const tool = getTool('teams_get');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(teamGetMock.team);
    });

    it('Should execute teams_create', async () => {
        const args = { name: 'New Team', organizationId: ORGANIZATION_ID };
        mockFetch('POST https://make.local/api/v2/teams', teamCreateMock, req => {
            expect(req.body).toStrictEqual(args);
        });

        const tool = getTool('teams_create');
        const result = await tool.execute(make, args);

        expect(result).toStrictEqual(teamCreateMock.team);
    });

    it('Should execute teams_delete', async () => {
        mockFetch(`DELETE https://make.local/api/v2/teams/${TEAM_ID}?confirmed=true`, null);

        const tool = getTool('teams_delete');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toBe('Team has been deleted.');
    });
});
