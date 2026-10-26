import type { FetchFunction, FetchOptions, JSONValue } from '../types.js';
import { MakeError } from '../utils.js';

/** A JSON Schema document accepted by the Functions service. */
export type FunctionV2Schema = Record<string, JSONValue>;
/** An Endpoint a Function is allowed to call. */
export type FunctionV2Endpoint = {
    alias: string;
    appName: string;
    appVersion: number;
    endpointName: string;
    connectionKey?: string;
};
/** Source and contracts for an immutable Function version or an inline Run. */
export type FunctionV2Content = {
    source: string;
    inputSchema: FunctionV2Schema;
    outputSchema?: FunctionV2Schema;
    connections?: Record<string, number>;
    endpoints?: FunctionV2Endpoint[];
    retryPolicy?: { maximumAttempts: number };
};
/** Published version metadata; retrieve the version to read its source. */
export type FunctionV2VersionSummary = Required<Omit<FunctionV2Content, 'source'>> & {
    version: number;
    createdAt: string;
};
/** An immutable published Function version. */
export type FunctionV2Version = FunctionV2VersionSummary & { source: string };
/** Function metadata. New Functions are inactive and already have version 1. */
export type FunctionV2 = {
    id: number;
    teamId: number;
    name: string;
    description?: string | null;
    active: boolean;
    latestVersion: FunctionV2VersionSummary;
    createdAt: string;
    updatedAt: string;
};
/** Function representation and its opaque optimistic-concurrency token. */
export type FunctionV2Representation = { function: FunctionV2; etag?: string };
/** Offset pagination as returned by Functions v2. */
export type FunctionV2Pagination = { limit: number; offset: number; sortBy: string; sortDir: 'asc' | 'desc' };
/** Pagination request restricted to the resource's supported sort key. */
export type FunctionV2PageOptions<Sort extends string> = {
    pg?: Partial<Omit<FunctionV2Pagination, 'sortBy'>> & { sortBy?: Sort };
};
/** Function collection filters. */
export type ListFunctionsV2Options = FunctionV2PageOptions<'id'> & {
    ids?: number[];
    endpointAppNames?: string[];
    search?: string;
};
/** Initial metadata and version content. */
export type CreateFunctionV2Body = {
    name: string;
    description?: FunctionV2['description'];
    content: FunctionV2Content;
};
/** Metadata changes only; publish a version to change source or contracts. */
export type UpdateFunctionV2Body = Partial<Pick<FunctionV2, 'name' | 'description'>>;
/** Compare-and-publish request. */
export type PublishFunctionV2VersionBody = { content: FunctionV2Content; expectedLatestVersion: number };
/** Run failure returned by the service. */
export type FunctionV2RunError = {
    code: string;
    message: string;
    category: 'customer_error' | 'customer_limit' | 'platform_failure';
    sideEffectPossible: boolean;
};
/** Durable Run state. */
export type FunctionV2RunStatus =
    | 'queued'
    | 'provisioning'
    | 'compiling'
    | 'running'
    | 'terminating'
    | 'succeeded'
    | 'failed'
    | 'timed_out'
    | 'cancelled';
