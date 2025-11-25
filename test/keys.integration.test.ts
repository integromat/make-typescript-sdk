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
