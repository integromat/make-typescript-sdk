import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Templates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list templates for a team', async () => {
        const templates = await make.templates.list({ teamId: MAKE_TEAM });

        expect(Array.isArray(templates)).toBe(true);
    });

    it('Should list templates with column selection', async () => {
        const templates = await make.templates.list({
            teamId: MAKE_TEAM,
            cols: ['id', 'name'],
        });

        expect(Array.isArray(templates)).toBe(true);
        if (templates.length > 0) {
            expect(templates[0]).toHaveProperty('id');
            expect(templates[0]).toHaveProperty('name');
        }
    });

    it('Should list public templates', async () => {
        const templates = await make.templates.listPublic();

        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
    });

    it('Should search public templates by name', async () => {
        const templates = await make.templates.listPublic({ name: 'http' });

        expect(Array.isArray(templates)).toBe(true);
        if (templates.length > 0) {
            expect(templates[0]).toHaveProperty('id');
            expect(templates[0]).toHaveProperty('name');
            expect(templates[0]).toHaveProperty('url');
            expect(templates[0]).toHaveProperty('usage');
        }
    });

    it('Should search public templates with usedApps filter', async () => {
        const templates = await make.templates.listPublic({ usedApps: ['http'] });

        expect(Array.isArray(templates)).toBe(true);
    });
});
