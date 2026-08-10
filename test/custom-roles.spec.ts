import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as customRoleCreateMock from './mocks/custom-roles/create.json';
import * as customRoleUpdateMock from './mocks/custom-roles/update.json';
import * as customRoleDeleteMock from './mocks/custom-roles/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: CustomRoles', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should create a custom role', async () => {
        const body = {
            name: 'Custom Viewer',
            category: 'organization' as const,
            organizationId: 1,
            permissions: [101, 102],
        };

        mockFetch('POST https://make.local/api/v2/users/custom-roles', customRoleCreateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.customRoles.create(body);

        expect(result).toStrictEqual(customRoleCreateMock.role);
    });

    it('Should create a team custom role with no permissions', async () => {
        const body = {
            name: 'Team Viewer',
            category: 'team' as const,
            organizationId: 1,
        };

        mockFetch('POST https://make.local/api/v2/users/custom-roles', customRoleCreateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.customRoles.create(body);

        expect(result).toStrictEqual(customRoleCreateMock.role);
    });

    it('Should update a custom role', async () => {
        const body = {
            id: 42,
            organizationId: 1,
            name: 'Updated Viewer',
            description: 'Updated description.',
            permissions: [101],
        };

        mockFetch('PATCH https://make.local/api/v2/users/custom-roles', customRoleUpdateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.customRoles.update(body);

        expect(result).toStrictEqual(customRoleUpdateMock.role);
    });

    it('Should update a custom role clearing its description', async () => {
        const body = { id: 42, organizationId: 1, description: null };

        mockFetch('PATCH https://make.local/api/v2/users/custom-roles', customRoleUpdateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.customRoles.update(body);

        expect(result).toStrictEqual(customRoleUpdateMock.role);
    });

    it('Should delete a custom role', async () => {
        const body = { id: 42, organizationId: 1 };

        mockFetch('DELETE https://make.local/api/v2/users/custom-roles', customRoleDeleteMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.customRoles.delete(body);

        expect(result).toBe(customRoleDeleteMock.roleId);
    });
});
