# Private Spaces SDK Support — Design

Date: 2026-07-27
Driver: [ORB-1919](https://make.atlassian.net/browse/ORB-1919) (MCP support of Private spaces), part of epic [ORB-843](https://make.atlassian.net/browse/ORB-843) (Private Spaces, Phase 1: Personal Teams)

## Background

A private space is a per-user personal workspace inside an organization. Under the hood it
is a team with `type: 'personal'`, but the platform exposes it through a dedicated
`/private-spaces` API. The endpoints were published in the Make OpenAPI docs (ORB-1914) and
received dedicated OAuth scopes `private-spaces:read` / `private-spaces:write` (ORB-1919).

Key platform facts that constrain this design:

- **No create/delete endpoints.** `POST /private-spaces` and `DELETE /private-spaces/{id}`
  existed during development but were removed (ORB-1061). Lifecycle is all-or-nothing per
  organization via `/organizations/{id}/private-spaces-settings` (out of scope here).
- **Feature-flagged and cloud-only.** When the org flag is off, endpoints fail with
  `IM903`. There is no way to provision a private space through the public API.
- The SDK already covers the two teams touchpoints: `includePrivateSpaces` on
  `teams.list()` and `Team.type` (`'personal' | 'standard'`).

## Scope

In scope (option A, agreed 2026-07-27):

1. New `PrivateSpaces` endpoint class: `list`, `get`, `update`.
2. New `private-spaces` tool definitions (3 tools).
3. `privateSpaces` field on the `Organization` type.
4. Registration (`make.ts`, `index.ts`, `src/tools.ts`), tests, mocks, README.

Out of scope (candidates for follow-up tickets):

- `GET`/`PATCH /organizations/{organizationId}/private-spaces-settings` (admin bulk
  operations; disabling auto-creation bulk-deletes all private spaces).
- `GET /users` list (not in the SDK at all) and its `privateSpace` col; `GET /users/by-permission`.
- Team-variables and llm-configuration route aliases mounted under `/private-spaces/{id}/…`.
- Phase 2 "Locked connections" ACL endpoints (flag-gated, not GA).

## API contract (verified against imt-web-api code and OpenAPI spec)

### GET /private-spaces — scope `private-spaces:read`

Query: `organizationId` (number, **required**), `externalId` (string, optional filter),
`cols[]`, `pg[sortBy|sortDir|offset|limit]` (sortable by `name` only).
Response: `{ privateSpaces: PrivateSpace[], pg }`.

Requires org permission `personal team manage`.

### GET /private-spaces/{privateSpaceId} — scope `private-spaces:read`

Query: `cols[]` — list cols plus `operations`, `transfer`, `centicredits` (usage totals
since last reset, computed from Elasticsearch, returned as strings; 503 when ES fails).
Response: `{ privateSpace }`.

Requires org permission `personal team own view`; non-admin callers must be a member of
the space, otherwise **404**.

### PATCH /private-spaces/{privateSpaceId} — scope `private-spaces:write`

Body: `{ operationsLimit?: number | null }` — min 0; `null` removes the limit
(unlimited); omitted = unchanged; `transferLimit` is derived server-side.
Query: `confirmed` (boolean) — **required (else `IM004`) when the new limit is below the
space's current consumption; confirming pauses the space.**
Response: `{ privateSpace }` including `deleted` and `externalId`.

Requires org permission `personal team manage`.

### PrivateSpace fields

| Field                    | Type            | Availability                         |
| ------------------------ | --------------- | ------------------------------------ |
| `id`                     | number          | default col                          |
| `name`                   | string          | default col                          |
| `organizationId`         | number          | default col                          |
| `globalAgentsEnabled`    | boolean         | default col                          |
| `type`                   | `'personal'`    | default col                          |
| `privateSpaceOwnerName`  | string          | default col                          |
| `privateSpaceOwnerEmail` | string          | default col                          |
| `privateSpaceOwnerId`    | number          | default col                          |
| `operationsLimit`        | number \| null  | cols; null = unlimited               |
| `transferLimit`          | string \| null  | cols; bytes                          |
| `consumedOperations`     | number \| null  | cols                                 |
| `consumedTransfer`       | string \| null  | cols                                 |
| `isPaused`               | boolean \| null | cols; paused due to exceeded limits  |
| `consumedCenticredits`   | number \| null  | cols                                 |
| `operations`             | string          | `get()` cols only (ES totals)        |
| `transfer`               | string          | `get()` cols only (ES totals)        |
| `centicredits`           | string          | `get()` cols only (ES totals)        |
| `deleted`                | boolean         | admin col; present in PATCH response |
| `externalId`             | string \| null  | admin col; present in PATCH response |

## Design

### 1. `src/endpoints/private-spaces.ts`

Follows the standard endpoint template (closest precedents: `teams.ts`, `scenarios.ts`).

Types (exported unless noted):

- `PrivateSpace` — **one entity type** for list/get/update. `id`, `name`,
  `organizationId` required; everything else optional. Get-only usage cols and
  admin/PATCH-only fields live on the same type with JSDoc noting availability.
  Decision: matches the `Team` convention (one entity type mixing list and detail
  fields); a split `PrivateSpaceWithUsage` type was considered and rejected as
  non-idiomatic for this repo.
- `ListPrivateSpacesOptions<C extends keyof PrivateSpace = never>` — `cols`, `pg`
  (`Partial<Pagination<PrivateSpace>>`), `externalId?: string`.
- `GetPrivateSpaceOptions<C extends keyof PrivateSpace = never>` — `cols`.
- `UpdatePrivateSpaceBody` — `{ operationsLimit?: number | null }`.
- `UpdatePrivateSpaceOptions` — `{ confirmed?: boolean }`.
- Internal (not exported): `ListPrivateSpacesResponse`, `GetPrivateSpaceResponse`,
  `UpdatePrivateSpaceResponse`.

Class `PrivateSpaces`:

- `list<C>(organizationId: number, options?: ListPrivateSpacesOptions<C>): Promise<PickColumns<PrivateSpace, C>[]>`
  — GET `/private-spaces` with query `{ organizationId, externalId, cols, pg }`.
- `get<C>(privateSpaceId: number, options?: GetPrivateSpaceOptions<C>): Promise<PickColumns<PrivateSpace, C>>`
  — GET `/private-spaces/{privateSpaceId}`.
- `update(privateSpaceId: number, body: UpdatePrivateSpaceBody, options?: UpdatePrivateSpaceOptions): Promise<PrivateSpace>`
  — PATCH with query `{ confirmed: options?.confirmed }`; signature follows
  `scenarios.update(id, body, { confirmed })`.

JSDoc documents: no create/delete (org-settings-driven lifecycle), the `confirmed`
trap, the 404-for-non-members behavior, and null-vs-omitted `operationsLimit` semantics.

### 2. `src/endpoints/private-spaces.tools.ts`

Category `private-spaces`. All tools set explicit `readOnlyHint` / `destructiveHint` /
`openWorldHint` and document state traps in descriptions (repo convention since WM-4172).

| Tool                    | Scope                  | scopeId / resourceId                | Hints                                      | Notes                                                                                                                                                                                                                                |
| ----------------------- | ---------------------- | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `private-spaces_list`   | `private-spaces:read`  | `organizationId` / —                | read-only                                  | Params: `organizationId` (required), `externalId`. Description: requires the org's private-spaces feature and `personal team manage` permission. Executes with `cols: ['*']`.                                                        |
| `private-spaces_get`    | `private-spaces:read`  | `privateSpaceId` / `privateSpaceId` | read-only                                  | Description: non-members receive 404; usage totals (`operations`, `transfer`, `centicredits`) come from analytics storage. Executes with `cols: ['*']`.                                                                              |
| `private-spaces_update` | `private-spaces:write` | `privateSpaceId` / `privateSpaceId` | not read-only, not destructive, idempotent | Params: `privateSpaceId` (required), `operationsLimit` (`type: ['number', 'null']`, null = unlimited), `confirmed` (boolean; description: required when lowering the limit below current consumption — confirming pauses the space). |

### 3. `src/endpoints/organizations.ts`

Add to `Organization`:

```ts
/** Private spaces the requesting user is a member of (cols-selectable; cloud only).
 *  `hasAdminVisibility` mirrors the organization's "add admins as observers" setting. */
privateSpaces?: { id: number; name: string; isOwner: boolean; hasAdminVisibility: boolean }[];
```

Type-only change; exercised by extending the organizations get mock + a cols assertion.

### 4. Registration and docs

- `src/make.ts`: import, `public readonly privateSpaces: PrivateSpaces`, constructor
  init, JSDoc.
- `src/index.ts`: export `PrivateSpace`, `PrivateSpaces`, `ListPrivateSpacesOptions`,
  `GetPrivateSpaceOptions`, `UpdatePrivateSpaceBody`, `UpdatePrivateSpaceOptions`.
- `src/tools.ts`: import and spread `PrivateSpacesTools` into `MakeTools`.
- `README.md`: add `privateSpaces` to the endpoint list and `private-spaces` to the tool
  categories.

## Testing

TDD throughout (red → green per behavior).

- `test/private-spaces.spec.ts` + `test/mocks/private-spaces/{list,get,update}.json`
  (realistic data matching the field table above):
    - list: response unwrapping; query assertion for `organizationId` and `externalId`.
    - list: column selection (`cols`) round-trip.
    - get: response unwrapping; get-only usage cols present in mock.
    - update: body assertion (`operationsLimit`, including `null`), `confirmed=true` in
      query, `content-type: application/json`.
- `test/organizations.spec.ts` + mock: extend get mock with `privateSpaces` and assert
  it round-trips.
- `test/private-spaces.integration.test.ts`: lists spaces for `MAKE_ORGANIZATION`;
  **skips gracefully when none exist** (no public API to provision one; feature is
  flag-gated). When a space exists: `get()` it, `update()` the operations limit and
  restore the original value.
- Coverage floor: ≥90% line/branch on touched files.

## Error handling

No special handling — `IM903` (feature disabled), `IM004` (confirmation required), 404
(non-member), and 503 (ES unavailable) bubble up as `MakeError`, per repo convention.
The tool descriptions carry the guidance instead.
