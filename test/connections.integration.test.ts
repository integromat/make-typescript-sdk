import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Connections', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let connectionId: number;

    // Create a generic API Key connection for testing
    it('Should create a connection', async () => {
        const connectionName = `Test API Connection ${Date.now()}`;
        const connection = await make.connections.create({
            teamId: MAKE_TEAM,
            name: connectionName,
            accountName: 'make',
            data: {
                apiKey: MAKE_API_KEY,
                url: `https://${MAKE_ZONE}`,
            },
        });

        expect(connection).toBeDefined();
        expect(connection.id).toBeDefined();
        expect(connection.name).toBe(connectionName);
        expect(connection.accountName).toBe('make');
        expect(connection.accountType).toBe('basic');

        connectionId = connection.id;
    });

    it('Should get a connection by ID', async () => {
        const connection = await make.connections.get(connectionId);

        expect(connection).toBeDefined();
        expect(connection.id).toBe(connectionId);
        expect(connection.teamId).toBe(MAKE_TEAM);
        expect(connection.accountName).toBe('make');
    });

    it('Should get a connection by ID with specific fields', async () => {
        const connection = await make.connections.get(connectionId, {
            cols: ['id', 'name', 'accountName', 'teamId'],
        });

        expect(connection).toBeDefined();
        expect(connection.id).toBe(connectionId);
        expect(connection.name).toBeDefined();
        expect(connection.accountName).toBe('make');
        expect(connection.teamId).toBe(MAKE_TEAM);

        // These fields should not be included
        expect((connection as unknown as { accountLabel: string }).accountLabel).toBeUndefined();
        expect((connection as unknown as { theme: string }).theme).toBeUndefined();
    });

    it('Should list connections', async () => {
        const connections = await make.connections.list(MAKE_TEAM);

        expect(connections).toBeDefined();
        expect(Array.isArray(connections)).toBe(true);
        expect(connections.length).toBeGreaterThanOrEqual(1);

        // Find our created connection
        const ourConnection = connections.find(c => c.id === connectionId);
        expect(ourConnection).toBeDefined();
        expect(ourConnection?.accountName).toBe('make');
    });

    it('Should list connections with specific fields', async () => {
        const connections = await make.connections.list(MAKE_TEAM, {
            cols: ['id', 'name', 'accountName'],
        });

        expect(connections).toBeDefined();
        expect(Array.isArray(connections)).toBe(true);

        // Find our created connection
        const ourConnection = connections.find(c => c.id === connectionId);
        expect(ourConnection).toBeDefined();
        expect(ourConnection?.id).toBe(connectionId);
        expect(ourConnection?.name).toBeDefined();
        expect(ourConnection?.accountName).toBe('make');

        // These fields should not be included
        expect((ourConnection as unknown as { teamId: number }).teamId).toBeUndefined();
        expect((ourConnection as unknown as { theme: string }).theme).toBeUndefined();
    });

    it('Should list connections with filtering by type', async () => {
        const connections = await make.connections.list(MAKE_TEAM, {
            type: ['make'],
        });

        expect(connections).toBeDefined();
        expect(Array.isArray(connections)).toBe(true);
    });

    it('Should rename a connection', async () => {
        const newName = `Renamed API Connection ${Date.now()}`;
        const connection = await make.connections.rename(connectionId, newName);

        expect(connection).toBeDefined();
        expect(connection.id).toBe(connectionId);
        expect(connection.name).toBe(newName);
    });

    it('Should verify a connection', async () => {
        const result = await make.connections.verify(connectionId);
        expect(typeof result).toBe('boolean');
    });

    it('Should update a connection', async () => {
        const result = await make.connections.update(connectionId, {
            data: {
                apiKey: 'updated-api-key-67890',
            },
        });

        expect(result).toBe(true);
    });

    it('Should verify a connection', async () => {
        await expect(make.connections.verify(connectionId)).rejects.toThrow(/Access denied: Invalid token header./);
    });

    it('Should check if a connection is scoped', async () => {
        const scopes = ['read', 'write'];
        const isScoped = await make.connections.scoped(connectionId, scopes);
        expect(typeof isScoped).toBe('boolean');
    });

    it('Should list editable parameters for a connection', async () => {
        const params = await make.connections.listEditableParameters(connectionId);

        expect(params).toBeDefined();
        expect(Array.isArray(params)).toBe(true);
        // The actual parameters will depend on the connection type
    });

    it('Should delete a connection', async () => {
        await make.connections.delete(connectionId);
    });
});
