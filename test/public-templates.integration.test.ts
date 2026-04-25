import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');

describe('Integration: PublicTemplates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list public templates', async () => {
        const templates = await make.publicTemplates.list();

        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
        expect(templates[0]).toHaveProperty('id');
        expect(templates[0]).toHaveProperty('name');
        expect(templates[0]).toHaveProperty('url');
        expect(templates[0]).toHaveProperty('usage');
    });

    it('Should search public templates by name', async () => {
        const templates = await make.publicTemplates.list({ name: 'http' });

        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
        expect(templates[0]).toHaveProperty('id');
        expect(templates[0]).toHaveProperty('name');
    });

    it('Should search public templates with usedApps filter', async () => {
        const templates = await make.publicTemplates.list({ usedApps: ['http'] });

        expect(Array.isArray(templates)).toBe(true);
    });

    it('Should get a public template by URL slug', async () => {
        const [first] = await make.publicTemplates.list({ name: 'http' });
        expect(first).toBeDefined();
        if (!first) {
            throw new Error('Expected at least one public template matching "http"');
        }
        const template = await make.publicTemplates.get(first.url);

        expect(template.id).toBe(first.id);
        expect(template.url).toBe(first.url);
    });

    it('Should get a public template blueprint by URL slug', async () => {
        const [first] = await make.publicTemplates.list({ name: 'http' });
        expect(first).toBeDefined();
        if (!first) {
            throw new Error('Expected at least one public template matching "http"');
        }
        const blueprint = await make.publicTemplates.getBlueprint(first.url);

        expect(blueprint).toHaveProperty('blueprint');
        expect(blueprint).toHaveProperty('scheduling');
        expect(blueprint).toHaveProperty('language');
    });
});
