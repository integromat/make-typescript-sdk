import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import type { MakeError } from '../src/utils.js';

import * as executionsBlueprintMock from './mocks/executions/blueprint.json';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Executions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let scenarioId: number;
    let executionId: string;

    it('Should create a scenario to run', async () => {
        const scenario = await make.scenarios.create({
            teamId: MAKE_TEAM,
            scheduling: '{"type":"on-demand"}',
            blueprint: JSON.stringify(executionsBlueprintMock),
        });

        expect(scenario).toBeDefined();
        expect(scenario.id).toBeDefined();
        scenarioId = scenario.id!;
    });

    it('Should activate a scenario to run', async () => {
        const activated = await make.scenarios.activate(scenarioId);
        expect(activated).toBeTruthy();
    });

    it('Should run the scenario', async () => {
        const runResult = await make.scenarios.run(scenarioId, { name: 'John Doe' }, { responsive: true });
        expect(runResult).toBeDefined();
        expect(runResult.executionId).toBeDefined();
        expect(runResult.status).toBe(1);
        expect(runResult.outputs).toEqual({ greeting: 'Hello, John Doe!' });
        executionId = runResult.executionId;
    });

    it('Should get execution detail', async () => {
        let attempts = 5;
        while (attempts-- > 0) {
            try {
                const detail = await make.executions.getDetail(scenarioId, executionId);
                expect(detail).toBeDefined();
                expect(detail.status).toBe('SUCCESS');
                expect(detail.outputs).toEqual({ greeting: 'Hello, John Doe!' });
                return;
            } catch (err: unknown) {
                if ((err as MakeError)?.statusCode !== 404) throw err;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        throw new Error('Failed to fetch execution detail after multiple retries');
    });

    it('Cleanup: delete the scenario', async () => {
        await make.scenarios.delete(scenarioId);
        try {
            await make.scenarios.get(scenarioId);
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
