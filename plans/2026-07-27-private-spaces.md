# Private Spaces SDK Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add private-spaces support to the Make TypeScript SDK: a `PrivateSpaces` endpoint class (`list`/`get`/`update`), matching tool definitions, and the `privateSpaces` field on `Organization`, per `specs/2026-07-27-private-spaces-design.md` (ORB-1919).

**Architecture:** One new endpoint file + one new tools file following the repo's exact endpoint template (closest precedents: `src/endpoints/teams.ts`, `src/endpoints/scenarios.ts` for the `confirmed` option). Registration in `make.ts`, `index.ts`, `src/tools.ts`. No create/delete methods — those API endpoints were removed upstream (ORB-1061).

**Tech Stack:** TypeScript (strict, ES modules with `.js` import extensions), Jest + jest-fetch-mock (`test/test.utils.ts` `mockFetch`), tsup build.

## Global Constraints

- TDD: write the failing test first, watch it fail for the right reason, then implement. Never modify a test to make the implementation pass.
- Strict typing: no `any`, no `@ts-ignore`. All public types/methods carry JSDoc.
- Imports always use `.js` extensions (`../types.js`, `./endpoints/private-spaces.js`).
- Internal response types (`*Response`) are NOT exported.
- Tool names: `private-spaces_list`, `private-spaces_get`, `private-spaces_update`; category `private-spaces`; scopes `private-spaces:read` / `private-spaces:write`. Every tool sets explicit `readOnlyHint`, `destructiveHint`, `openWorldHint`.
- The repo's `JSONSchema.type` is a single string union — nullable params use `oneOf: [{ type: 'number' }, { type: 'null' }]`, NOT `type: ['number', 'null']`.
- Do NOT add create/delete methods or tools for private spaces.
- `mockFetch` mock URLs must match the built URL exactly (query-param insertion order; `[` `]` encode as `%5B` `%5D`; `*` stays literal).
- Run a single spec file with: `npx jest --runInBand --forceExit --testMatch "**/test/<file>"`.
- Full suite: `npm test` (includes text coverage). Lint: `npm run lint`. Format: `npm run format`.
- Long test output goes to the scratchpad dir via `> file 2>&1`, never piped through `tail`/`grep` directly.
- Coverage floor: ≥90% line and branch on touched files.
- Every commit message ends with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Baseline before Task 1: run `npm test`, record pass count; every GREEN step must be baseline + new tests, no regressions.

---

### Task 1: `PrivateSpace` type, `PrivateSpaces.list()`, client registration

**Files:**

- Create: `src/endpoints/private-spaces.ts`
- Create: `test/mocks/private-spaces/list.json`
- Create: `test/private-spaces.spec.ts`
- Modify: `src/make.ts` (import ~line 20, property ~line 186, constructor ~line 281)

**Interfaces:**

- Consumes: `FetchFunction`, `Pagination`, `PickColumns` from `src/types.js` (existing).
- Produces: `PrivateSpace` type; `ListPrivateSpacesOptions<C>`; class `PrivateSpaces` with `list<C extends keyof PrivateSpace = never>(organizationId: number, options?: ListPrivateSpacesOptions<C>): Promise<PickColumns<PrivateSpace, C>[]>`; `make.privateSpaces: PrivateSpaces` on the `Make` client. Tasks 2–7 rely on all of these names exactly.

- [ ] **Step 1: Record the baseline**

Run: `npm test > /private/tmp/claude-501/-Users-jankulhavy-Projects-Make-make-typescript-sdk/767a9850-fc5b-4c6a-a17a-a686a8b29d30/scratchpad/baseline.txt 2>&1`
Then inspect the tail of that file for the totals line. Record the number of passing tests/suites.

- [ ] **Step 2: Create the list mock**

`test/mocks/private-spaces/list.json`:

```json
{
    "privateSpaces": [
        {
            "id": 101,
            "name": "Becca's space",
            "organizationId": 5,
            "globalAgentsEnabled": false,
            "type": "personal",
            "privateSpaceOwnerName": "Becca Smith",
            "privateSpaceOwnerEmail": "becca.smith@example.com",
            "privateSpaceOwnerId": 42
        },
        {
            "id": 102,
            "name": "Jan's space",
            "organizationId": 5,
            "globalAgentsEnabled": true,
            "type": "personal",
            "privateSpaceOwnerName": "Jan Novak",
            "privateSpaceOwnerEmail": "jan.novak@example.com",
            "privateSpaceOwnerId": 43
        }
    ],
    "pg": {
        "sortBy": "name",
        "sortDir": "asc",
        "offset": 0,
        "limit": 100
    }
}
```

- [ ] **Step 3: Write the failing tests**

`test/private-spaces.spec.ts`:

