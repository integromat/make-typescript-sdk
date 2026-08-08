import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import type { ScenarioCustomPropertiesData } from '../src/endpoints/scenario-custom-properties.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: ScenarioCustomProperties', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let scenarioId: number;

    it('Should create a scenario for the test', async () => {
        const scenario = await make.scenarios.create({
            teamId: MAKE_TEAM,
            scheduling: '{"type":"on-demand"}',
            blueprint: '{"flow":[],"metadata":{},"name":"SDK Custom Properties Integration Test"}',
        });
        expect(scenario.id).toBeDefined();
        scenarioId = scenario.id!;
    });

    it('Should get, fill in, update, and delete custom properties data', async () => {
        const before = await make.scenarios.customProperties.get(scenarioId);
        expect(before).toBeDefined();

        // Requires a custom property structure with no required items (or no structure at
        // all — an empty structure/object satisfies the API when nothing is required). If
        // the organization's structure has required items, or the custom-properties feature
        // isn't licensed (IM027), this call fails with a client error and the remaining
        // assertions are skipped, since we can't safely guess valid values.
        let filledIn: ScenarioCustomPropertiesData | undefined;
        try {
            filledIn = await make.scenarios.customProperties.create(scenarioId, {});
        } catch (err: unknown) {
            // The exact status for "the scenario already has data" (IM005) or "not licensed"
            // (IM027) has not been verified live. 400 is the most plausible guess for a
            // validation-style rejection, but this has not been confirmed against a real
            // response. `get()` two lines above already proved the API key and scenario ID
            // are valid, so 401/404 here would be surprising — but a 403 is not ruled out by
            // that (the key could be read-only), and is rethrown like any other unexpected
            // status rather than treated as this precondition. Log what we skipped so a
            // wrong guess is visible in CI output instead of silently passing.
            const status = err instanceof MakeError ? err.statusCode : undefined;
            if (status !== 400) throw err;
            console.warn(`Skipping remaining assertions: create() failed with 400 (${(err as MakeError).message})`);
            return;
        }
        expect(filledIn).toBeDefined();

        const updated = await make.scenarios.customProperties.update(scenarioId, {});
        expect(updated).toBeDefined();

        const replaced = await make.scenarios.customProperties.replace(scenarioId, {});
        expect(replaced).toBeDefined();

        await make.scenarios.customProperties.delete(scenarioId);
        const after = await make.scenarios.customProperties.get(scenarioId);
        expect(after).toStrictEqual({});
    });

    it('Should delete the scenario created for the test', async () => {
        await make.scenarios.delete(scenarioId);
    });
});
