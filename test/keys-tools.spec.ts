import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/keys/list.json';
import * as listLockedMock from './mocks/keys/list-locked.json';
import * as makeLockedMock from './mocks/keys/make-locked.json';
import * as makeTeamMock from './mocks/keys/make-team.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 22;
const KEY_ID = 8;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: keys', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute keys_list', async () => {
        mockFetch(`GET https://make.local/api/v2/keys?teamId=${TEAM_ID}&cols%5B%5D=*`, listMock);

        const tool = getTool('keys_list');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(listMock.keys);
    });

    it('Should execute keys_list with the visibility and usable filters', async () => {
        mockFetch(
            `GET https://make.local/api/v2/keys?teamId=${TEAM_ID}&cols%5B%5D=*&visibility=locked&usable=true`,
            listLockedMock,
        );

        const tool = getTool('keys_list');
        const result = await tool.execute(make, { teamId: TEAM_ID, visibility: 'locked', usable: true });

        expect(result).toStrictEqual(listLockedMock.keys);
    });

    it('Should execute keys_make-locked', async () => {
        mockFetch(`POST https://make.local/api/v2/keys/${KEY_ID}/make-locked`, makeLockedMock);

        const tool = getTool('keys_make-locked');
        const result = await tool.execute(make, { keyId: KEY_ID });

        expect(result).toStrictEqual(makeLockedMock.key);
    });

    it('Should execute keys_make-team', async () => {
        mockFetch(`POST https://make.local/api/v2/keys/${KEY_ID}/make-team`, makeTeamMock);

        const tool = getTool('keys_make-team');
        const result = await tool.execute(make, { keyId: KEY_ID });

        expect(result).toStrictEqual(makeTeamMock.key);
    });

    // Clients decide whether to ask the user before a call from these hints, so they are pinned.
    it('Should declare the visibility changes as idempotent destructive writes on the key', () => {
        ['keys_make-locked', 'keys_make-team'].forEach(name => {
            const tool = getTool(name);

            expect(tool.scope).toBe('keys:write');
            expect(tool.resourceId).toBe('keyId');
            expect(tool.annotations).toStrictEqual({
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: true,
                openWorldHint: false,
            });
        });
    });
});