```typescript
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';
import type { PrivateSpace } from '../src/endpoints/private-spaces.js';

import * as privateSpacesListMock from './mocks/private-spaces/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: PrivateSpaces', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list private spaces', async () => {
        mockFetch('GET https://make.local/api/v2/private-spaces?organizationId=5', privateSpacesListMock);

        const result = await make.privateSpaces.list(5);

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should list private spaces filtered by externalId with pagination', async () => {
        mockFetch(
            'GET https://make.local/api/v2/private-spaces?organizationId=5&externalId=ext-1&pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc',
            privateSpacesListMock,
        );

        const result = await make.privateSpaces.list(5, {
            externalId: 'ext-1',
            pg: {
                sortBy: 'name',
                sortDir: 'asc',
            },
        });

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should list private spaces with selected columns', async () => {
        const cols: (keyof PrivateSpace)[] = ['id', 'name', 'isPaused'];
        mockFetch(
            `GET https://make.local/api/v2/private-spaces?organizationId=5&cols%5B%5D=${cols.join('&cols%5B%5D=')}`,
            privateSpacesListMock,
        );

        const result = await make.privateSpaces.list(5, {
            cols,
        });

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });
});
```

- [ ] **Step 4: Run the tests to verify they fail for the right reason**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.spec.ts"`
Expected: FAIL — cannot find module `'../src/endpoints/private-spaces.js'` (the module does not exist yet), and `make.privateSpaces` does not exist. Import/compile failure caused by the missing feature is the correct RED here; a typo in an existing path is not.

- [ ] **Step 5: Implement the endpoint file with `list()`**

`src/endpoints/private-spaces.ts`:

````typescript
import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a private space in Make.
 * A private space is a per-user personal workspace inside an organization where
 * scenarios and related entities (including connections) stay visible only to the
 * owner. Private spaces cannot be created or deleted through the API — they are
 * provisioned automatically based on the organization's private-spaces settings.
 */
export type PrivateSpace = {
    /** Unique identifier of the private space */
    id: number;
    /** Name of the private space */
    name: string;
    /** ID of the organization this private space belongs to */
    organizationId: number;
    /** Whether Make global AI agents are enabled for the space */
    globalAgentsEnabled?: boolean;
    /** Type of the underlying team; always `personal` for private spaces */
    type?: 'personal';
    /** Name of the space owner */
    privateSpaceOwnerName?: string;
    /** Email of the space owner */
    privateSpaceOwnerEmail?: string;
    /** User ID of the space owner */
    privateSpaceOwnerId?: number;
    /** Maximum operations limit; null means unlimited */
    operationsLimit?: number | null;
    /** Maximum data transfer limit in bytes; derived from the operations limit */
    transferLimit?: string | null;
    /** Number of operations consumed in the current period */
    consumedOperations?: number | null;
    /** Amount of data transfer consumed in the current period, in bytes */
    consumedTransfer?: string | null;
    /** Whether the space is paused due to exceeded limits */
    isPaused?: boolean | null;
    /** Number of centicredits consumed in the current period */
    consumedCenticredits?: number | null;
    /** Total operations since the last reset; only selectable via `cols` on `get()` */
    operations?: string;
    /** Total data transfer since the last reset, in bytes; only selectable via `cols` on `get()` */
    transfer?: string;
    /** Total centicredits since the last reset; only selectable via `cols` on `get()` */
    centicredits?: string;
    /** Whether the space is deleted; returned by `update()` */
    deleted?: boolean;
    /** External identifier of the space; returned by `update()` */
    externalId?: string | null;
};

/**
 * Options for listing private spaces.
 * @template C Keys of the PrivateSpace type to include in the response
 */
export type ListPrivateSpacesOptions<C extends keyof PrivateSpace = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options (the API supports sorting by `name` only) */
    pg?: Partial<Pagination<PrivateSpace>>;
    /** Filter spaces by their external ID */
    externalId?: string;
};

/**
 * Response format for listing private spaces.
 */
type ListPrivateSpacesResponse<C extends keyof PrivateSpace = never> = {
    /** List of private spaces matching the query */
    privateSpaces: PickColumns<PrivateSpace, C>[];
    /** Pagination information */
    pg: Pagination<PrivateSpace>;
};

/**
 * Class providing methods for working with Make private spaces.
 * Requires the organization's private-spaces feature to be enabled; the API
 * responds with error IM903 when it is not.
 */
export class PrivateSpaces {
    readonly #fetch: FetchFunction;

