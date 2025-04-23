import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Data Stores', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let dataStoreId: number;
    let recordKey1: string;
    let recordKey2: string;
    let dataStructureId: number;

    it('Should create a data structure for the data store', async () => {
        const dataStructure = await make.dataStructures.create({
            name: `DataStore Structure ${Date.now()}`,
            teamId: MAKE_TEAM,
            spec: [
                {
                    type: 'text',
                    name: 'name',
                    label: 'Name',
                    required: true,
                },
                {
                    type: 'text',
                    name: 'email',
                    label: 'Email',
                    required: true,
                },
                {
                    type: 'text',
                    name: 'status',
                    label: 'Status',
                    required: false,
                },
                {
                    type: 'text',
                    name: 'createdAt',
                    label: 'Created At',
                    required: false,
                },
                {
                    type: 'text',
                    name: 'updatedAt',
                    label: 'Updated At',
                    required: false,
                },
                {
                    type: 'text',
                    name: 'replacedAt',
                    label: 'Replaced At',
                    required: false,
                },
            ],
            strict: true,
        });

        expect(dataStructure).toBeDefined();
        expect(dataStructure.id).toBeDefined();
        dataStructureId = dataStructure.id;
    });

    it('Should create a data store with a data structure', async () => {
        const dataStore = await make.dataStores.create({
            name: `Test DataStore ${Date.now()}`,
            teamId: MAKE_TEAM,
            datastructureId: dataStructureId,
            maxSizeMB: 1,
        });

        expect(dataStore).toBeDefined();
        expect(dataStore.id).toBeDefined();
        expect(dataStore.name).toContain('Test DataStore');
        expect(dataStore.teamId).toBe(MAKE_TEAM);
        expect(dataStore.datastructureId).toBe(dataStructureId);

        dataStoreId = dataStore.id;
    });

    it('Should get a data store', async () => {
        const dataStore = await make.dataStores.get(dataStoreId);

        expect(dataStore).toBeDefined();
        expect(dataStore.id).toBe(dataStoreId);
        expect(dataStore.teamId).toBe(MAKE_TEAM);
    });

    it('Should update a data store', async () => {
        const updatedName = `Updated DataStore ${Date.now()}`;
        const dataStore = await make.dataStores.update(dataStoreId, {
            name: updatedName,
        });

        expect(dataStore).toBeDefined();
        expect(dataStore.id).toBe(dataStoreId);
        expect(dataStore.name).toBe(updatedName);
    });

    it('Should create records in a data store', async () => {
        const record1 = await make.dataStores.records.create(dataStoreId, {
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'active',
            createdAt: new Date().toISOString(),
        });

        expect(record1).toBeDefined();
        expect(record1.key).toBeDefined();
        expect(record1.data.name).toBe('John Doe');
        recordKey1 = record1.key;

        const record2 = await make.dataStores.records.create(dataStoreId, {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'inactive',
            createdAt: new Date().toISOString(),
        });

        expect(record2).toBeDefined();
        expect(record2.key).toBeDefined();
        expect(record2.data.name).toBe('Jane Smith');
        recordKey2 = record2.key;
    });

    it('Should list records in a data store', async () => {
        const records = await make.dataStores.records.list(dataStoreId);

        expect(records).toBeDefined();
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThanOrEqual(2);

        // Find our created records
        const record1 = records.find(r => r.key === recordKey1);
        const record2 = records.find(r => r.key === recordKey2);

        expect(record1).toBeDefined();
        expect(record1?.data.name).toBe('John Doe');

        expect(record2).toBeDefined();
        expect(record2?.data.name).toBe('Jane Smith');
    });

    it('Should update a record in a data store', async () => {
        const updatedRecord = await make.dataStores.records.update(dataStoreId, recordKey1, {
            status: 'inactive',
            updatedAt: new Date().toISOString(),
        });

        expect(updatedRecord).toBeDefined();
        expect(updatedRecord.key).toBe(recordKey1);
        expect(updatedRecord.data.status).toBe('inactive');
        expect(updatedRecord.data.name).toBe('John Doe'); // Original data should be preserved
    });

    it('Should replace a record in a data store', async () => {
        const replacedRecord = await make.dataStores.records.replace(dataStoreId, recordKey2, {
            name: 'Jane Smith-Johnson',
            email: 'jane.smith-johnson@example.com',
            status: 'active',
            replacedAt: new Date().toISOString(),
        });

        expect(replacedRecord).toBeDefined();
        expect(replacedRecord.key).toBe(recordKey2);
        expect(replacedRecord.data.name).toBe('Jane Smith-Johnson');
        expect(replacedRecord.data.status).toBe('active');
        // Original createdAt should be gone since this is a full replacement
        expect(replacedRecord.data.createdAt).toBeUndefined();
    });

    it('Should delete a specific record from a data store', async () => {
        await make.dataStores.records.delete(dataStoreId, [recordKey1]);

        // Verify the record is deleted
        const records = await make.dataStores.records.list(dataStoreId);
        const deletedRecord = records.find(r => r.key === recordKey1);
        expect(deletedRecord).toBeUndefined();

        // But the other record should still exist
        const remainingRecord = records.find(r => r.key === recordKey2);
        expect(remainingRecord).toBeDefined();
    });

    it('Should delete all records from a data store', async () => {
        await make.dataStores.records.deleteAll(dataStoreId);

        // Verify all records are deleted
        const records = await make.dataStores.records.list(dataStoreId);
        expect(records.length).toBe(0);
    });

    it('Should delete a data store', async () => {
        await make.dataStores.delete(dataStoreId);

        // Verify the data store is deleted by expecting an error when trying to get it
        try {
            await make.dataStores.get(dataStoreId);
            // If we get here, the test should fail because the data store should be deleted
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('Should delete the data structure used for the data store', async () => {
        await make.dataStructures.delete(dataStructureId);

        // Verify the data structure is deleted by expecting an error when trying to get it
        try {
            await make.dataStructures.get(dataStructureId);
            // If we get here, the test should fail because the data structure should be deleted
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
