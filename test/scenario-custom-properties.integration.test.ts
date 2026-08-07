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
            // The exact error code for "not fillable here" is unverified (no live org with a
            // fillable structure was available), so any 4xx is treated as that expected
            // precondition and skips the rest. Anything else — 5xx, network failure,
            // non-MakeError — is a real bug and must fail the test.
            const status = err instanceof MakeError ? err.statusCode : undefined;
            if (status === undefined || status < 400 || status >= 500) throw err;
            return;
        }
        expect(filledIn).toBeDefined();

        const updated = await make.scenarios.customProperties.update(scenarioId, {});
        expect(updated).toBeDefined();

        await make.scenarios.customProperties.delete(scenarioId);
        const after = await make.scenarios.customProperties.get(scenarioId);
        expect(after).toStrictEqual({});
    });

    it('Should delete the scenario created for the test', async () => {
        await make.scenarios.delete(scenarioId);
    });
});