    /**
     * Create a new PrivateSpaces instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List private spaces of an organization.
     * Requires the `personal team manage` organization permission.
     * @param organizationId The organization ID to list private spaces for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of private spaces
     *
     * @example
     * ```typescript
     * const spaces = await make.privateSpaces.list(123);
     * ```
     */
    async list<C extends keyof PrivateSpace = never>(
        organizationId: number,
        options?: ListPrivateSpacesOptions<C>,
    ): Promise<PickColumns<PrivateSpace, C>[]> {
        return (
            await this.#fetch<ListPrivateSpacesResponse<C>>('/private-spaces', {
                query: {
                    organizationId,
                    externalId: options?.externalId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).privateSpaces;
    }
}
````

- [ ] **Step 6: Register the endpoint on the `Make` client**

In `src/make.ts`, three edits:

After the `PublicTemplates` import (line ~20):

```typescript
import { PrivateSpaces } from './endpoints/private-spaces.js';
```

After the `publicTemplates` property declaration (line ~186):

```typescript
/**
 * Access to private space endpoints.
 * Private spaces are per-user personal workspaces within an organization; they are
 * provisioned automatically and cannot be created or deleted through the API.
 */
public readonly privateSpaces: PrivateSpaces;
```

After `this.publicTemplates = new PublicTemplates(this.fetch.bind(this));` in the constructor (line ~281):

```typescript
this.privateSpaces = new PrivateSpaces(this.fetch.bind(this));
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.spec.ts"`
Expected: PASS (3 tests).

- [ ] **Step 8: Run lint and the full suite**

Run: `npm run lint && npm test > /private/tmp/claude-501/-Users-jankulhavy-Projects-Make-make-typescript-sdk/767a9850-fc5b-4c6a-a17a-a686a8b29d30/scratchpad/task1.txt 2>&1`
Inspect the file tail: totals must equal baseline + 3 new passing tests, zero failures.

- [ ] **Step 9: Commit**

```bash
git add src/endpoints/private-spaces.ts src/make.ts test/private-spaces.spec.ts test/mocks/private-spaces/list.json
git commit -m "feat(private-spaces): add PrivateSpaces endpoint with list() (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `PrivateSpaces.get()`

**Files:**

- Create: `test/mocks/private-spaces/get.json`
- Modify: `src/endpoints/private-spaces.ts` (add `GetPrivateSpaceOptions`, `GetPrivateSpaceResponse`, `get()`)
- Modify: `test/private-spaces.spec.ts` (extend the existing describe block)

**Interfaces:**

- Consumes: `PrivateSpace`, `PrivateSpaces` class from Task 1.
- Produces: `GetPrivateSpaceOptions<C>`; `get<C extends keyof PrivateSpace = never>(privateSpaceId: number, options?: GetPrivateSpaceOptions<C>): Promise<PickColumns<PrivateSpace, C>>`. Tasks 6–7 call `make.privateSpaces.get(...)` with this exact signature.

- [ ] **Step 1: Create the get mock**

`test/mocks/private-spaces/get.json` (includes the get-only usage columns):

```json
{
    "privateSpace": {
        "id": 101,
        "name": "Becca's space",
        "organizationId": 5,
        "globalAgentsEnabled": false,
        "type": "personal",
        "privateSpaceOwnerName": "Becca Smith",
        "privateSpaceOwnerEmail": "becca.smith@example.com",
        "privateSpaceOwnerId": 42,
        "operationsLimit": 1000,
        "transferLimit": "1073741824",
        "consumedOperations": 250,
        "consumedTransfer": "52428800",
        "isPaused": false,
        "consumedCenticredits": 12345,
        "operations": "250",
        "transfer": "52428800",
        "centicredits": "12345"
    }
}
```

- [ ] **Step 2: Write the failing tests**

Add to the describe block in `test/private-spaces.spec.ts` (and add the import at the top with the other mock imports):

```typescript
import * as privateSpaceGetMock from './mocks/private-spaces/get.json';
```

```typescript
it('Should get a private space', async () => {
    mockFetch('GET https://make.local/api/v2/private-spaces/101', privateSpaceGetMock);

    const result = await make.privateSpaces.get(101);

    expect(result).toStrictEqual(privateSpaceGetMock.privateSpace);
});

it('Should get a private space with usage columns', async () => {
    const cols: (keyof PrivateSpace)[] = ['id', 'operations', 'transfer', 'centicredits'];
    mockFetch(
        `GET https://make.local/api/v2/private-spaces/101?cols%5B%5D=${cols.join('&cols%5B%5D=')}`,
        privateSpaceGetMock,
    );

    const result = await make.privateSpaces.get(101, {
        cols,
    });

    expect(result).toStrictEqual(privateSpaceGetMock.privateSpace);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.spec.ts"`
Expected: FAIL — `make.privateSpaces.get` is not a function (TypeScript: property `get` does not exist on `PrivateSpaces`).

- [ ] **Step 4: Implement `get()`**

In `src/endpoints/private-spaces.ts`, add after `ListPrivateSpacesOptions`:

```typescript
/**
 * Options for retrieving a private space.
 * @template C Keys of the PrivateSpace type to include in the response
 */
export type GetPrivateSpaceOptions<C extends keyof PrivateSpace = never> = {
    /**
     * Specific columns/fields to include in the response. In addition to the list
     * columns, `get()` supports the usage totals `operations`, `transfer` and
     * `centicredits` (computed from analytics storage; the API responds with 503
     * when that storage is unavailable).
     */
    cols?: C[] | ['*'];
};
```

Add after `ListPrivateSpacesResponse`:

```typescript
/**
 * Response format for getting a private space.
 */
type GetPrivateSpaceResponse<C extends keyof PrivateSpace = never> = {
    /** The requested private space */
    privateSpace: PickColumns<PrivateSpace, C>;
};
```

Add to the `PrivateSpaces` class after `list()`:

````typescript
    /**
     * Get details of a specific private space.
     * Requires the `personal team own view` organization permission; callers who are
     * not members of the space receive a 404 even when the space exists.
     * @param privateSpaceId The private space ID to get
     * @param options Optional parameters for filtering returned fields
     * @returns Promise with the private space information
     *
     * @example
     * ```typescript
     * const space = await make.privateSpaces.get(101);
     * ```
     */
    async get<C extends keyof PrivateSpace = never>(
        privateSpaceId: number,
        options?: GetPrivateSpaceOptions<C>,
    ): Promise<PickColumns<PrivateSpace, C>> {
        return (
            await this.#fetch<GetPrivateSpaceResponse<C>>(`/private-spaces/${privateSpaceId}`, {
                query: {
                    cols: options?.cols,
                },
            })
        ).privateSpace;
    }
````

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.spec.ts"`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/endpoints/private-spaces.ts test/private-spaces.spec.ts test/mocks/private-spaces/get.json
git commit -m "feat(private-spaces): add get() with usage columns (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `PrivateSpaces.update()`

**Files:**

- Create: `test/mocks/private-spaces/update.json`
- Modify: `src/endpoints/private-spaces.ts` (add `UpdatePrivateSpaceBody`, `UpdatePrivateSpaceOptions`, `UpdatePrivateSpaceResponse`, `update()`)
- Modify: `test/private-spaces.spec.ts`

**Interfaces:**

- Consumes: `PrivateSpace`, `PrivateSpaces` class from Tasks 1–2.
- Produces: `UpdatePrivateSpaceBody = { operationsLimit?: number | null }`; `UpdatePrivateSpaceOptions = { confirmed?: boolean }`; `update(privateSpaceId: number, body: UpdatePrivateSpaceBody, options?: UpdatePrivateSpaceOptions): Promise<PrivateSpace>`. Tasks 6–7 call `make.privateSpaces.update(...)` with this exact signature.

- [ ] **Step 1: Create the update mock**

`test/mocks/private-spaces/update.json` (PATCH responses additionally include `deleted` and `externalId`; this one shows the confirmed-below-consumption outcome — space paused):

```json
{
    "privateSpace": {
        "id": 101,
        "name": "Becca's space",
        "organizationId": 5,
        "globalAgentsEnabled": false,
        "type": "personal",
        "privateSpaceOwnerName": "Becca Smith",
        "privateSpaceOwnerEmail": "becca.smith@example.com",
        "privateSpaceOwnerId": 42,
        "operationsLimit": 100,
        "transferLimit": "107374182",
        "consumedOperations": 250,
        "consumedTransfer": "52428800",
        "isPaused": true,
        "consumedCenticredits": 12345,
        "deleted": false,
        "externalId": null
    }
}
```

- [ ] **Step 2: Write the failing tests**

Add the mock import to `test/private-spaces.spec.ts`:

```typescript
import * as privateSpaceUpdateMock from './mocks/private-spaces/update.json';
```

Add to the describe block:

```typescript
it('Should update a private space', async () => {
    const body = {
        operationsLimit: 100,
    };

    mockFetch('PATCH https://make.local/api/v2/private-spaces/101', privateSpaceUpdateMock, req => {
        expect(req.body).toStrictEqual(body);
        expect(req.headers.get('content-type')).toBe('application/json');
    });

    const result = await make.privateSpaces.update(101, body);

    expect(result).toStrictEqual(privateSpaceUpdateMock.privateSpace);
});

it('Should update a private space with confirmation and null limit', async () => {
    const body = {
        operationsLimit: null,
    };

    mockFetch('PATCH https://make.local/api/v2/private-spaces/101?confirmed=true', privateSpaceUpdateMock, req => {
        expect(req.body).toStrictEqual(body);
    });

    const result = await make.privateSpaces.update(101, body, { confirmed: true });

    expect(result).toStrictEqual(privateSpaceUpdateMock.privateSpace);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.spec.ts"`
Expected: FAIL — `make.privateSpaces.update` is not a function.

- [ ] **Step 4: Implement `update()`**

In `src/endpoints/private-spaces.ts`, add after `GetPrivateSpaceOptions`:

```typescript
/**
 * Body for updating a private space.
 */
export type UpdatePrivateSpaceBody = {
    /**
     * Maximum operations limit (minimum 0). Set to `null` to remove the limit
     * (unlimited); omit to leave unchanged. The transfer limit is derived from
     * this value by the API.
     */
    operationsLimit?: number | null;
};

/**
 * Options for updating a private space.
 */
export type UpdatePrivateSpaceOptions = {
    /**
     * Confirmation of the update. Required (the API fails with IM004 otherwise)
     * when the new operations limit is below the space's current consumption;
     * confirming pauses the space.
     */
    confirmed?: boolean;
};
```

Add after `GetPrivateSpaceResponse`:

```typescript
/**
 * Response format for updating a private space.
 */
type UpdatePrivateSpaceResponse = {
    /** The updated private space */
    privateSpace: PrivateSpace;
};
```

Add to the `PrivateSpaces` class after `get()`:

````typescript
    /**
     * Update a private space.
     * Requires the `personal team manage` organization permission.
     * @param privateSpaceId The private space ID to update
     * @param body The fields to update
     * @param options Optional update options
     * @returns Promise with the updated private space
     *
     * @example
     * ```typescript
     * // Remove the operations limit
     * const space = await make.privateSpaces.update(101, { operationsLimit: null });
     * ```
     */
    async update(
        privateSpaceId: number,
        body: UpdatePrivateSpaceBody,
        options?: UpdatePrivateSpaceOptions,
    ): Promise<PrivateSpace> {
        return (
            await this.#fetch<UpdatePrivateSpaceResponse>(`/private-spaces/${privateSpaceId}`, {
                method: 'PATCH',
                query: {
                    confirmed: options?.confirmed,
                },
                body,
            })
        ).privateSpace;
    }
