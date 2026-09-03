import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import type { HookIncoming, HookIncomingDetail } from '../src/endpoints/hook-incomings.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_HOOK_INCOMINGS_HOOK_ID = Number(process.env.MAKE_HOOK_INCOMINGS_HOOK_ID || 0);
const MAKE_HOOK_INCOMINGS_WEBHOOK_URL = String(process.env.MAKE_HOOK_INCOMINGS_WEBHOOK_URL || '');

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 30_000;
const LIST_OPTIONS = { pg: { limit: 10_000, offset: 0 } } as const;
const MARKER_FIELD = 'makeSdkHookIncomingsTestMarker';
const TEST_MARKERS = [`${randomUUID()}-specific`, `${randomUUID()}-bulk`] as const;
const TEST_MARKER_SET: ReadonlySet<string> = new Set(TEST_MARKERS);

const requirements = [
    ['MAKE_API_KEY', Boolean(MAKE_API_KEY)],
    ['MAKE_ZONE', Boolean(MAKE_ZONE)],
    ['MAKE_HOOK_INCOMINGS_HOOK_ID', Number.isInteger(MAKE_HOOK_INCOMINGS_HOOK_ID) && MAKE_HOOK_INCOMINGS_HOOK_ID > 0],
    ['MAKE_HOOK_INCOMINGS_WEBHOOK_URL', Boolean(MAKE_HOOK_INCOMINGS_WEBHOOK_URL)],
] as const;
const missingRequirements = requirements.filter(([, ready]) => !ready).map(([name]) => name);
const integrationReady = missingRequirements.length === 0;
const skipHint = integrationReady ? '' : ` — skipped; set ${missingRequirements.join(', ')} in .env`;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function payloadMarker(data: HookIncomingDetail['data']): string | undefined {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return undefined;

    const marker = data[MARKER_FIELD];
    return typeof marker === 'string' ? marker : undefined;
}

(integrationReady ? describe : describe.skip)(`Integration: Hook incomings${skipHint}`, () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let baselineIds = new Set<string>();
    let testIdsByMarker = new Map<string, string>();

    async function listAll(): Promise<HookIncoming[]> {
        return await make.hooks.incomings.list(MAKE_HOOK_INCOMINGS_HOOK_ID, LIST_OPTIONS);
    }

    async function findTestIds(): Promise<Map<string, string>> {
        const incomings = await listAll();
        const candidates = incomings.filter(incoming => !baselineIds.has(incoming.id));
        const found = new Map<string, string>();

        for (const candidate of candidates) {
            const detail = await make.hooks.incomings.get(MAKE_HOOK_INCOMINGS_HOOK_ID, candidate.id);
            const marker = payloadMarker(detail.data);

            if (marker !== undefined && TEST_MARKER_SET.has(marker)) {
                found.set(marker, candidate.id);
            }
        }

        return found;
    }

    async function waitForTestIds(): Promise<Map<string, string>> {
        const deadline = Date.now() + POLL_TIMEOUT_MS;

        while (Date.now() < deadline) {
            const found = await findTestIds();
            if (found.size === TEST_MARKERS.length) return found;
            await sleep(POLL_INTERVAL_MS);
        }

        throw new Error(`Timed out waiting for ${TEST_MARKERS.length} marked webhook deliveries to enter the queue`);
    }

    function requireTestId(marker: (typeof TEST_MARKERS)[number]): string {
        const id = testIdsByMarker.get(marker);
        if (!id) throw new Error(`Missing queued webhook delivery for marker ${marker}`);
        return id;
    }

    beforeAll(async () => {
        baselineIds = new Set((await listAll()).map(incoming => incoming.id));

        for (const marker of TEST_MARKERS) {
            const response = await fetch(MAKE_HOOK_INCOMINGS_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ [MARKER_FIELD]: marker }),
            });

            if (!response.ok) {
                throw new Error(`Webhook fixture rejected a test delivery with HTTP ${response.status}`);
            }
        }

        testIdsByMarker = await waitForTestIds();
    }, POLL_TIMEOUT_MS + 10_000);

    afterAll(async () => {
        const current = await listAll();
        const currentIds = new Set(current.map(incoming => incoming.id));
        const discovered = await findTestIds();
        const remainingTestIds = new Set(
            [...testIdsByMarker.values(), ...discovered.values()].filter(id => currentIds.has(id)),
        );

        if (remainingTestIds.size > 0) {
            await make.hooks.incomings.delete(MAKE_HOOK_INCOMINGS_HOOK_ID, {
                ids: [...remainingTestIds],
            });
        }
    }, POLL_TIMEOUT_MS);

    it('Should list the two queued fixture deliveries', async () => {
        const incomings = await listAll();

        expect(incomings.map(incoming => incoming.id)).toEqual(expect.arrayContaining([...testIdsByMarker.values()]));
    });

    it('Should report queue stats including the fixture deliveries', async () => {
        const stats = await make.hooks.incomings.stats(MAKE_HOOK_INCOMINGS_HOOK_ID);

        expect(stats.enabled).toBe(true);
        expect(stats.queue).toBeGreaterThanOrEqual(baselineIds.size + TEST_MARKERS.length);
        expect(stats.limit).toBeGreaterThanOrEqual(stats.queue);
    });

    it('Should get each fixture delivery with its payload data', async () => {
        const details = await Promise.all(
            TEST_MARKERS.map(marker => make.hooks.incomings.get(MAKE_HOOK_INCOMINGS_HOOK_ID, requireTestId(marker))),
        );

        expect(details.map(detail => payloadMarker(detail.data))).toStrictEqual(TEST_MARKERS);
        for (const detail of details) {
            expect(detail.isHookConfidential).not.toBe(true);
        }
    });

    it('Should delete a specific fixture delivery using IDs in the request body', async () => {
        const id = requireTestId(TEST_MARKERS[0]);
        const result = await make.hooks.incomings.delete(MAKE_HOOK_INCOMINGS_HOOK_ID, { ids: [id] });
        const remainingIds = new Set((await listAll()).map(incoming => incoming.id));

        expect(result.deletedIds).toContain(id);
        expect(remainingIds.has(id)).toBe(false);
        expect([...baselineIds].every(baselineId => remainingIds.has(baselineId))).toBe(true);
    });

    it('Should bulk-delete only the other fixture delivery with confirmation', async () => {
        const id = requireTestId(TEST_MARKERS[1]);
        const currentBeforeDelete = await listAll();
        const idsToPreserve = currentBeforeDelete.map(incoming => incoming.id).filter(currentId => currentId !== id);

        expect(currentBeforeDelete.some(incoming => incoming.id === id)).toBe(true);

        const result = await make.hooks.incomings.delete(MAKE_HOOK_INCOMINGS_HOOK_ID, {
            all: true,
            confirmed: true,
            exceptIds: idsToPreserve,
        });
        const remainingIds = new Set((await listAll()).map(incoming => incoming.id));

        expect(result.deletedIds).toStrictEqual([id]);
        expect(remainingIds.has(id)).toBe(false);
        expect(idsToPreserve.every(preservedId => remainingIds.has(preservedId))).toBe(true);
    });
});
