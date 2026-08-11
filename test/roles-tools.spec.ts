import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as rolesListMock from './mocks/roles/list.json';
import * as roleGetMock from './mocks/roles/get.json';
import * as rolePermissionsMock from './mocks/roles/permissions.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ROLE_ID = 42;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: roles', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute roles_list', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles?cols%5B%5D=*', rolesListMock);

        const tool = getTool('roles_list');
        const result = await tool.execute(make, {});

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should execute roles_list scoped to an organization', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles?cols%5B%5D=*&organizationId=5', rolesListMock);

        const tool = getTool('roles_list');
        const result = await tool.execute(make, { organizationId: 5 });

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should execute roles_get', async () => {
        mockFetch(`GET https://make.local/api/v2/users/roles/${ROLE_ID}`, roleGetMock);

        const tool = getTool('roles_get');
        const result = await tool.execute(make, { roleId: ROLE_ID });

        expect(result).toStrictEqual(roleGetMock.usersRole);
    });

    it('Should execute roles_permissions', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles/permissions', rolePermissionsMock);

        const tool = getTool('roles_permissions');
        const result = await tool.execute(make, {});

        expect(result).toStrictEqual(rolePermissionsMock.usersRolesPermissions);
    });

    it('Should execute roles_permissions filtered by role category', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles/permissions?roleCategory=team', rolePermissionsMock);

        const tool = getTool('roles_permissions');
        const result = await tool.execute(make, { roleCategory: 'team' });

        expect(result).toStrictEqual(rolePermissionsMock.usersRolesPermissions);
    });
});