/** An admitted Run; acceptance is not proof of completion. */
export type FunctionV2Run = {
    id: string;
    functionId?: number;
    origin: { type: 'version'; version: number } | { type: 'inline' };
    status: FunctionV2RunStatus;
    consumption?: { centicredits: number };
    caller: { type: 'user' | 'service' | 'system'; id?: string | null; label: string };
    attemptCount: number;
    maximumAttempts: number;
    timeoutSeconds: number;
    error?: FunctionV2RunError;
    createdAt: string;
    queuedAt?: string;
    startedAt?: string;
    completedAt?: string;
    updatedAt: string;
};
/** Detailed Run observation, including output and Endpoint-call history. */
export type FunctionV2RunDetail = FunctionV2Run & {
    attempts: Array<{
        number: number;
        status: Exclude<FunctionV2RunStatus, 'queued'>;
        startedAt: string;
        completedAt?: string;
        failureClass?: FunctionV2RunError['category'];
    }>;
    endpointCalls: Array<{
        sequence: number;
        appName: string;
        appVersion: number;
        endpointName: string;
        outcome: 'succeeded' | 'failed' | 'ambiguous';
        durationMs: number;
        attempts: number;
        ambiguous: boolean;
    }>;
    output?: JSONValue;
};
/** Responsive SDK calls may return a completed detail; asynchronous calls return a Run summary. */
export type FunctionV2RunResult = FunctionV2Run | FunctionV2RunDetail;
/** SDK execution wait settings; tool bindings always use asynchronous admission. */
export type FunctionV2RunOptions = { timeoutSeconds?: number } & (
    | { responsive: true; maxWaitSeconds?: number }
    | { responsive?: false; maxWaitSeconds?: never }
);
/** Execute a published version, defaulting to the latest. */
export type CreateFunctionV2RunBody = FunctionV2RunOptions & { data?: JSONValue; version?: number };
/** Execute source without publishing; Endpoint calls still have real side effects. */
export type CreateFunctionV2InlineRunBody = FunctionV2RunOptions & {
    content: FunctionV2Content;
    functionId?: number;
    data?: JSONValue;
};
/** Run collection filters. */
export type ListFunctionV2RunsOptions = FunctionV2PageOptions<'createdAt'> & {
    version?: number;
    createdFrom?: string;
    createdTo?: string;
};
/** Identity of an Endpoint in the authoring catalog. */
export type FunctionV2EndpointIdentity = Pick<FunctionV2Endpoint, 'appName' | 'appVersion' | 'endpointName'>;
/** Availability of an Endpoint's generated types. */
export type FunctionV2EndpointTypeStatus =
    | 'available'
    | 'definition_missing'
    | 'catalog_unavailable'
    | 'not_authorized';
/** Team-visible Endpoint catalog with available credential references, never secrets. */
export type FunctionV2EndpointCatalog = {
    catalogId?: string;
    catalogStatus: 'ready' | 'unavailable';
    endpoints: Array<
        FunctionV2EndpointIdentity & {
            appLabel: string;
            endpointLabel: string;
            description?: string;
            annotations: Record<string, JSONValue>;
            credentialsRequired: boolean;
            credentialsAvailable: Array<{ id: number; name: string }>;
            typeStatus: FunctionV2EndpointTypeStatus;
        }
    >;
};
/** Retrieve declarations for explicitly selected Endpoints. */
export type FunctionV2EndpointTypesBody = {
    teamId: number;
    catalogId?: string;
    functionId?: number;
    functionVersion?: number;
    endpoints: FunctionV2EndpointIdentity[];
};
/** Selected Endpoint declarations and availability. */
export type FunctionV2EndpointTypes = Pick<FunctionV2EndpointCatalog, 'catalogId' | 'catalogStatus'> & {
    endpoints: Array<
        FunctionV2EndpointIdentity & {
            available: boolean;
            typeStatus: FunctionV2EndpointTypeStatus;
            definition?: { declarations: string; inputType: string; outputType: string };
        }
    >;
};

const root = '/functions/v2';
const runStatuses: ReadonlyArray<string> = [
    'queued',
    'provisioning',
    'compiling',
    'running',
    'terminating',
    'succeeded',
    'failed',
    'timed_out',
    'cancelled',
];
const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
const runIdentifier = (value: unknown): string | undefined =>
    typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        ? value
        : undefined;

/** Submission might have started a Run. Do not automatically resubmit it. */
export class FunctionV2ExecutionUncertainError extends MakeError {
    readonly code = 'FUNCTION_EXECUTION_UNCERTAIN';
    readonly category = 'platform_failure';
    readonly sideEffectPossible = true;
    /** Run ID observed in the admission response, when available. */
    readonly runId?: string;

    constructor(runId?: string, statusCode?: number) {
        super(
            `The Function Run could not be confirmed and might have started. Do not retry it automatically.${runId ? ` Retrieve Run ${runId} with functions_v2_runs_get.` : ''}`,
            statusCode,
        );
        this.name = 'FunctionV2ExecutionUncertainError';
        this.runId = runId;
    }
}