````

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.spec.ts"`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/endpoints/private-spaces.ts test/private-spaces.spec.ts test/mocks/private-spaces/update.json
git commit -m "feat(private-spaces): add update() with confirmed option (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `Organization.privateSpaces` field

**Files:**

- Modify: `src/endpoints/organizations.ts` (add field to the `Organization` type, after the `license` block ends, ~line 100+ — place it with the other optional top-level fields)
- Modify: `test/organizations.spec.ts` (extend the existing describe block)
- Modify: `test/mocks/organizations/get.json` (add `privateSpaces` to the organization object)

**Interfaces:**

- Consumes: existing `Organization` type and `organizations.list()` / `organizations.get()`.
- Produces: `Organization.privateSpaces?: { id: number; name: string; isOwner: boolean; hasAdminVisibility: boolean }[]` — selectable via `cols` because option types use `keyof Organization`.

- [ ] **Step 1: Write the failing test**

Add to the describe block in `test/organizations.spec.ts`:

```typescript
it('Should list organizations with the privateSpaces column', async () => {
    const cols: (keyof Organization)[] = ['id', 'name', 'privateSpaces'];
    mockFetch(
        `GET https://make.local/api/v2/organizations?cols%5B%5D=${cols.join('&cols%5B%5D=')}`,
        organizationsListMock,
    );

    const result = await make.organizations.list({
        cols,
    });

    expect(result).toStrictEqual(organizationsListMock.organizations);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/organizations.spec.ts"`
