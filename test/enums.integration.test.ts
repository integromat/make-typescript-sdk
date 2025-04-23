import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');

describe('Integration: Enums', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list countries', async () => {
        const countries = await make.enums.countries();

        expect(countries).toBeDefined();
        expect(Array.isArray(countries)).toBe(true);
        expect(countries.length).toBeGreaterThan(0);

        // Verify structure of a country
        expect(countries.length).toBeGreaterThan(0);
        const country = countries[0];
        expect(country?.id).toBeDefined();
        expect(country?.name).toBeDefined();
        expect(country?.code).toBeDefined();
        expect(country?.code2).toBeDefined();
    });

    it('Should list regions', async () => {
        const regions = await make.enums.regions();

        expect(regions).toBeDefined();
        expect(Array.isArray(regions)).toBe(true);
        expect(regions.length).toBeGreaterThan(0);

        // Verify structure of a region
        expect(regions.length).toBeGreaterThan(0);
        const region = regions[0];
        expect(region?.id).toBeDefined();
        expect(region?.name).toBeDefined();
    });

    it('Should list timezones', async () => {
        const timezones = await make.enums.timezones();

        expect(timezones).toBeDefined();
        expect(Array.isArray(timezones)).toBe(true);
        expect(timezones.length).toBeGreaterThan(0);

        // Verify structure of a timezone
        expect(timezones.length).toBeGreaterThan(0);
        const timezone = timezones[0];
        expect(timezone?.id).toBeDefined();
        expect(timezone?.name).toBeDefined();
        expect(timezone?.code).toBeDefined();
        expect(timezone?.offset).toBeDefined();
    });
});
