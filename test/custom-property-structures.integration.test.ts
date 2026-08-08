import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

describe('Integration: CustomPropertyStructures', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let structureId: number | undefined;
    let itemId: number | undefined;

    it('Should list custom property structures and create one if none exists', async () => {
        const structures = await make.customPropertyStructures.list(MAKE_ORGANIZATION);
        expect(Array.isArray(structures)).toBe(true);

        // A structure is permanent and unique per (associatedType, belongerType, belongerId) —
        // never create a second one. Reuse whatever already exists in this organization.
        const existing = structures.find(s => s.belongers.some(b => b.associatedTypes.includes('scenario')));
        if (existing) {
            structureId = existing.id;
            return;
        }

        const created = await make.customPropertyStructures.create({
            associatedType: 'scenario',
            belongerType: 'organization',
            belongerId: MAKE_ORGANIZATION,
        });
        expect(created.id).toBeDefined();
        // Resolves the casing doubt documented on CustomPropertyStructure.belongers: this only
        // runs the one time a fresh organization has no structure yet, but when it does, it's
        // the one live check that create()'s response is actually camelCase, not snake_case.
        expect(created.belongers).toStrictEqual([
            { belongerId: MAKE_ORGANIZATION, belongerType: 'organization', associatedTypes: ['scenario'] },
        ]);
        structureId = created.id;
    });

    it('Should create, update, and delete a structure item', async () => {
        if (structureId === undefined) return;

        const item = await make.customPropertyStructures.items.create(structureId, {
            name: `sdkIntegrationTest${Date.now()}`,
            label: 'SDK Integration Test',
            type: 'shortText',
            required: false,
        });
        expect(item.id).toBeDefined();
        expect(item.structureId).toBe(structureId);
        itemId = item.id;

        const updated = await make.customPropertyStructures.items.update(itemId, {
            label: 'SDK Integration Test (updated)',
        });
        expect(updated.label).toBe('SDK Integration Test (updated)');

        // Freshly created, no scenario ever referenced it — delete never needs confirmation.
        await make.customPropertyStructures.items.delete(itemId);
        itemId = undefined;
    });

    it('Should list structure items', async () => {
        if (structureId === undefined) return;

        const items = await make.customPropertyStructures.items.list(structureId);
        expect(Array.isArray(items)).toBe(true);
    });
});
