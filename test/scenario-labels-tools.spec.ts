import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/scenario-labels/list.json';
import * as createMock from './mocks/scenario-labels/create.json';
import * as updateMock from './mocks/scenario-labels/update.json';
import * as deleteMock from './mocks/scenario-labels/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 5;
const LABEL_ID = 3;

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

    it('Should execute labels_create', async () => {
        mockFetch('POST https://make.local/api/v2/scenario-labels', createMock, req => {
            expect(req.body).toStrictEqual({ teamId: TEAM_ID, name: 'critical', colour: 'danger' });
        });

        const tool = getTool('labels_create');
        const result = await tool.execute(make, { teamId: TEAM_ID, name: 'critical', colour: 'danger' });

        expect(result).toStrictEqual(createMock.label);
    });

    it('Should execute labels_update and separate labelId from the body', async () => {
        mockFetch(`PATCH https://make.local/api/v2/scenario-labels/${LABEL_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual({ name: 'high-priority', colour: 'warning' });
        });

        const tool = getTool('labels_update');
        const result = await tool.execute(make, { labelId: LABEL_ID, name: 'high-priority', colour: 'warning' });

        expect(result).toStrictEqual(updateMock.label);
    });

    it('Should execute labels_delete', async () => {
        mockFetch(`DELETE https://make.local/api/v2/scenario-labels/${LABEL_ID}`, deleteMock);

        const tool = getTool('labels_delete');
        const result = await tool.execute(make, { labelId: LABEL_ID });

        expect(result).toBe('Label has been deleted.');
    });

    it('Should declare labels_list as a read-only scenarios:read tool scoped by teamId', () => {
        const tool = getTool('labels_list');

        expect(tool.category).toBe('labels');
        expect(tool.scope).toBe('scenarios:read');
        expect(tool.scopeId).toBe('teamId');
        expect(tool.inputSchema.required).toStrictEqual(['teamId']);
        expect(tool.annotations?.readOnlyHint).toBe(true);
    });

    it('Should declare the label mutation tools as scenarios:write with correct scoping', () => {
        const create = getTool('labels_create');
        expect(create.scope).toBe('scenarios:write');
        expect(create.scopeId).toBe('teamId');
        expect(create.inputSchema.required).toStrictEqual(['teamId', 'name', 'colour']);

        const update = getTool('labels_update');
        expect(update.scope).toBe('scenarios:write');
        expect(update.scopeId).toBe('labelId');
        expect(update.resourceId).toBe('labelId');
        expect(update.inputSchema.required).toStrictEqual(['labelId']);

        const del = getTool('labels_delete');
        expect(del.scope).toBe('scenarios:write');
        expect(del.scopeId).toBe('labelId');
        expect(del.resourceId).toBe('labelId');
        expect(del.annotations?.destructiveHint).toBe(true);
    });
});
