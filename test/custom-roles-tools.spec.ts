import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as customRoleCreateMock from './mocks/custom-roles/create.json';
import * as customRoleUpdateMock from './mocks/custom-roles/update.json';
import * as customRoleDeleteMock from './mocks/custom-roles/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: custom-roles', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute custom-roles_create', async () => {
        const args = {
            name: 'Custom Viewer',
            category: 'organization',
            organizationId: 1,
            permissions: [101, 102],
        };

        mockFetch('POST https://make.local/api/v2/users/custom-roles', customRoleCreateMock, req => {
            expect(req.body).toStrictEqual(args);
        });

        const tool = getTool('custom-roles_create');
        const result = await tool.execute(make, args);

        expect(result).toStrictEqual(customRoleCreateMock.role);
    });

    it('Should execute custom-roles_update', async () => {
        const args = { id: 42, organizationId: 1, name: 'Updated Viewer' };

        mockFetch('PATCH https://make.local/api/v2/users/custom-roles/42', customRoleUpdateMock, req => {
            expect(req.body).toStrictEqual({ organizationId: 1, name: 'Updated Viewer' });
        });

        const tool = getTool('custom-roles_update');
        const result = await tool.execute(make, args);

        expect(result).toStrictEqual(customRoleUpdateMock.role);
    });

    it('Should execute custom-roles_delete', async () => {
        const args = { id: 42, organizationId: 1 };

        mockFetch('DELETE https://make.local/api/v2/users/custom-roles/42', customRoleDeleteMock, req => {
            expect(req.body).toStrictEqual({ organizationId: 1 });
        });

        const tool = getTool('custom-roles_delete');
        const result = await tool.execute(make, args);

        expect(result).toBe(customRoleDeleteMock.roleId);
    });
});
