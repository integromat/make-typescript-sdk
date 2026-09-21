import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Templates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let templateId: number;

    it('Should create a template from a scenario blueprint', async () => {
        const scenario = await make.scenarios.create(
            {
                teamId: MAKE_TEAM,
                scheduling: { type: 'on-demand' },
                blueprint: JSON.stringify({
                    name: `Template source ${Date.now()}`,
                    flow: [],
                    metadata: { version: 1 },
                }),
            },
            { confirmed: true },
        );
        const blueprint = await make.blueprints.get(scenario.id);

        const template = await make.templates.create({
            teamId: MAKE_TEAM,
            language: 'en',
            blueprint,
            scheduling: blueprint.scheduling,
            controller: { name: `Test Template ${Date.now()}`, modules: {}, idSequence: 1 },
        });

        expect(template).toBeDefined();
        expect(template.id).toBeDefined();
        expect(template.teamId).toBe(MAKE_TEAM);
        templateId = template.id;

        await make.scenarios.delete(scenario.id);
    });

    it('Should get the created template', async () => {
        const template = await make.templates.get(templateId);
        expect(template.id).toBe(templateId);
    });

    it('Should get the created template blueprint', async () => {
        const blueprint = await make.templates.getBlueprint(templateId);
        expect(blueprint).toHaveProperty('blueprint');
        expect(blueprint).toHaveProperty('scheduling');
        expect(blueprint).toHaveProperty('language');
    });

    it('Should list templates for the team', async () => {
        const templates = await make.templates.list({ teamId: MAKE_TEAM });
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.some(t => t.id === templateId)).toBe(true);
    });

    it('Should rename the template', async () => {
        const newName = `Renamed Template ${Date.now()}`;
        const template = await make.templates.update(templateId, { name: newName });
        expect(template.id).toBe(templateId);
        expect(template.name).toBe(newName);
    });

    it('Should delete the template', async () => {
        const deletedId = await make.templates.delete(templateId);
        expect(deletedId).toBe(templateId);
    });
});
