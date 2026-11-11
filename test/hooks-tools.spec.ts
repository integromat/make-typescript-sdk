import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as hooksListForOrganizationMock from './mocks/hooks/list-for-organization.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: hooks', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute hooks_list-for-organization without paging by default', async () => {
        mockFetch('GET https://make.local/api/v2/organizations/5/hooks?name=order', hooksListForOrganizationMock);

        const tool = getTool('hooks_list-for-organization');
        const result = await tool.execute(make, { organizationId: 5, name: 'order' });

        expect(result).toStrictEqual(hooksListForOrganizationMock.hooks);
    });

    it('Should execute hooks_list-for-organization with filters, limit and offset', async () => {
        mockFetch(
            'GET https://make.local/api/v2/organizations/5/hooks?teamId=4&typeName=gateway-mailhook&assigned=false&enabled=true&pg%5Blimit%5D=10&pg%5Boffset%5D=30',
            hooksListForOrganizationMock,
        );

        const tool = getTool('hooks_list-for-organization');
        const result = await tool.execute(make, {
            organizationId: 5,
            teamId: 4,
            typeName: 'gateway-mailhook',
            assigned: false,
            enabled: true,
            limit: 10,
            offset: 30,
        });

        expect(result).toStrictEqual(hooksListForOrganizationMock.hooks);
    });

    it('Should declare hooks_list-for-organization as a read-only, organization-scoped tool', () => {
        const tool = getTool('hooks_list-for-organization');

        expect(tool.scope).toBe('hooks:read');
        expect(tool.scopeId).toBe('organizationId');
        expect(tool.annotations?.readOnlyHint).toBe(true);
        expect(tool.inputSchema.required).toStrictEqual(['organizationId']);
    });
});
