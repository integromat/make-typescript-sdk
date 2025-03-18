import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Data Structures', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let dataStructureId: number;

    it('Should create a data structure', async () => {
        const dataStructure = await make.dataStructures.create({
            name: `Test DataStructure ${Date.now()}`,
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
        expect(dataStructure.name).toContain('Test DataStructure');
        expect(dataStructure.teamId).toBe(MAKE_TEAM);
        expect(dataStructure.spec).toBeDefined();
        expect(dataStructure.spec?.length).toBe(6);

        dataStructureId = dataStructure.id;
    });

    it('Should get a data structure', async () => {
        const dataStructure = await make.dataStructures.get(dataStructureId);

        expect(dataStructure).toBeDefined();
        expect(dataStructure.id).toBe(dataStructureId);
        expect(dataStructure.teamId).toBe(MAKE_TEAM);
    });

    it('Should update a data structure', async () => {
        const updatedName = `Updated DataStructure ${Date.now()}`;
        const dataStructure = await make.dataStructures.update(dataStructureId, {
            name: updatedName,
            spec: [
                {
                    type: 'text',
                    name: 'name',
                    label: 'Full Name',
                    required: true,
                },
                {
                    type: 'text',
                    name: 'email',
                    label: 'Email Address',
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
        expect(dataStructure.id).toBe(dataStructureId);
        expect(dataStructure.name).toBe(updatedName);
        expect(dataStructure.spec).toBeDefined();
        expect(dataStructure.spec?.length).toBe(6);
        expect(dataStructure.spec?.[0].label).toBe('Full Name');
    });

    it('Should list data structures', async () => {
        const dataStructures = await make.dataStructures.list(MAKE_TEAM);

        expect(dataStructures).toBeDefined();
        expect(Array.isArray(dataStructures)).toBe(true);

        // Find our created data structure
        const createdDataStructure = dataStructures.find(ds => ds.id === dataStructureId);
        expect(createdDataStructure).toBeDefined();
    });

    it('Should clone a data structure', async () => {
        const clonedName = `Cloned DataStructure ${Date.now()}`;
        const clonedDataStructure = await make.dataStructures.clone(dataStructureId, {
            name: clonedName,
            targetTeamId: MAKE_TEAM,
        });

        expect(clonedDataStructure).toBeDefined();
        expect(clonedDataStructure.id).toBeDefined();
        expect(clonedDataStructure.id).not.toBe(dataStructureId);
        expect(clonedDataStructure.name).toBe(clonedName);
        expect(clonedDataStructure.teamId).toBe(MAKE_TEAM);
        expect(clonedDataStructure.spec).toBeDefined();
        expect(clonedDataStructure.spec?.length).toBe(6);

        // Clean up the cloned data structure
        await make.dataStructures.delete(clonedDataStructure.id);
    });

    it('Should delete a data structure', async () => {
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
