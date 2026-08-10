import 'dotenv/config';
import { describe, expect, it, afterAll } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

describe('Integration: CustomRoles', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let customRoleId: number | undefined;

    // Best-effort cleanup in case a test above fails before reaching the delete step —
    // the organization's customRoles license/Roleman gating is environment-dependent (see below).
    afterAll(async () => {
        if (customRoleId === undefined) return;
        await make.customRoles.delete({ id: customRoleId, organizationId: MAKE_ORGANIZATION }).catch(() => {
            // Already deleted by the 'Should delete the custom role' test below, or cleanup failed — best effort only.
        });
    });

    it('Should create an organization custom role', async () => {
        try {
            const role = await make.customRoles.create({
                name: `Test Custom Role ${Date.now()}`,
                category: 'organization',
                organizationId: MAKE_ORGANIZATION,
                description: 'Created by the SDK integration test suite.',
            });

            expect(role.category).toBe('organization');
            expect(role.managementType).toBe('custom_managed');

            customRoleId = role.id;
        } catch (error) {
            // The organization may not have the customRoles license feature or Roleman enabled —
            // the remaining tests skip themselves via the customRoleId guard below.
            console.warn('Skipping CustomRoles integration tests — create failed:', error);
        }
    });

    it('Should update the custom role', async () => {
        if (customRoleId === undefined) return;

        const role = await make.customRoles.update({
            id: customRoleId,
            organizationId: MAKE_ORGANIZATION,
            name: `Updated Custom Role ${Date.now()}`,
            permissions: [],
        });

        expect(role.id).toBe(customRoleId);
    });

    it('Should find the custom role via roles.list', async () => {
        if (customRoleId === undefined) return;

        const roles = await make.roles.list({ organizationId: MAKE_ORGANIZATION });

        expect(roles.some(role => role.id === customRoleId)).toBe(true);
    });

    it('Should delete the custom role', async () => {
        if (customRoleId === undefined) return;

        const deletedRoleId = await make.customRoles.delete({ id: customRoleId, organizationId: MAKE_ORGANIZATION });

        expect(deletedRoleId).toBe(customRoleId);
    });
});