Expected: FAIL — TypeScript error: `'privateSpaces'` is not assignable to `keyof Organization` (the field does not exist yet).

- [ ] **Step 3: Add the field to the `Organization` type**

In `src/endpoints/organizations.ts`, inside the `Organization` type, after the `license` object closes (keep it alongside the other optional top-level fields):

```typescript
    /**
     * Private spaces the requesting user is a member of within this organization.
     * Only returned when requested via `cols`; available on public cloud only.
     */
    privateSpaces?: {
        /** Unique identifier of the private space */
        id: number;
        /** Name of the private space */
        name: string;
        /** Whether the requesting user owns the space */
        isOwner: boolean;
        /** Whether org admins can see into the space (mirrors the organization's "add admins as observers" setting) */
        hasAdminVisibility: boolean;
    }[];
```

- [ ] **Step 4: Extend the get mock so the field shape is exercised**

In `test/mocks/organizations/get.json`, add to the `organization` object (keep all existing fields):

```json
        "privateSpaces": [
            {
                "id": 101,
                "name": "Becca's space",
                "isOwner": true,
                "hasAdminVisibility": false
            }
        ]
```

- [ ] **Step 5: Run the organizations spec to verify all tests pass**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/organizations.spec.ts"`
Expected: PASS — the new cols test plus all pre-existing organization tests (the extended get mock must not break `Should get an organization with wait option`, which compares against the same mock object).

