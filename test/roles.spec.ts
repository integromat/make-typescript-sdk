import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';
import type { Role } from '../src/endpoints/roles.js';

import * as rolesListMock from './mocks/roles/list.json';
import * as roleGetMock from './mocks/roles/get.json';
import * as rolePermissionsMock from './mocks/roles/permissions.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Roles', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list roles', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles', rolesListMock);

        const result = await make.roles.list();

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should list roles for an organization, including custom roles', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles?organizationId=5', rolesListMock);

        const result = await make.roles.list({ organizationId: 5 });

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should list roles for a team', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles?teamId=12', rolesListMock);

        const result = await make.roles.list({ teamId: 12 });

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should list roles filtered by category, role ID and excluded role IDs', async () => {
        mockFetch(
            'GET https://make.local/api/v2/users/roles?category=team&excludeRole%5B%5D=2&excludeRole%5B%5D=3&roleId=1',
            rolesListMock,
        );

        const result = await make.roles.list({ category: 'team', roleId: 1, excludeRole: [2, 3] });

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should list roles with selected columns', async () => {
        const cols: (keyof Role)[] = ['id', 'name'];
        mockFetch(`GET https://make.local/api/v2/users/roles?cols%5B%5D=${cols.join('&cols%5B%5D=')}`, rolesListMock);

        const result = await make.roles.list({ cols });

        expect(result).toStrictEqual(rolesListMock.usersRoles);
    });

    it('Should get a role', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles/42', roleGetMock);

        const result = await make.roles.get(42);

        expect(result).toStrictEqual(roleGetMock.usersRole);
    });

    it('Should list role permissions', async () => {
        mockFetch('GET https://make.local/api/v2/users/roles/permissions', rolePermissionsMock);

        const result = await make.roles.permissions();

        expect(result).toStrictEqual(rolePermissionsMock.usersRolesPermissions);
    });

    it('Should list role permissions filtered by role category', async () => {
        mockFetch(
            'GET https://make.local/api/v2/users/roles/permissions?roleCategory=organization',
            rolePermissionsMock,
        );

        const result = await make.roles.permissions({ roleCategory: 'organization' });

        expect(result).toStrictEqual(rolePermissionsMock.usersRolesPermissions);
    });
});
