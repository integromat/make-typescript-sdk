/**
 * Local end-to-end check of the Data Tables SDK endpoints (PR #101) against a
 * locally running make-datastore service. NOT part of the test suite — run by hand.
 *
 * What it needs:
 *   1. make-datastore running locally (`npm run dev` in ../make-datastore, port 3123)
 *      with Postgres up and migrated (`docker compose up -d && npm run db:init`).
 *   2. The service's .env must have the web-api -> data-tables inbound secret pair
 *      (INTEGROMAT_ISC_WEB_API_DATA_TABLES_SECRET_NAME/VALUE, see .env.example) and
 *      INTEGROMAT_ISC_WEB_API_URN=http://localhost:3017 pointing at the permissions
 *      mock this script hosts (user-identity routes check permissions against web-api).
 *
 * Run from the SDK repo root:
 *   npx tsx scripts/local-data-tables-e2e.mts
 *
 * Optional env: DT_URN (default http://localhost:3123), ISC_SECRET_NAME (default
 * isc-web-api-data-tables), ISC_SECRET_VALUE (default snehurka), TEAM_ID (default 1),
 * MOCK_WEB_API_PORT (default 3017).
 */

import { createServer } from 'node:http';

// Real ISC client, borrowed from the service repo's node_modules (the SDK has no
// dependency on it) — signs requests exactly like web-api does in production.
// eslint-disable-next-line import/no-relative-packages
import { JwtAuthFastify } from '../../make-datastore/node_modules/@integromat/isc/esm/fastify.js';

import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import type { DataTableFilter } from '../src/endpoints/data-table-records.js';

const DT_URN = process.env.DT_URN ?? 'http://localhost:3123';
const ISC_SECRET_NAME = process.env.ISC_SECRET_NAME ?? 'isc-web-api-data-tables';
const ISC_SECRET_VALUE = process.env.ISC_SECRET_VALUE ?? 'snehurka';
const TEAM_ID = Number(process.env.TEAM_ID ?? 1);
const MOCK_WEB_API_PORT = Number(process.env.MOCK_WEB_API_PORT ?? 3017);

/** The user identity attached to every signed call ({id, email, scope[]} is required). */
const USER = { id: 1, email: 'local-e2e@make.com', scope: ['data-tables:read', 'data-tables:write'] };

const caller = new JwtAuthFastify('web-api', {
    secrets: [],
    services: [{ name: 'data-tables', urn: DT_URN, secretName: ISC_SECRET_NAME, secretValue: ISC_SECRET_VALUE }],
});

/**
 * Make client that reroutes every request to the local service: the SDK builds
 * http://{zone}/api/v2/... URLs, we rewrite the path to the service's /v1 mount and
 * send it through the ISC caller (which signs the JWT and prefixes /internal).
 */
class LocalMake extends Make {
    protected override async handleRequest(url: string, options?: RequestInit): Promise<Response> {
        const parsed = new URL(url);
        const path = parsed.pathname.replace(/^\/api\/v2/, '/v1') + parsed.search;
        return await caller.call(
            'data-tables',
            path,
            {
                method: options?.method ?? 'GET',
                headers: options?.headers as Record<string, string>,
                body: options?.body as string | undefined,
            },
            USER,
        );
    }

    // The service answers errors as {error, detail} — surface the whole body instead of
    // the SDK's {message}-shaped parsing, which falls back to a bare status text here.
    protected override async handleError(response: Response): Promise<MakeError> {
        const body = await response.clone().text();
        return new MakeError(`${response.status} ${response.statusText}: ${body}`, response.status);
    }
}

/** Mock of web-api's permission check endpoint — allows everything. */
function startPermissionsMock(): Promise<(() => void) | null> {
    return new Promise(resolve => {
        const server = createServer((req, res) => {
            if (req.method === 'POST' && req.url?.startsWith('/internal/v2/permissions/check')) {
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ hasPermission: true }));
                return;
            }
            res.writeHead(404).end();
        });
        server.once('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`! port ${MOCK_WEB_API_PORT} is taken — assuming a real web-api is running there`);
                resolve(null);
                return;
            }
            throw err;
        });
        server.listen(MOCK_WEB_API_PORT, () => resolve(() => server.close()));
    });
}

