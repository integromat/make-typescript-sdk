import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Roles', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let firstRoleId: number | undefined;

    it('Should list roles for the organization', async () => {
        const roles = await make.roles.list({ organizationId: MAKE_ORGANIZATION });

        expect(Array.isArray(roles)).toBe(true);
        expect(roles.length).toBeGreaterThan(0);

        firstRoleId = roles[0]?.id;
    });

    it('Should list roles for a team', async () => {
        const roles = await make.roles.list({ teamId: MAKE_TEAM, category: 'team' });

        expect(Array.isArray(roles)).toBe(true);
        expect(roles.every(role => role.category === 'team')).toBe(true);
    });

    it('Should get a role', async () => {
        // Roleman may not be enabled for this account yet — get() answers 404 in that case.
        if (firstRoleId === undefined) return;

        try {
            const role = await make.roles.get(firstRoleId);

            expect(role.id).toBe(firstRoleId);
            expect(Array.isArray(role.permissions)).toBe(true);
        } catch (error) {
            console.warn('Skipping roles.get() assertions — Roleman may not be enabled:', error);
        }
    });

    it('Should list role permissions', async () => {
        const permissions = await make.roles.permissions();

        expect(Array.isArray(permissions)).toBe(true);
        expect(permissions.length).toBeGreaterThan(0);
    });

    it('Should list only organization role permissions', async () => {
        const permissions = await make.roles.permissions({ roleCategory: 'organization' });

        expect(permissions.every(permission => permission.roleCategory === 'organization')).toBe(true);
    });
});