/** Published version access. */
export class FunctionV2Versions {
    constructor(private readonly fetch: FetchFunction) {}
    /** List version contracts, with explicit pagination. */
    async list(
        functionId: number,
        options: FunctionV2PageOptions<'version'> = {},
    ): Promise<{ versions: FunctionV2VersionSummary[]; pg: FunctionV2Pagination }> {
        return this.fetch(`${root}/${functionId}/versions`, { query: options });
    }
    /** Read exact source and contracts for a version. */
    async get(functionId: number, version: number): Promise<FunctionV2Version> {
        return (await this.fetch<{ functionVersion: FunctionV2Version }>(`${root}/${functionId}/versions/${version}`))
            .functionVersion;
    }
    /** Publish new content, checking the expected latest version. Does not activate the Function. */
    async publish(functionId: number, body: PublishFunctionV2VersionBody): Promise<FunctionV2VersionSummary> {
        return (
            await this.fetch<{ functionVersion: FunctionV2VersionSummary }>(`${root}/${functionId}/versions`, {
                method: 'POST',
                body,
                retry: false,
            })
        ).functionVersion;
    }
}

/** Durable execution admission, observation and cancellation. */
export class FunctionV2Runs {
    constructor(private readonly fetch: FetchFunction) {}
    /** List Runs of a Function. */
    async list(
        functionId: number,
        options: ListFunctionV2RunsOptions = {},
    ): Promise<{ runs: FunctionV2Run[]; pg: FunctionV2Pagination }> {
        return this.fetch(`${root}/${functionId}/runs`, { query: options });
    }
    /** Read status, output and execution diagnostics without starting another Run. */
    async get(runId: string): Promise<FunctionV2RunDetail> {
        return (await this.fetch<{ run: FunctionV2RunDetail }>(`${root}/runs/${encodeURIComponent(runId)}`)).run;
    }
    /** Request cancellation; a 202 response can still describe a terminating Run. */
    async cancel(runId: string): Promise<FunctionV2Run> {
        return (
            await this.fetch<{ run: FunctionV2Run }>(`${root}/runs/${encodeURIComponent(runId)}/cancellation`, {
                method: 'POST',
                retry: false,
            })
        ).run;
    }
    /** Admit a published Run once. Omitted version selects the latest published version. */
    async create(functionId: number, body: CreateFunctionV2RunBody = {}): Promise<FunctionV2RunResult> {
        return this.submit(`${root}/${functionId}/runs`, body);
    }
    /** Execute inline code once; this is not a dry run. */
    async createInline(teamId: number, body: CreateFunctionV2InlineRunBody): Promise<FunctionV2RunResult> {
        return this.submit(`${root}/runs/inline`, body, teamId);
    }
    private async submit(
        path: string,
        body: CreateFunctionV2RunBody | CreateFunctionV2InlineRunBody,
        teamId?: number,
    ): Promise<FunctionV2RunResult> {
        // Validate before dispatch so a local wait-option error is never presented as uncertain execution.
        if (body.maxWaitSeconds !== undefined && body.responsive !== true)
            throw new TypeError('maxWaitSeconds requires responsive=true.');
        let runId: string | undefined;
        let accepted = false;
        try {
            const response = await this.fetch<unknown>(path, {
                method: 'POST',
                body,
                retry: false,
                query: teamId === undefined ? undefined : { teamId },
                onResponse: response => {
                    accepted = true;
                    const location = response.headers.get('location');
                    const match = location?.match(/\/functions\/v2\/runs\/([^/?#]+)$/);
                    runId = runIdentifier(match?.[1]);
                },
            });
            const run = isRecord(response) ? response.run : undefined;
            if (isRecord(run)) runId = runIdentifier(run.id) ?? runId;
            if (
                !isRecord(run) ||
                !runIdentifier(run.id) ||
                typeof run.status !== 'string' ||
                !runStatuses.includes(run.status)
            ) {
                throw new FunctionV2ExecutionUncertainError(runId);
            }
            return run as FunctionV2RunResult;
        } catch (error) {
            // Only explicit admission refusals are known not to have executed. Server/proxy errors are ambiguous.
            const confirmedRejection =
                !accepted &&
                error instanceof MakeError &&
                [400, 401, 403, 404, 409, 422, 429].includes(error.statusCode ?? 0);
            if (confirmedRejection || error instanceof FunctionV2ExecutionUncertainError) throw error;
            throw new FunctionV2ExecutionUncertainError(
                runId,
                error instanceof MakeError ? error.statusCode : undefined,
            );
        }
    }
}

/** Authoring catalog. Both functions:read and apps:read are required by the API. */
export class FunctionV2Endpoints {
    constructor(private readonly fetch: FetchFunction) {}
    /** List Endpoints visible to a Team. */
    async list(teamId: number): Promise<FunctionV2EndpointCatalog> {
        return this.fetch(`${root}/endpoint-catalog`, { query: { teamId } });
    }
    /** Retrieve generated types for selected Endpoints, preserving unavailable results. */
    async types(body: FunctionV2EndpointTypesBody): Promise<FunctionV2EndpointTypes> {
        return this.fetch(`${root}/endpoint-catalog/types`, { method: 'POST', body });
    }
}

/** Functions v2 lifecycle API. Independent of legacy custom Functions. */
export class FunctionsV2 {
    readonly versions: FunctionV2Versions;
    readonly runs: FunctionV2Runs;
    readonly endpoints: FunctionV2Endpoints;
    constructor(private readonly fetch: FetchFunction) {
        this.versions = new FunctionV2Versions(fetch);
        this.runs = new FunctionV2Runs(fetch);
        this.endpoints = new FunctionV2Endpoints(fetch);
    }
    /** List Functions with their latest version contracts. */
    async list(
        teamId: number,
        options: ListFunctionsV2Options = {},
    ): Promise<{ functions: FunctionV2[]; pg: FunctionV2Pagination }> {
        return this.fetch(root, { query: { teamId, ...options } });
    }
    /** Read metadata/contracts and ETag. Use versions.get to retrieve source. */
    async get(functionId: number): Promise<FunctionV2Representation> {
        return this.representation(`${root}/${functionId}`);
    }
    /** Create an inactive Function with its first published version. */
    async create(teamId: number, body: CreateFunctionV2Body): Promise<FunctionV2Representation> {
        return this.representation(root, { method: 'POST', query: { teamId }, body, retry: false });
    }
    /** Update metadata using a previously read ETag. Publish a version to edit code. */
    async update(functionId: number, body: UpdateFunctionV2Body, etag: string): Promise<FunctionV2Representation> {
        return this.representation(`${root}/${functionId}`, {
            method: 'PATCH',
            body,
            headers: this.ifMatch(etag),
            retry: false,
        });
    }
    /** Move a Function to trash using a previously read ETag. */
    async delete(functionId: number, etag: string): Promise<void> {
        await this.fetch(`${root}/${functionId}`, { method: 'DELETE', headers: this.ifMatch(etag), retry: false });
    }
    /** Allow published-version Runs; does not publish new content. */
    async activate(functionId: number, etag: string): Promise<FunctionV2Representation> {
        return this.representation(`${root}/${functionId}/activate`, {
            method: 'POST',
            headers: this.ifMatch(etag),
            retry: false,
        });
    }
    /** Reject new published Runs; in-flight Runs continue. */
    async deactivate(functionId: number, etag: string): Promise<FunctionV2Representation> {
        return this.representation(`${root}/${functionId}/deactivate`, {
            method: 'POST',
            headers: this.ifMatch(etag),
            retry: false,
        });
    }
    private ifMatch(etag: string): Record<string, string> {
        if (typeof etag !== 'string' || !etag.trim() || etag.trim() === '*')
            throw new TypeError('Supply the ETag returned by functions_v2_get.');
        return { 'If-Match': etag };
    }
    private async representation(path: string, options?: FetchOptions): Promise<FunctionV2Representation> {
        let etag: string | undefined;
        const response = await this.fetch<{ function: FunctionV2 }>(path, {
            ...options,
            onResponse: response => {
                etag = response.headers.get('etag') ?? undefined;
            },
        });
        return { function: response.function, ...(etag === undefined ? {} : { etag }) };
    }
}
