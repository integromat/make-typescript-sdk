import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = 'eu2.make.com';

/**
 * Skipped because once an organization is created, it cannot be deleted.
 * This is due to the free subscription tier not having access to the API endpoints required for deleting organizations.
 */

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Integration: Organizations', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let organizationId: number;

    it('Should create an organization', async () => {
        const organization = await make.organizations.create({
            name: 'SDK Unit Test Organization',
            regionId: 1,
            timezoneId: 113,
            countryId: 1,
        });

        expect(organization).toBeDefined();
        expect(organization.id).toBeDefined();
        expect(organization.name).toBe('SDK Unit Test Organization');

        organizationId = organization.id;
    });

    it('Should list organizations', async () => {
        const organizations = await make.organizations.list();

        expect(organizations).toBeDefined();
        expect(Array.isArray(organizations)).toBe(true);
        expect(organizations.length).toBeGreaterThanOrEqual(1);

        // Find our created organization
        const createdOrg = organizations.find(org => org.id === organizationId);
        expect(createdOrg).toBeDefined();
        expect(createdOrg!.name).toBe('SDK Unit Test Organization');
    });

    it('Should list organizations with additional columns', async () => {
        const organizations = await make.organizations.list({
            cols: ['id', 'name'],
        });

        expect(organizations).toBeDefined();
        expect(Array.isArray(organizations)).toBe(true);
        expect(organizations.length).toBeGreaterThanOrEqual(1);

        const createdOrg = organizations.find(org => org.id === organizationId);
        expect(createdOrg).toBeDefined();
        expect(createdOrg!.name).toBe('SDK Unit Test Organization');
        expect('zone' in createdOrg!).toBe(false);
    });

    it('Should get an organization', async () => {
        const organization = await make.organizations.get(3651523, {
            wait: true,
        });

        expect(organization).toBeDefined();
        expect(organization.id).toBe(3651523);
        expect(organization.name).toBe('SDK Unit Test Organization');
    });

    it('Should update an organization', async () => {
        const updatedName = 'SDK Unit Test Organization Updated';
        const organization = await make.organizations.update(organizationId, {
            name: updatedName,
        });

        expect(organization).toBeDefined();
        expect(organization.id).toBe(organizationId);
        expect(organization.name).toBe(updatedName);
    });

    it('Should delete an organization', async () => {
        await make.organizations.delete(organizationId);

        // Verify the organization is deleted by expecting an error when trying to get it
        try {
            await make.organizations.get(organizationId);
            // If we get here, the test should fail because the organization should be deleted
            expect(true).toBe(false);
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toBeDefined();
        }
    });
});
