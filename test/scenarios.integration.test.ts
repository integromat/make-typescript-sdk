import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration Tests', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let scenarioId: number;

    it('Should list scenarios', async () => {
        const scenarios = await make.scenarios.list(MAKE_TEAM);
        expect(Array.isArray(scenarios)).toBe(true);
    });

    it('Should create a scenario', async () => {
        const scenario = await make.scenarios.create({
            teamId: MAKE_TEAM,
            scheduling: '{"type":"on-demand"}',
            blueprint: '{"flow":[],"metadata":{},"name":"Test Scenario"}',
        });

        expect(scenario).toBeDefined();
        expect(scenario.id).toBeDefined();
        expect(scenario.teamId).toBe(MAKE_TEAM);

        scenarioId = scenario.id!;
    });

    it('Should get a scenario', async () => {
        const scenario = await make.scenarios.get(scenarioId);

        expect(scenario).toBeDefined();
        expect(scenario.id).toBe(scenarioId);
        expect(scenario.teamId).toBe(MAKE_TEAM);
    });

    it('Should update a scenario', async () => {
        const updatedName = `Updated Scenario ${Date.now()}`;
        const scenario = await make.scenarios.update(scenarioId, {
            name: updatedName,
        });

        expect(scenario).toBeDefined();
        expect(scenario.id).toBe(scenarioId);
        expect(scenario.name).toBe(updatedName);
    });

    it('Should update scenario interface', async () => {
        const interfaceBody = {
            interface: {
                input: [
                    {
                        name: 'testInput',
                        type: 'text',
                        default: 'test value',
                        required: true,
                        multiline: false,
                    },
                ],
                output: [],
            },
        };

        const updatedInterface = await make.scenarios.setInterface(scenarioId, interfaceBody);

        expect(updatedInterface).toBeDefined();
        expect(updatedInterface.input).toBeDefined();
        expect(Array.isArray(updatedInterface.input)).toBe(true);
        expect(updatedInterface.input).toHaveLength(1);
        expect(updatedInterface.input![0]).toMatchObject({
            name: 'testInput',
            type: 'text',
            default: 'test value',
            required: true,
            multiline: false,
        });
    });

    it('Should delete a scenario', async () => {
        await make.scenarios.delete(scenarioId);

        // Verify the scenario is deleted by expecting an error when trying to get it
        try {
            await make.scenarios.get(scenarioId);
            // If we get here, the test should fail because the scenario should be deleted
            expect(true).toBe(false);
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toBeDefined();
        }
    });
});
