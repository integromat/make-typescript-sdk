import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/locked-entities/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 22;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: locked entities', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute locked-entities_list', async () => {
        mockFetch(`GET https://make.local/api/v2/teams/${TEAM_ID}/locked-entities`, listMock);

        const tool = getTool('locked-entities_list');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(listMock.lockedEntities);
    });

    it('Should scope locked-entities_list to the team and connections:read', () => {
        const tool = getTool('locked-entities_list');

        expect(tool.scope).toBe('connections:read');
        expect(tool.scopeId).toBe('teamId');
        expect(tool.annotations?.readOnlyHint).toBe(true);
        expect(tool.description).toContain('keys:read');
    });
});
