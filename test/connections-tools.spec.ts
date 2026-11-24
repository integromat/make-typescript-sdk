import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/connections/list.json';
import * as listLockedMock from './mocks/connections/list-locked.json';
import * as makeLockedMock from './mocks/connections/make-locked.json';
import * as makeTeamMock from './mocks/connections/make-team.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 22;
const CONNECTION_ID = 15;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: connections', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute connections_list', async () => {
        mockFetch(`GET https://make.local/api/v2/connections?teamId=${TEAM_ID}&cols%5B%5D=*`, listMock);

        const tool = getTool('connections_list');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(listMock.connections);
    });

    it('Should execute connections_list with the visibility and usable filters', async () => {
        mockFetch(
            `GET https://make.local/api/v2/connections?teamId=${TEAM_ID}&cols%5B%5D=*&visibility=locked&usable=true`,
            listLockedMock,
        );

        const tool = getTool('connections_list');
        const result = await tool.execute(make, { teamId: TEAM_ID, visibility: 'locked', usable: true });

        expect(result).toStrictEqual(listLockedMock.connections);
    });

    it('Should execute connections_make-locked', async () => {
        mockFetch(`POST https://make.local/api/v2/connections/${CONNECTION_ID}/make-locked`, makeLockedMock);

        const tool = getTool('connections_make-locked');
        const result = await tool.execute(make, { connectionId: CONNECTION_ID });

        expect(result).toStrictEqual(makeLockedMock.connection);
    });

    it('Should execute connections_make-team', async () => {
        mockFetch(`POST https://make.local/api/v2/connections/${CONNECTION_ID}/make-team`, makeTeamMock);

        const tool = getTool('connections_make-team');
        const result = await tool.execute(make, { connectionId: CONNECTION_ID });

        expect(result).toStrictEqual(makeTeamMock.connection);
    });

    // Clients decide whether to ask the user before a call from these hints, so they are pinned.
    it('Should declare the visibility changes as idempotent destructive writes on the connection', () => {
        ['connections_make-locked', 'connections_make-team'].forEach(name => {
            const tool = getTool(name);

            expect(tool.scope).toBe('connections:write');
            expect(tool.resourceId).toBe('connectionId');
            expect(tool.annotations).toStrictEqual({
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: true,
                openWorldHint: false,
            });
        });
    });
});
