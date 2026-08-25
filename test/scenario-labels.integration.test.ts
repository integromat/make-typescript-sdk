import 'dotenv/config';
import { afterAll, describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

/**
 * Narrows a cross-step entity ID, failing dependent steps loudly (and without sending a
 * request to a `/undefined` URL) when the step that should have created the entity failed.
 */
function requireId(id: number | undefined, entity: string): number {
    if (id === undefined) {
        throw new Error(`Precondition failed: ${entity} was not created in an earlier step`);
    }
    return id;
}

describe('Integration: ScenarioLabels', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let labelId: number | undefined;
    let scenarioId: number | undefined;

    // Self-cleaning even when an assertion fails mid-lifecycle: deleting the label
    // cascade-removes any remaining assignment, and both deletes tolerate the entity
    // already being gone (errors are swallowed on purpose — cleanup must not mask
    // the original test failure).
    afterAll(async () => {
        if (scenarioId) {
            await make.scenarios.delete(scenarioId).catch(() => undefined);
        }
        if (labelId) {
            await make.scenarioLabels.delete(labelId).catch(() => undefined);
        }
    });

    it('Should create a label', async () => {
        const label = await make.scenarioLabels.create({
            teamId: MAKE_TEAM,
            name: `it-label-${Date.now()}`.slice(0, 30),
            colour: 'info',
            description: 'SDK integration test label',
        });

        expect(label.id).toBeDefined();
        expect(label.teamId).toBe(MAKE_TEAM);
        expect(label.scope).toBe('team');
        expect(label.colour).toBe('info');
        labelId = label.id;
    });

    it('Should list the catalog including the created label with a zero count', async () => {
        const labels = await make.scenarioLabels.list(MAKE_TEAM);

        const created = labels.find(label => label.id === labelId);
        if (!created) {
            throw new Error('Created label not found in the team catalog');
        }
        expect(created.scenariosCount).toBe(0);
    });

    it('Should update the label and clear its description with null', async () => {
        const id = requireId(labelId, 'label');

        const renamed = await make.scenarioLabels.update(id, { colour: 'warning' });
        expect(renamed.colour).toBe('warning');

        const cleared = await make.scenarioLabels.update(id, { description: null });
        expect(cleared.description).toBeNull();
    });

    it('Should create a scenario and assign the label to it', async () => {
        const scenario = await make.scenarios.create({
            teamId: MAKE_TEAM,
            scheduling: '{"type":"on-demand"}',
            blueprint: `{"flow":[],"metadata":{},"name":"Label IT ${Date.now()}"}`,
        });
        expect(scenario.id).toBeDefined();
        scenarioId = scenario.id;

        await make.scenarioLabels.assign(requireId(labelId, 'label'), requireId(scenarioId, 'scenario'));
    });

    it('Should find the scenario via the labelIds filter, with the labels column populated', async () => {
        const scenarios = await make.scenarios.list(MAKE_TEAM, {
            labelIds: [requireId(labelId, 'label')],
            cols: ['*'],
        });

        const row = scenarios.find(scenario => scenario.id === scenarioId);
        if (!row) {
            throw new Error('Assigned scenario was not returned by the labelIds filter');
        }
        if (!row.labels) {
            throw new Error('The labels column is missing on the filtered scenario row');
        }
        expect(row.labels.some(label => label.id === labelId)).toBe(true);
    });

    it('Should reflect the assignment in the catalog count', async () => {
        const labels = await make.scenarioLabels.list(MAKE_TEAM);

        const assigned = labels.find(label => label.id === labelId);
        if (!assigned) {
            throw new Error('Created label not found in the team catalog');
        }
        expect(assigned.scenariosCount).toBe(1);
    });

    it('Should unassign idempotently and drop the scenario from the filtered list', async () => {
        const id = requireId(labelId, 'label');
        const targetScenarioId = requireId(scenarioId, 'scenario');

        await make.scenarioLabels.unassign(id, targetScenarioId);
        // Repeat unassign must succeed without changes (verified idempotency contract).
        await make.scenarioLabels.unassign(id, targetScenarioId);

        const scenarios = await make.scenarios.list(MAKE_TEAM, { labelIds: [id] });
        expect(scenarios.some(scenario => scenario.id === targetScenarioId)).toBe(false);
    });

    it('Should delete the label and remove it from the catalog', async () => {
        await make.scenarioLabels.delete(requireId(labelId, 'label'));

        const labels = await make.scenarioLabels.list(MAKE_TEAM);
        expect(labels.some(label => label.id === labelId)).toBe(false);
        labelId = undefined;
    });
});
