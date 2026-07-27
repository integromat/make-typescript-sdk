import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

describe('Integration: PrivateSpaces', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let privateSpaceId: number | undefined;
    let originalOperationsLimit: number | null | undefined;
    let consumedOperations: number | null | undefined;

    it('Should list private spaces', async () => {
        const spaces = await make.privateSpaces.list(MAKE_ORGANIZATION);

        expect(Array.isArray(spaces)).toBe(true);

        // No public API can provision a private space, so downstream tests are
        // skipped (early return) when the organization has none.
        privateSpaceId = spaces[0]?.id;
    });

    it('Should get a private space', async () => {
        if (privateSpaceId === undefined) return;

        const space = await make.privateSpaces.get(privateSpaceId, { cols: ['*'] });

        expect(space.id).toBe(privateSpaceId);
        expect(space.organizationId).toBe(MAKE_ORGANIZATION);
        expect(space.type).toBe('personal');

        originalOperationsLimit = space.operationsLimit;
        consumedOperations = space.consumedOperations;
    });

    it('Should update a private space and restore the original limit', async () => {
        if (privateSpaceId === undefined) return;

        // Stay above current consumption so the update needs no confirmation
        // and cannot pause the space.
        const safeLimit = Math.max(consumedOperations ?? 0, originalOperationsLimit ?? 0) + 10000;

        const updated = await make.privateSpaces.update(privateSpaceId, { operationsLimit: safeLimit });
        expect(updated.operationsLimit).toBe(safeLimit);

        const restored = await make.privateSpaces.update(
            privateSpaceId,
            { operationsLimit: originalOperationsLimit ?? null },
            { confirmed: true },
        );
        expect(restored.operationsLimit).toBe(originalOperationsLimit ?? null);
    });
});