- [ ] **Step 6: Commit**

```bash
git add src/endpoints/organizations.ts test/organizations.spec.ts test/mocks/organizations/get.json
git commit -m "feat(organizations): add privateSpaces column to Organization type (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Public exports and README endpoint list

**Files:**

- Modify: `src/index.ts` (after the `public-templates.js` export block, ~line 202)
- Modify: `README.md` (endpoint list, ~line 66)

**Interfaces:**

- Consumes: all types from Tasks 1–3.
- Produces: package-level exports `PrivateSpace`, `PrivateSpaces`, `ListPrivateSpacesOptions`, `GetPrivateSpaceOptions`, `UpdatePrivateSpaceBody`, `UpdatePrivateSpaceOptions`.

- [ ] **Step 1: Add the type exports**

In `src/index.ts`, after the `public-templates.js` export block:

```typescript
export type {
    PrivateSpace,
    PrivateSpaces,
    ListPrivateSpacesOptions,
    GetPrivateSpaceOptions,
    UpdatePrivateSpaceBody,
    UpdatePrivateSpaceOptions,
} from './endpoints/private-spaces.js';
```

- [ ] **Step 2: Add the README endpoint bullet**

In `README.md`, in the endpoints list, insert between the `**Organizations**` and `**Scenarios**` bullets:

```markdown
- **Private Spaces** - Per-user private workspaces within an organization (list, get, update)
```

- [ ] **Step 3: Verify with lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no errors (tsc validates the export names exist).

- [ ] **Step 4: Commit**

```bash
git add src/index.ts README.md
git commit -m "feat(private-spaces): export public types and document endpoint (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Tool definitions

**Files:**

- Create: `src/endpoints/private-spaces.tools.ts`
- Create: `test/private-spaces-tools.spec.ts` (mirrors `test/on-prem-tools.spec.ts`)
- Modify: `src/tools.ts` (import after `PublicTemplatesTools` import ~line 31; spread after `...PublicTemplatesTools,` ~line 233)
- Modify: `README.md` (tool categories list, ~line 214)

**Interfaces:**

- Consumes: `make.privateSpaces.list/get/update` exactly as produced by Tasks 1–3; `MakeTool` type and `MakeTools` array from `src/tools.js`.
- Produces: tools `private-spaces_list`, `private-spaces_get`, `private-spaces_update` registered in `MakeTools`.

- [ ] **Step 1: Write the failing tests**

`test/private-spaces-tools.spec.ts`:

```typescript
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as privateSpacesListMock from './mocks/private-spaces/list.json';
import * as privateSpaceGetMock from './mocks/private-spaces/get.json';
import * as privateSpaceUpdateMock from './mocks/private-spaces/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const PRIVATE_SPACE_ID = 101;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: private-spaces', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute private-spaces_list', async () => {
        mockFetch(
            `GET https://make.local/api/v2/private-spaces?organizationId=${ORGANIZATION_ID}&cols%5B%5D=*`,
            privateSpacesListMock,
        );

        const tool = getTool('private-spaces_list');
        const result = await tool.execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(privateSpacesListMock.privateSpaces);
    });

    it('Should execute private-spaces_get', async () => {
        mockFetch(`GET https://make.local/api/v2/private-spaces/${PRIVATE_SPACE_ID}?cols%5B%5D=*`, privateSpaceGetMock);

        const tool = getTool('private-spaces_get');
        const result = await tool.execute(make, { privateSpaceId: PRIVATE_SPACE_ID });

        expect(result).toStrictEqual(privateSpaceGetMock.privateSpace);
    });

    it('Should execute private-spaces_update', async () => {
        mockFetch(
            `PATCH https://make.local/api/v2/private-spaces/${PRIVATE_SPACE_ID}?confirmed=true`,
            privateSpaceUpdateMock,
            req => {
                expect(req.body).toStrictEqual({ operationsLimit: 100 });
            },
        );

        const tool = getTool('private-spaces_update');
        const result = await tool.execute(make, {
            privateSpaceId: PRIVATE_SPACE_ID,
            operationsLimit: 100,
            confirmed: true,
        });

        expect(result).toStrictEqual(privateSpaceUpdateMock.privateSpace);
    });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces-tools.spec.ts"`
Expected: FAIL — `Missing MCP tool: private-spaces_list` (the tools are not defined/registered yet).

- [ ] **Step 3: Implement the tools file**

`src/endpoints/private-spaces.tools.ts`:

```typescript
import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'private-spaces_list',
        title: 'List private spaces',
        description:
            "List the private spaces of an organization. Requires the organization's private-spaces feature to be enabled (error IM903 otherwise) and the 'personal team manage' permission. Private spaces cannot be created or deleted through the API — they are provisioned automatically by organization settings.",
        category: 'private-spaces',
        scope: 'private-spaces:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to list private spaces for' },
                externalId: { type: 'string', description: 'Filter private spaces by their external ID' },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 5 }, { organizationId: 5, externalId: 'ext-1' }],
        execute: async (make: Make, args: { organizationId: number; externalId?: string }) => {
            const { organizationId, ...options } = args;
            return await make.privateSpaces.list(organizationId, { ...options, cols: ['*'] });
        },
    },
    {
        name: 'private-spaces_get',
        title: 'Get private space',
        description:
            'Get details of a specific private space, including usage totals (operations, transfer, centicredits). Callers who are not members of the space receive a 404 even when the space exists.',
        category: 'private-spaces',
        scope: 'private-spaces:read',
        scopeId: 'privateSpaceId',
        identifier: 'privateSpaceId',
        resourceId: 'privateSpaceId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                privateSpaceId: { type: 'number', description: 'The private space ID to retrieve' },
            },
            required: ['privateSpaceId'],
        },
        examples: [{ privateSpaceId: 101 }],
        execute: async (make: Make, args: { privateSpaceId: number }) => {
            return await make.privateSpaces.get(args.privateSpaceId, { cols: ['*'] });
        },
    },
    {
        name: 'private-spaces_update',
        title: 'Update private space',
        description:
            "Update a private space's operations limit. Set operationsLimit to null to remove the limit (unlimited); the transfer limit is derived automatically. When the new limit is below the space's current consumption the call fails with IM004 unless 'confirmed' is true — confirming pauses the space.",
        category: 'private-spaces',
        scope: 'private-spaces:write',
        scopeId: 'privateSpaceId',
        identifier: 'privateSpaceId',
        resourceId: 'privateSpaceId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                privateSpaceId: { type: 'number', description: 'The private space ID to update' },
                operationsLimit: {
                    oneOf: [{ type: 'number' }, { type: 'null' }],
                    description:
                        'Maximum operations limit (minimum 0). Pass null to remove the limit; omit to leave unchanged.',
                },
                confirmed: {
                    type: 'boolean',
                    description:
                        "Confirmation of the update. Required when the new limit is below the space's current consumption; confirming pauses the space.",
                },
            },
            required: ['privateSpaceId'],
        },
        examples: [
            { privateSpaceId: 101, operationsLimit: 10000 },
            { privateSpaceId: 101, operationsLimit: null, confirmed: true },
        ],
        execute: async (
            make: Make,
            args: { privateSpaceId: number; operationsLimit?: number | null; confirmed?: boolean },
        ) => {
            const { privateSpaceId, confirmed, ...body } = args;
            return await make.privateSpaces.update(privateSpaceId, body, { confirmed });
        },
    },
];
```

- [ ] **Step 4: Register the tools**

In `src/tools.ts`, after the `PublicTemplatesTools` import:

```typescript
import { tools as PrivateSpacesTools } from './endpoints/private-spaces.tools.js';
```

In the `MakeTools` array, after `...PublicTemplatesTools,`:

```typescript
    ...PrivateSpacesTools,
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces-tools.spec.ts"`
Expected: PASS (3 tests).

- [ ] **Step 6: Add the README tool category**

In `README.md`, in the tool categories list, insert between `- \`organizations\``and`- \`scenarios\``:

```markdown
- `private-spaces`
```

- [ ] **Step 7: Run lint and the full suite**

Run: `npm run lint && npm test > /private/tmp/claude-501/-Users-jankulhavy-Projects-Make-make-typescript-sdk/767a9850-fc5b-4c6a-a17a-a686a8b29d30/scratchpad/task6.txt 2>&1`
Inspect the file tail: all tests green (baseline + 11 new across Tasks 1–6: 7 endpoint + 1 organizations + 3 tools), zero failures.

- [ ] **Step 8: Commit**

```bash
git add src/endpoints/private-spaces.tools.ts src/tools.ts test/private-spaces-tools.spec.ts README.md
git commit -m "feat(private-spaces): add tool definitions (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Integration test

**Files:**

- Create: `test/private-spaces.integration.test.ts`

**Interfaces:**

- Consumes: `make.privateSpaces.list/get/update` from Tasks 1–3; env vars `MAKE_API_KEY`, `MAKE_ZONE`, `MAKE_ORGANIZATION` from `.env`.
- Produces: nothing consumed later.

Integration tests run only via `npm run test:integration` (separate testMatch), so this file never affects `npm test`. There is no public API to provision a private space and the feature is flag-gated per org, so every test after the list guards with an early return when no space exists.

- [ ] **Step 1: Write the integration test**

`test/private-spaces.integration.test.ts`:

```typescript
import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