let passed = 0;
let failed = 0;

async function step(name: string, fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
        passed++;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed++;
        console.error(`✗ ${name}`);
        console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    }
}

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

const make = new LocalMake('unused-token', 'localhost');
make.protocol = 'http';

const stopMock = await startPermissionsMock();
let tableId: number | undefined;

try {
    const tableName = `sdk-e2e-${Date.now()}`;

    await step('data-tables: create', async () => {
        const table = await make.dataTables.create({ teamId: TEAM_ID, name: tableName });
        assert(typeof table.id === 'number', `expected numeric id, got ${JSON.stringify(table)}`);
        tableId = table.id;
    });
    assert(tableId !== undefined, 'cannot continue without a table');

    await step('data-tables: list contains the table', async () => {
        const tables = await make.dataTables.list(TEAM_ID);
        assert(
            tables.some(t => t.id === tableId),
            'created table not found in list',
        );
    });

    await step('data-tables: get', async () => {
        const table = await make.dataTables.get(tableId!);
        assert(table.name === tableName, `expected name ${tableName}, got ${table.name}`);
    });

    await step('data-tables: update (rename)', async () => {
        const table = await make.dataTables.update(tableId!, { name: `${tableName}-renamed` });
        assert(table.name === `${tableName}-renamed`, `rename did not stick: ${table.name}`);
    });

    // --- columns (exercises the unrolled items/fields schemas) ---

    const columnIds: number[] = [];

    await step('columns: create text/number/select/array/collection', async () => {
        const defs = [
            { name: 'status', type: 'single_select' as const, options: [{ id: 'active', label: 'Active' }, { id: 'inactive', label: 'Inactive' }] },
            { name: 'age', type: 'number' as const },
            { name: 'note', type: 'text' as const },
            { name: 'tags', type: 'array' as const, items: { type: 'text' as const } },
            {
                name: 'address',
                type: 'collection' as const,
                fields: [
                    { name: 'street', type: 'text' as const, required: true },
                    { name: 'city', type: 'text' as const, required: true },
                ],
            },
        ];
        for (const def of defs) {
            const column = await make.dataTables.columns.create(tableId!, def);
            assert(typeof column.id === 'number', `no id for column ${def.name}`);
            columnIds.push(column.id);
        }
    });

    await step('columns: list + get', async () => {
        const columns = await make.dataTables.columns.list(tableId!);
        assert(columns.length >= 5, `expected >= 5 columns, got ${columns.length}`);

        const first = await make.dataTables.columns.get(tableId!, columnIds[0]!);
        assert(first.name === 'status', `expected status, got ${first.name}`);
    });

    await step('columns: update (rename a scratch column)', async () => {
        const scratch = await make.dataTables.columns.create(tableId!, { name: 'scratch', type: 'text' });
        const renamed = await make.dataTables.columns.update(tableId!, scratch.id, { name: 'scratch-renamed' });
        assert(renamed.name === 'scratch-renamed', `rename did not stick: ${renamed.name}`);
        await make.dataTables.columns.delete(tableId!, scratch.id);
    });

    await step('columns: reorder', async () => {
        // the body must name ALL unlocked columns, incl. any auto-created ones
        const unlocked = (await make.dataTables.columns.list(tableId!)).filter(c => !c.locked);
        const reordered = await make.dataTables.columns.reorder(tableId!, unlocked.map(c => c.id).reverse());
        assert(reordered.length >= unlocked.length, 'reorder returned fewer columns than expected');
    });

    // --- records (exercises the key-encoding fix and the filter fixes) ---

    const NASTY_KEY = 'a/b?c#d';

    await step(`records: create/get/exists/update/delete with key "${NASTY_KEY}" (encoding fix)`, async () => {
        await make.dataTables.records.create(tableId!, { key: NASTY_KEY, data: { note: 'tricky', age: 1 } });
        // also create the record a plain "a" — before the fix, get/delete of "a?..." hit this one
        await make.dataTables.records.create(tableId!, { key: 'a', data: { note: 'decoy', age: 2 } });

        const fetched = await make.dataTables.records.get(tableId!, NASTY_KEY);
        assert(fetched.key === NASTY_KEY, `got record "${fetched.key}" instead of "${NASTY_KEY}"`);

        assert(await make.dataTables.records.exists(tableId!, NASTY_KEY), 'exists() returned false');

        const updated = await make.dataTables.records.update(tableId!, NASTY_KEY, { note: 'tricky-updated' });
        assert(updated.key === NASTY_KEY, `update hit record "${updated.key}"`);

        await make.dataTables.records.delete(tableId!, NASTY_KEY);
        assert(!(await make.dataTables.records.exists(tableId!, NASTY_KEY)), 'record survived delete');

        const decoy = await make.dataTables.records.get(tableId!, 'a');
        assert(decoy.data['note'] === 'decoy', 'the decoy record "a" was clobbered — encoding broken');
    });

    await step('records: createMany + updateMany', async () => {
        const created = await make.dataTables.records.createMany(tableId!, {
            records: [
                { key: 'customer-1', data: { note: 'one', age: 30, status: 'active' } },
                { key: 'customer-2', data: { note: 'two', age: 20, status: 'inactive' } },
            ],
        });
        assert(created.length === 2, `expected 2 created, got ${created.length}`);

        const updated = await make.dataTables.records.updateMany(tableId!, [
            { key: 'customer-1', data: { age: 31 } },
        ]);
        assert(updated.length === 1, `expected 1 updated, got ${updated.length}`);
    });

    await step('records: list with structured DataTableFilter (filter fix)', async () => {
        const filter: DataTableFilter = [[{ columnName: 'age', operator: 'number:greater', value: 25 }]];
        const records = await make.dataTables.records.list(tableId!, { filter });
        assert(
            records.some(r => r.key === 'customer-1') && !records.some(r => r.key === 'customer-2'),
            `filter returned wrong records: ${records.map(r => r.key).join(', ')}`,
        );
    });

    await step('records: validateQuery with filter array (validate fix)', async () => {
        const valid = await make.dataTables.records.validateQuery(tableId!, {
            filter: [
                [
                    { columnName: 'status', operator: 'text:equal', value: 'active' },
                    { columnName: 'age', operator: 'number:greater', value: 18 },
                ],
                [{ columnName: 'note', operator: 'exist' }],
            ],
        });
        assert(valid.valid === true, `expected valid filter, got ${JSON.stringify(valid)}`);

        const invalid = await make.dataTables.records.validateQuery(tableId!, {
            filter: [[{ columnName: 'no-such-column', operator: 'text:equal', value: 'x' }]],
        });
        assert(invalid.valid === false, `expected invalid filter, got ${JSON.stringify(invalid)}`);
    });

    await step('records: deleteMany', async () => {
        const keys = await make.dataTables.records.deleteMany(tableId!, ['customer-1', 'customer-2', 'a']);
        assert(keys.length === 3, `expected 3 deleted keys, got ${JSON.stringify(keys)}`);
    });

    await step('columns: delete', async () => {
        await make.dataTables.columns.delete(tableId!, columnIds[2]!);
        const columns = await make.dataTables.columns.list(tableId!);
        assert(!columns.some(c => c.id === columnIds[2]), 'column survived delete');
    });
} finally {
    if (tableId !== undefined) {
        await step('data-tables: delete (cleanup)', async () => {
            await make.dataTables.delete(tableId!);
        });
    }
    stopMock?.();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
