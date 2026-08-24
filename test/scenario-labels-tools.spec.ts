import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/scenario-labels/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 5;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: labels', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute labels_list', async () => {
        mockFetch(`GET https://make.local/api/v2/scenario-labels?teamId=${TEAM_ID}`, listMock);

        const tool = getTool('labels_list');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(listMock.labels);
    });

    it('Should declare labels_list as a read-only scenarios:read tool scoped by teamId', () => {
        const tool = getTool('labels_list');

        expect(tool.category).toBe('labels');
        expect(tool.scope).toBe('scenarios:read');
        expect(tool.scopeId).toBe('teamId');
        expect(tool.inputSchema.required).toStrictEqual(['teamId']);
        expect(tool.annotations?.readOnlyHint).toBe(true);
    });
});