describe('Integration: PrivateSpaces', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let privateSpaceId: number | undefined;
    let originalOperationsLimit: number | null | undefined;
    let consumedOperations: number | null | undefined;

    it('Should list private spaces', async () => {
        const spaces = await make.privateSpaces.list(MAKE_ORGANIZATION);

        expect(Array.isArray(spaces)).toBe(true);

        // No public API can provision a private space, so downstream tests are
        // skipped (early return) when the organization has none.
        privateSpaceId = spaces[0]?.id;
    });

    it('Should get a private space', async () => {
        if (privateSpaceId === undefined) return;

        const space = await make.privateSpaces.get(privateSpaceId, { cols: ['*'] });

        expect(space.id).toBe(privateSpaceId);
        expect(space.organizationId).toBe(MAKE_ORGANIZATION);
        expect(space.type).toBe('personal');

        originalOperationsLimit = space.operationsLimit;
        consumedOperations = space.consumedOperations;
    });

    it('Should update a private space and restore the original limit', async () => {
        if (privateSpaceId === undefined) return;

        // Stay above current consumption so the update needs no confirmation
        // and cannot pause the space.
        const safeLimit = Math.max(consumedOperations ?? 0, originalOperationsLimit ?? 0) + 10000;

        const updated = await make.privateSpaces.update(privateSpaceId, { operationsLimit: safeLimit });
        expect(updated.operationsLimit).toBe(safeLimit);

        const restored = await make.privateSpaces.update(
            privateSpaceId,
            { operationsLimit: originalOperationsLimit ?? null },
            { confirmed: true },
        );
        expect(restored.operationsLimit).toBe(originalOperationsLimit ?? null);
    });
});
```

- [ ] **Step 2: Verify it compiles and does not leak into the unit suite**

Run: `npm run lint`
Expected: PASS.
Run: `npx jest --runInBand --forceExit --testMatch "**/test/**/*.spec.ts" --listTests | grep private-spaces`
Expected: only `test/private-spaces.spec.ts` and `test/private-spaces-tools.spec.ts` — NOT the integration file.

- [ ] **Step 3: Run the integration test if `.env` is configured (skip this step when `.env` is absent)**

Run: `npx jest --runInBand --forceExit --testMatch "**/test/private-spaces.integration.test.ts" > /private/tmp/claude-501/-Users-jankulhavy-Projects-Make-make-typescript-sdk/767a9850-fc5b-4c6a-a17a-a686a8b29d30/scratchpad/task7.txt 2>&1`
Inspect the file: PASS, or an environment-related failure (missing env/feature flag) — report which. Do not mark this plan complete with an unexplained integration failure.

- [ ] **Step 4: Commit**

```bash
git add test/private-spaces.integration.test.ts
git commit -m "test(private-spaces): add integration tests (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Final verification

**Files:** none new — verification only.

- [ ] **Step 1: Full unit suite with coverage**

Run: `npm test > /private/tmp/claude-501/-Users-jankulhavy-Projects-Make-make-typescript-sdk/767a9850-fc5b-4c6a-a17a-a686a8b29d30/scratchpad/final.txt 2>&1`
Inspect the file: zero failures; totals = baseline + 11 new tests. Read the coverage table rows for `private-spaces.ts`, `private-spaces.tools.ts`, `organizations.ts`, `make.ts`, `tools.ts`: each touched file must be ≥90% lines and branches. If below, add the missing test before proceeding (never assertion-free filler).

- [ ] **Step 2: Lint, format, build**

Run: `npm run lint && npm run format && npm run build`
Expected: all pass; `git status` after format shows no unexpected reformat of untouched files (if prettier changed only files from this plan, amend them into a `style:` commit or fold into Step 4).

- [ ] **Step 3: README cross-check against the repo checklist**

Confirm `README.md` shows the **Private Spaces** endpoint bullet (Task 5) and the `private-spaces` tool category (Task 6). Confirm no other README section (environment variables, configuration) is affected — this change adds no env vars or config options.

- [ ] **Step 4: Commit any remaining changes and report**

```bash
git status --short
```

If anything is uncommitted from steps above, commit it:

```bash
git add -A -- ':!test-public-templates.ts'
git commit -m "chore(private-spaces): formatting and verification follow-ups (ORB-1919)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Note: `test-public-templates.ts` in the repo root is an unrelated untracked scratch script — never stage it.

Report: baseline vs final test counts, coverage numbers for the five touched files, lint/build status.
