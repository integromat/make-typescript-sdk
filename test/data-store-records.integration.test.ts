import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Data Store Records', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let dataStoreId: number;
    let dataStructureId: number;
    let recordKey1: string;
    let recordKey2: string;
    let recordKey3: string;

    it('Should create a data structure for testing', async () => {
        const dataStructure = await make.dataStructures.create({
            name: `DataStore Records Test Structure ${Date.now()}`,
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
                    type: 'number',
                    name: 'age',
                    label: 'Age',
                    required: false,
                },
                {
                    type: 'text',
                    name: 'department',
                    label: 'Department',
                    required: false,
                },
            ],
            strict: true,
        });

        expect(dataStructure).toBeDefined();
        expect(dataStructure.id).toBeDefined();
        dataStructureId = dataStructure.id;
    });

    it('Should create a data store for testing', async () => {
        const dataStore = await make.dataStores.create({
            name: `Test DataStore Records ${Date.now()}`,
            teamId: MAKE_TEAM,
            datastructureId: dataStructureId,
            maxSizeMB: 1,
        });

        expect(dataStore).toBeDefined();
        expect(dataStore.id).toBeDefined();
        dataStoreId = dataStore.id;
    });

    it('Should create a record with auto-generated key', async () => {
        const recordData = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'active',
            age: 30,
            department: 'Engineering',
        };

        const record = await make.dataStores.records.create(dataStoreId, recordData);

        expect(record).toBeDefined();
        expect(record.key).toBeDefined();
        expect(typeof record.key).toBe('string');
        expect(record.data).toEqual(recordData);

        recordKey1 = record.key;
    });

    it('Should create a record with explicit key', async () => {
        const customKey = `custom_key_${Date.now()}`;
        const recordData = {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'inactive',
            age: 28,
            department: 'Marketing',
        };

        const record = await make.dataStores.records.create(dataStoreId, customKey, recordData);

        expect(record).toBeDefined();
        expect(record.key).toBe(customKey);
        expect(record.data).toEqual(recordData);

        recordKey2 = record.key;
    });

    it('Should create another record for bulk operations testing', async () => {
        const recordData = {
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            status: 'active',
            age: 35,
            department: 'Sales',
        };

        const record = await make.dataStores.records.create(dataStoreId, recordData);

        expect(record).toBeDefined();
        expect(record.key).toBeDefined();
        recordKey3 = record.key;
    });

    it('Should list all records in the data store', async () => {
        const records = await make.dataStores.records.list(dataStoreId);

        expect(records).toBeDefined();
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThanOrEqual(3);

        // Verify our created records exist
        const record1 = records.find(r => r.key === recordKey1);
        const record2 = records.find(r => r.key === recordKey2);
        const record3 = records.find(r => r.key === recordKey3);

        expect(record1).toBeDefined();
        expect(record1?.data.name).toBe('John Doe');

        expect(record2).toBeDefined();
        expect(record2?.data.name).toBe('Jane Smith');

        expect(record3).toBeDefined();
        expect(record3?.data.name).toBe('Bob Johnson');
    });

    it('Should list records with pagination', async () => {
        const records = await make.dataStores.records.list(dataStoreId, {
            pg: {
                limit: 2,
                offset: 0,
            },
        });

        expect(records).toBeDefined();
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeLessThanOrEqual(2);
    });

    it('Should update a record partially', async () => {
        const updateData = {
            status: 'on-leave',
            department: 'HR',
        };

        const updatedRecord = await make.dataStores.records.update(dataStoreId, recordKey1, updateData);

        expect(updatedRecord).toBeDefined();
        expect(updatedRecord.key).toBe(recordKey1);
        expect(updatedRecord.data.status).toBe('on-leave');
        expect(updatedRecord.data.department).toBe('HR');
        // Original data should be preserved
        expect(updatedRecord.data.name).toBe('John Doe');
        expect(updatedRecord.data.email).toBe('john.doe@example.com');
        expect(updatedRecord.data.age).toBe(30);
    });

    it('Should replace a record completely', async () => {
        const replaceData = {
            name: 'Jane Smith-Updated',
            email: 'jane.updated@example.com',
            status: 'active',
            age: 29,
            department: 'Product',
        };

        const replacedRecord = await make.dataStores.records.replace(dataStoreId, recordKey2, replaceData);

        expect(replacedRecord).toBeDefined();
        expect(replacedRecord.key).toBe(recordKey2);
        expect(replacedRecord.data).toEqual(replaceData);
    });

    it('Should delete a single record', async () => {
        await make.dataStores.records.delete(dataStoreId, [recordKey3]);

        // Verify the record is deleted
        const records = await make.dataStores.records.list(dataStoreId);
        const deletedRecord = records.find(r => r.key === recordKey3);
        expect(deletedRecord).toBeUndefined();

        // Other records should still exist
        const record1 = records.find(r => r.key === recordKey1);
        const record2 = records.find(r => r.key === recordKey2);
        expect(record1).toBeDefined();
        expect(record2).toBeDefined();
    });

    it('Should delete multiple records', async () => {
        await make.dataStores.records.delete(dataStoreId, [recordKey1, recordKey2]);

        // Verify both records are deleted
        const records = await make.dataStores.records.list(dataStoreId);
        const deletedRecord1 = records.find(r => r.key === recordKey1);
        const deletedRecord2 = records.find(r => r.key === recordKey2);

        expect(deletedRecord1).toBeUndefined();
        expect(deletedRecord2).toBeUndefined();
    });

    it('Should verify data store is empty after deleting all records', async () => {
        const records = await make.dataStores.records.list(dataStoreId);
        expect(records.length).toBe(0);
    });

    // Cleanup
    it('Should delete the test data store', async () => {
        await make.dataStores.delete(dataStoreId);

        // Verify deletion by expecting an error when trying to access it
        try {
            await make.dataStores.get(dataStoreId);
            expect(true).toBe(false); // Should not reach this line
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toBeDefined();
        }
    });

    it('Should delete the test data structure', async () => {
        await make.dataStructures.delete(dataStructureId);

        // Verify deletion by expecting an error when trying to access it
        try {
            await make.dataStructures.get(dataStructureId);
            expect(true).toBe(false); // Should not reach this line
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toBeDefined();
        }
    });
});
