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

describe('Integration: ScenarioNotes', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let scenarioId: number | undefined;
    let noteId: number | undefined;

    // Self-cleaning even when an assertion fails mid-lifecycle: deleting the scenario
    // cascade-removes its notes, and the delete tolerates the scenario already being gone
    // (errors are swallowed on purpose — cleanup must not mask the original test failure).
    afterAll(async () => {
        if (scenarioId) {
            await make.scenarios.delete(scenarioId).catch(() => undefined);
        }
    });

    it('Should create a scenario to hang notes off', async () => {
        const scenario = await make.scenarios.create({
            teamId: MAKE_TEAM,
            scheduling: '{"type":"on-demand"}',
            blueprint: `{"flow":[],"metadata":{},"name":"Note IT ${Date.now()}"}`,
        });

        expect(scenario.id).toBeDefined();
        scenarioId = scenario.id;
    });

    it('Should create a note', async () => {
        const note = await make.scenarioNotes.create(requireId(scenarioId, 'scenario'), {
            content: '<p>SDK integration test note</p>',
            metadata: { canvasPosition: { x: 10, y: 20 }, color: '#9138FE' },
            isFilterNote: false,
        });

        expect(note.id).toBeDefined();
        expect(note.scenarioId).toBe(scenarioId);
        expect(note.content).toBe('<p>SDK integration test note</p>');
        expect(note.metadata.color).toBe('#9138FE');
        expect(note.updated).toBeNull();
        noteId = note.id;
    });

    it('Should get the created note', async () => {
        const note = await make.scenarioNotes.get(requireId(scenarioId, 'scenario'), requireId(noteId, 'note'));

        expect(note.id).toBe(noteId);
        expect(note.createdByUser.id).toBeDefined();
    });

    it('Should list the scenario notes including the created one', async () => {
        const notes = await make.scenarioNotes.list(requireId(scenarioId, 'scenario'));

        expect(notes.some(note => note.id === noteId)).toBe(true);
    });

    it('Should update the note', async () => {
        const updated = await make.scenarioNotes.update(requireId(scenarioId, 'scenario'), requireId(noteId, 'note'), {
            content: '<p>SDK integration test note, edited</p>',
        });

        expect(updated.content).toBe('<p>SDK integration test note, edited</p>');
        expect(updated.updated).not.toBeNull();
    });

    it('Should delete the note and drop it from the list', async () => {
        const id = requireId(noteId, 'note');
        const targetScenarioId = requireId(scenarioId, 'scenario');

        const deletedId = await make.scenarioNotes.delete(targetScenarioId, id);
        expect(Number(deletedId)).toBe(id);

        const notes = await make.scenarioNotes.list(targetScenarioId);
        expect(notes.some(note => note.id === id)).toBe(false);
        noteId = undefined;
    });
});
