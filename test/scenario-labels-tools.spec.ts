import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/scenario-labels/list.json';
import * as createMock from './mocks/scenario-labels/create.json';
import * as updateMock from './mocks/scenario-labels/update.json';
import * as deleteMock from './mocks/scenario-labels/delete.json';
import * as assignMock from './mocks/scenario-labels/assign.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const TEAM_ID = 5;
const LABEL_ID = 3;
const SCENARIO_ID = 1024;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: scenario-labels', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute scenario-labels_list', async () => {
        mockFetch(`GET https://make.local/api/v2/scenario-labels?teamId=${TEAM_ID}`, listMock);

        const tool = getTool('scenario-labels_list');
        const result = await tool.execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(listMock.labels);
    });

    it('Should execute scenario-labels_create', async () => {
        mockFetch('POST https://make.local/api/v2/scenario-labels', createMock, req => {
            expect(req.body).toStrictEqual({ teamId: TEAM_ID, name: 'critical', colour: 'danger' });
        });

        const tool = getTool('scenario-labels_create');
        const result = await tool.execute(make, { teamId: TEAM_ID, name: 'critical', colour: 'danger' });

        expect(result).toStrictEqual(createMock.label);
    });

    it('Should execute scenario-labels_update and separate labelId from the body', async () => {
        mockFetch(`PATCH https://make.local/api/v2/scenario-labels/${LABEL_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual({ name: 'high-priority', colour: 'warning' });
        });

        const tool = getTool('scenario-labels_update');
        const result = await tool.execute(make, { labelId: LABEL_ID, name: 'high-priority', colour: 'warning' });

        expect(result).toStrictEqual(updateMock.label);
    });

    it('Should execute scenario-labels_delete', async () => {
        mockFetch(`DELETE https://make.local/api/v2/scenario-labels/${LABEL_ID}`, deleteMock);

        const tool = getTool('scenario-labels_delete');
        const result = await tool.execute(make, { labelId: LABEL_ID });

        expect(result).toBe('Label has been deleted.');
    });

    it('Should execute scenario-labels_assign', async () => {
        mockFetch(
            `POST https://make.local/api/v2/scenario-labels/${LABEL_ID}/scenarios/${SCENARIO_ID}`,
            assignMock,
        );

        const tool = getTool('scenario-labels_assign');
        const result = await tool.execute(make, { labelId: LABEL_ID, scenarioId: SCENARIO_ID });

        expect(result).toBe('Label has been assigned to the scenario.');
    });

    it('Should execute scenario-labels_unassign', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/scenario-labels/${LABEL_ID}/scenarios/${SCENARIO_ID}`,
            assignMock,
        );

        const tool = getTool('scenario-labels_unassign');
        const result = await tool.execute(make, { labelId: LABEL_ID, scenarioId: SCENARIO_ID });

        expect(result).toBe('Label has been removed from the scenario.');
    });

    it('Should declare the assignment tools as idempotent scenarios:write tools targeting the scenario', () => {
        for (const name of ['scenario-labels_assign', 'scenario-labels_unassign']) {
            const tool = getTool(name);
            expect(tool.scope).toBe('scenarios:write');
            expect(tool.scopeId).toBe('labelId');
            expect(tool.resourceId).toBe('scenarioId');
            expect(tool.annotations?.idempotentHint).toBe(true);
            expect(tool.inputSchema.required).toStrictEqual(['labelId', 'scenarioId']);
        }
    });

    it('Should declare scenario-labels_list as a read-only scenarios:read tool scoped by teamId', () => {
        const tool = getTool('scenario-labels_list');

        expect(tool.category).toBe('scenario-labels');
        expect(tool.scope).toBe('scenarios:read');
        expect(tool.scopeId).toBe('teamId');
        expect(tool.inputSchema.required).toStrictEqual(['teamId']);
        expect(tool.annotations?.readOnlyHint).toBe(true);
    });

    it('Should declare the label mutation tools as scenarios:write with correct scoping', () => {
        const create = getTool('scenario-labels_create');
        expect(create.scope).toBe('scenarios:write');
        expect(create.scopeId).toBe('teamId');
        expect(create.inputSchema.required).toStrictEqual(['teamId', 'name', 'colour']);

        const update = getTool('scenario-labels_update');
        expect(update.scope).toBe('scenarios:write');
        expect(update.scopeId).toBe('labelId');
        expect(update.resourceId).toBe('labelId');
        expect(update.inputSchema.required).toStrictEqual(['labelId']);

        const del = getTool('scenario-labels_delete');
        expect(del.scope).toBe('scenarios:write');
        expect(del.scopeId).toBe('labelId');
        expect(del.resourceId).toBe('labelId');
        expect(del.annotations?.destructiveHint).toBe(true);
    });
});
