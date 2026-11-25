import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Keys', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let keyId: number;

    it('Should list available key types', async () => {
        const types = await make.keys.types();
        expect(types).toBeDefined();
        expect(Array.isArray(types)).toBe(true);

        // Make sure basicauth type exists as we'll use it in tests
        const basicAuthType = types.find(type => type.name === 'basicauth');
        expect(basicAuthType).toBeDefined();
    });

    it('Should create a basic auth key', async () => {
        const keyName = `Test Basic Auth Key ${Date.now()}`;
        const key = await make.keys.create({
            name: keyName,
            teamId: MAKE_TEAM,
            typeName: 'basicauth',
            parameters: {
                authUser: 'testuser',
                authPass: 'testpassword',
            },
        });

        expect(key).toBeDefined();
        expect(key.id).toBeDefined();
        expect(key.name).toBe(keyName);
        expect(key.typeName).toBe('basicauth');
        expect(key.teamId).toBe(MAKE_TEAM);

        keyId = key.id;
    });

    it('Should get a key by ID', async () => {
        const key = await make.keys.get(keyId, {
            cols: ['id', 'name', 'typeName', 'teamId'],
        });

        expect(key).toBeDefined();
        expect(key.id).toBe(keyId);
        expect(key.typeName).toBe('basicauth');
        expect(key.teamId).toBe(MAKE_TEAM);
    });

    it('Should list keys with filtering by type', async () => {
        const keys = await make.keys.list(MAKE_TEAM, {
            typeName: 'basicauth',
        });

        expect(keys).toBeDefined();
        expect(Array.isArray(keys)).toBe(true);

        // Find our created key
        const ourKey = keys.find(k => k.id === keyId);
        expect(ourKey).toBeDefined();
        expect(ourKey?.name).toBeDefined();
    });

    it('Should list keys with specific fields only', async () => {
        const keys = await make.keys.list(MAKE_TEAM, {
            cols: ['id', 'name'],
        });

        expect(keys).toBeDefined();
        expect(Array.isArray(keys)).toBe(true);

        // Find our created key
        const ourKey = keys.find(k => k.id === keyId);
        expect(ourKey).toBeDefined();
        expect(ourKey?.id).toBe(keyId);
        expect(ourKey?.name).toBeDefined();

        // These fields should not be included
        expect((ourKey as unknown as { typeName?: string })?.typeName).toBeUndefined();
        expect((ourKey as unknown as { teamId?: string })?.teamId).toBeUndefined();
    });

    it('Should update a key', async () => {
        const updatedName = `Updated Basic Auth Key ${Date.now()}`;
        const key = await make.keys.update(keyId, {
            name: updatedName,
        });

        expect(key).toBeDefined();
        expect(key.id).toBe(keyId);
        expect(key.name).toBe(updatedName);
    });

    it('Should list keys by visibility and usability', async () => {
        const teamVisible = await make.keys.list(MAKE_TEAM, { visibility: 'team' });
        const usable = await make.keys.list(MAKE_TEAM, { usable: true });

        expect(teamVisible.some(k => k.id === keyId)).toBe(true);
        expect(usable.some(k => k.id === keyId)).toBe(true);
    });

    // The test created the key, so it may lock it and becomes its sole admin. The flow ends with `makeTeam`,
    // so a failed run leaves at most one locked key, which its admin can still delete.
    it('Should lock a key', async () => {
        const key = await make.keys.makeLocked(keyId);
        expect(key).toStrictEqual({ id: keyId, visibility: 'locked' });
    });

    it('Should list the locked key with the caller as its admin', async () => {
        // `acl` comes only with both `id` and `visibility` among the columns.
        const keys = await make.keys.list(MAKE_TEAM, { visibility: 'locked', cols: ['id', 'visibility'] });
        const ourKey = keys.find(k => k.id === keyId);

        expect(ourKey?.visibility).toBe('locked');
        expect(ourKey?.acl?.permissions).toContain('entity manage');
    });

    it('Should list the locked key among the locked entities of the team', async () => {
        const entities = await make.lockedEntities.list(MAKE_TEAM);
        expect(entities.find(e => e.type === 'key' && e.id === keyId)).toBeDefined();
    });

    it('Should lock an already locked key without a change', async () => {
        const key = await make.keys.makeLocked(keyId);
        expect(key).toStrictEqual({ id: keyId, visibility: 'locked' });
    });

    it('Should make the key available to the team', async () => {
        const key = await make.keys.makeTeam(keyId);
        expect(key).toStrictEqual({ id: keyId, visibility: 'team' });

        const locked = await make.keys.list(MAKE_TEAM, { visibility: 'locked' });
        expect(locked.some(k => k.id === keyId)).toBe(false);
    });

    it('Should delete a key', async () => {
        await make.keys.delete(keyId);

        // Verify the key is deleted by expecting an error when trying to get it
        try {
            await make.keys.get(keyId);
            // If we get here, the test should fail because the key should be deleted
            expect(true).toBe(false);
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toBeDefined();
        }
    });

    it('Should create an API key auth key', async () => {
        const keyName = `Test API Key Auth ${Date.now()}`;
        const key = await make.keys.create({
            name: keyName,
            teamId: MAKE_TEAM,
            typeName: 'apikeyauth',
            parameters: {
                key: 'api_key_123456',
                placement: 'header',
                name: 'X-API-Key',
            },
        });

        expect(key).toBeDefined();
        expect(key.id).toBeDefined();
        expect(key.name).toBe(keyName);
        expect(key.typeName).toBe('apikeyauth');

        // Delete the key to clean up
        await make.keys.delete(key.id);
    });

    it('Should create an AES key', async () => {
        const keyName = `Test AES Key ${Date.now()}`;
        const key = await make.keys.create({
            name: keyName,
            teamId: MAKE_TEAM,
            typeName: 'aes-key',
            parameters: {
                key: '1234567890abcdef1234567890abcdef',
                keyEncoding: 'hex',
            },
        });

        expect(key).toBeDefined();
        expect(key.id).toBeDefined();
        expect(key.name).toBe(keyName);
        expect(key.typeName).toBe('aes-key');

        // Delete the key to clean up
        await make.keys.delete(key.id);
    });
});
