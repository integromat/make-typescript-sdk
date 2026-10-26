import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import type { FunctionV2RunDetail } from '../src/endpoints/functions-v2.js';

// Explicit opt-in: this workflow creates resources and executes code in an enabled test Team.
const enabled = process.env.MAKE_FUNCTIONS_V2_INTEGRATION === '1';
(enabled ? describe : describe.skip)('Integration: Functions v2 authoring', () => {
    const make = new Make(process.env.MAKE_API_KEY ?? '', process.env.MAKE_ZONE ?? 'make.local');
    const teamId = Number(process.env.MAKE_TEAM);
    const content = {
        source: 'export default async function main(input: unknown): Promise<unknown> { return input; }',
        inputSchema: {},
        outputSchema: {},
    };
    async function complete(runId: string): Promise<FunctionV2RunDetail> {
        const deadline = Date.now() + 90_000;
        while (Date.now() < deadline) {
            const run = await make.functionsV2.runs.get(runId);
            if (['succeeded', 'failed', 'timed_out', 'cancelled'].includes(run.status)) return run;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        throw new Error(`Run ${runId} is still pending. Retrieve it; do not resubmit.`);
    }
    it('discovers, creates, tests, publishes, activates, executes a selected version and removes', async () => {
        expect(teamId).toBeGreaterThan(0);
        const catalog = await make.functionsV2.endpoints.list(teamId);
        expect(catalog.catalogStatus).toBe('ready');
        const selected = catalog.endpoints
            .slice(0, 1)
            .map(({ appName, appVersion, endpointName }) => ({ appName, appVersion, endpointName }));
        const types = await make.functionsV2.endpoints.types({
            teamId,
            catalogId: catalog.catalogId,
            endpoints: selected,
        });
        expect(types.catalogStatus).toBe('ready');
        const created = await make.functionsV2.create(teamId, { name: `AX-46 integration ${Date.now()}`, content });
        const id = created.function.id;
        try {
            expect(created.etag).toBeDefined();
            const inline = await make.functionsV2.runs.createInline(teamId, {
                functionId: id,
                content,
                data: { echo: false },
                responsive: false,
            });
            expect(await complete(inline.id)).toMatchObject({ status: 'succeeded', output: { echo: false } });
            const published = await make.functionsV2.versions.publish(id, {
                content,
                expectedLatestVersion: created.function.latestVersion.version,
            });
            expect(await make.functionsV2.versions.get(id, published.version)).toMatchObject(content);
            const current = await make.functionsV2.get(id);
            const active = await make.functionsV2.activate(id, current.etag!);
            await expect(make.functionsV2.update(id, { name: 'Stale' }, current.etag!)).rejects.toMatchObject({
                statusCode: 412,
            });
            const run = await make.functionsV2.runs.create(id, {
                version: published.version,
                data: 0,
                responsive: false,
            });
            expect(await complete(run.id)).toMatchObject({ status: 'succeeded', output: 0 });
            await make.functionsV2.deactivate(id, active.etag!);
        } finally {
            const current = await make.functionsV2.get(id);
            await make.functionsV2.delete(id, current.etag!);
        }
    }, 240_000);
    it('requests cancellation separately and observes its terminal state', async () => {
        const submitted = await make.functionsV2.runs.createInline(teamId, {
            content: {
                ...content,
                source: 'export default async function main(): Promise<unknown> { while (true) { await Promise.resolve(); } }',
            },
            timeoutSeconds: 30,
            responsive: false,
        });
        const accepted = await make.functionsV2.runs.cancel(submitted.id);
        expect(['terminating', 'cancelled']).toContain(accepted.status);
        expect(await complete(submitted.id)).toHaveProperty('status', 'cancelled');
    }, 120_000);
});
