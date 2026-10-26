# Functions v2

`make.functionsV2` and the 17 `functions_v2_*` definitions in `MakeTools` expose the public `/functions/v2` API. Legacy `make.functions` remains independent. Functions v2 must be enabled for the caller's Team; complete authoring requires the AX-43 Endpoint catalog. All requests retain the caller's authorization and resource visibility.

Reads require `functions:read`. Creating, updating, publishing, executing and cancelling require `functions:write`. Both Endpoint catalog operations additionally require `apps:read`, including the read-only POST that returns declarations. MCP hosts must enforce that additional scope; the API also enforces it.

## Authoring

```typescript
import { Make, FunctionV2ExecutionUncertainError } from '@makehq/sdk';
const make = new Make(apiToken, zone);
const catalog = await make.functionsV2.endpoints.list(teamId);
const types = await make.functionsV2.endpoints.types({
    teamId,
    catalogId: catalog.catalogId,
    endpoints: catalog.endpoints
        .slice(0, 1)
        .map(({ appName, appVersion, endpointName }) => ({ appName, appVersion, endpointName })),
});
// Inspect catalogStatus, available and typeStatus before relying on declarations.
const content = {
    source: 'export default async function main(input: unknown): Promise<unknown> { return input; }',
    inputSchema: {},
    outputSchema: {},
};
const created = await make.functionsV2.create(teamId, { name: 'Echo', content });
const functionId = created.function.id;
const inline = await make.functionsV2.runs.createInline(teamId, {
    functionId,
    content,
    data: { value: false },
    responsive: false,
});
// Poll this ID until terminal, examining status, output and error.
const observation = await make.functionsV2.runs.get(inline.id);
const version = await make.functionsV2.versions.publish(functionId, {
    content,
    expectedLatestVersion: created.function.latestVersion.version,
});
const current = await make.functionsV2.get(functionId);
if (!current.etag) throw new Error('ETag missing; cannot activate safely');
const active = await make.functionsV2.activate(functionId, current.etag);
try {
    const admitted = await make.functionsV2.runs.create(functionId, {
        version: version.version,
        data: { value: false },
        responsive: false,
    });
    const result = await make.functionsV2.runs.get(admitted.id);
} catch (error) {
    if (error instanceof FunctionV2ExecutionUncertainError) {
        // Never automatically resubmit. An execution may already have side effects.
        if (error.runId) await make.functionsV2.runs.get(error.runId);
    } else {
        throw error;
    }
}
```

Creation publishes version 1 but leaves the Function inactive. Function reads include metadata and latest version contracts; `versions.get(functionId, version)` includes source. `update` edits name/description only. `versions.publish` changes source/contracts and checks `expectedLatestVersion`; it does not activate. List methods preserve `{ functions | versions | runs, pg }`, with filters and offset pagination matching the REST API.

## Concurrency and execution safety

Function reads and lifecycle mutations return `{ function, etag? }`. Pass the exact opaque ETag to `update`, `delete`, `activate` or `deactivate`. Missing tokens are refused locally. Stale writes are never silently refreshed or retried: read the current representation and decide how to resolve the conflict. Publishing uses its content-based contract rather than `If-Match`.

Every Functions v2 mutation disables SDK request retries, even if global retries are enabled. The generic fetch options now accept `retry: false` and a synchronous successful-response `onResponse(response)` callback, invoked before body decoding; callbacks must not consume the body.

Run submission returns an admitted Run with `responsive: false`; MCP executors always select this mode. SDK callers may use `{ responsive: true, maxWaitSeconds: 5 }`. Poll `runs.get` separately until `succeeded`, `failed`, `timed_out` or `cancelled`. Outputs may be any JSON value, including `null`, `false` and `0`; inspect status rather than truthiness. `runs.cancel` requests cancellation; a `terminating` response is not terminal. Deactivation leaves in-flight Runs running.

Inline testing is real execution, not a dry run. Declared Endpoints can change external systems. Run submission and publication are not idempotent. Runtime `retryPolicy` is separate from HTTP retries.

An explicit admission refusal (400/401/403/404/409/422/429) remains a `MakeError`. Transport failures, unreadable successful responses and ambiguous HTTP failures produce `FunctionV2ExecutionUncertainError`, with `sideEffectPossible: true`, code `FUNCTION_EXECUTION_UNCERTAIN`, and a `runId` only when one was observed. Retrieve a known ID; without one, reconcile before any manual resubmission. There is no backend idempotency guarantee. Structured API diagnostics remain available on `MakeError.apiError`; do not log them blindly or send source, inputs, outputs or credentials to telemetry.

## Live workflow test

In an enabled, disposable test Team with AX-43 available, set `MAKE_FUNCTIONS_V2_INTEGRATION=1`, `MAKE_API_KEY`, `MAKE_ZONE` and `MAKE_TEAM`, then run:

```sh
npm run test:integration -- --runTestsByPath test/functions-v2.integration.test.ts
```

The opt-in test creates/deletes a Function, tests inline execution, publishes, checks stale updates, activates, executes an exact version, retrieves output and deactivates. A separate test requests cancellation. It does not call external Endpoints. Do not re-run an uncertain submission automatically.
