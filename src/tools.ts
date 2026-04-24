import type { Make } from './make.js';
import type { JSONValue } from './types.js';

import { tools as SDKAppsTools } from './endpoints/sdk/apps.tools.js';
import { tools as SDKConnectionsTools } from './endpoints/sdk/connections.tools.js';
import { tools as SDKFunctionsTools } from './endpoints/sdk/functions.tools.js';
import { tools as SDKModulesTools } from './endpoints/sdk/modules.tools.js';
import { tools as SDKRPCsTools } from './endpoints/sdk/rpcs.tools.js';
import { tools as SDKWebhooksTools } from './endpoints/sdk/webhooks.tools.js';

import { tools as ScenariosTools } from './endpoints/scenarios.tools.js';
import { tools as ConnectionsTools } from './endpoints/connections.tools.js';
import { tools as CredentialRequestsTools } from './endpoints/credential-requests.tools.js';
import { tools as DataStoresTools } from './endpoints/data-stores.tools.js';
import { tools as DataStoreRecordsTools } from './endpoints/data-store-records.tools.js';
import { tools as TeamsTools } from './endpoints/teams.tools.js';
import { tools as OrganizationsTools } from './endpoints/organizations.tools.js';
import { tools as UsersTools } from './endpoints/users.tools.js';
import { tools as FunctionsTools } from './endpoints/functions.tools.js';
import { tools as ExecutionsTools } from './endpoints/executions.tools.js';
import { tools as HooksTools } from './endpoints/hooks.tools.js';
import { tools as DevicesTools } from './endpoints/devices.tools.js';
import { tools as KeysTools } from './endpoints/keys.tools.js';
import { tools as FoldersTools } from './endpoints/folders.tools.js';
import { tools as IncompleteExecutionsTools } from './endpoints/incomplete-executions.tools.js';
import { tools as DataStructuresTools } from './endpoints/data-structures.tools.js';
import { tools as EnumsTools } from './endpoints/enums.tools.js';

/**
 * JSON Schema definition for input parameters.
 */
export type JSONSchema = {
    /**
     * The type of the schema (object, string, number, boolean, array, etc.).
     * Optional when the schema is expressed purely through composition
     * (`oneOf`/`anyOf`/`allOf`) or a `const` value.
     */
    type?: 'object' | 'string' | 'number' | 'boolean' | 'array' | 'null';
    /** Properties definition for object types */
    properties?: Record<string, JSONSchema>;
    /** Required property names for object types */
    required?: string[];
    /** Items schema for array types */
    items?: JSONSchema;
    /** Description of the schema or property */
    description?: string;
    /** Enum values for restricted choices */
    enum?: JSONValue[];
    /** Constant literal value the schema must equal */
    const?: JSONValue;
    /** Value must match exactly one of these schemas */
    oneOf?: JSONSchema[];
    /** Value must match at least one of these schemas */
    anyOf?: JSONSchema[];
    /** Value must match all of these schemas */
    allOf?: JSONSchema[];
    /** Default value */
    default?: JSONValue;
    /** Minimum value for numbers */
    minimum?: number;
    /** Maximum value for numbers */
    maximum?: number;
    /** Minimum length for strings */
    minLength?: number;
    /** Maximum length for strings */
    maxLength?: number;
    /** Minimum number of items for arrays */
    minItems?: number;
    /** Maximum number of items for arrays */
    maxItems?: number;
    /** Pattern for string validation */
    pattern?: string;
};

/**
 * Harness-agnostic definition of a Make SDK tool.
 *
 * A tool describes a single callable operation backed by the Make SDK. The same
 * definitions power the MCP server, the Make CLI, and any future integrations
 * (OpenAPI, LLM function calling, etc.) — nothing in this shape is specific to
 * MCP.
 */
export type MakeTool = {
    /** Unique identifier for the tool */
    name: string;

    /** Human-readable title for display purposes */
    title: string;

    /** Detailed description of what the tool does */
    description: string;

    /** Category for organizing tools (e.g., 'scenarios', 'teams', 'sdk.apps') */
    category: string;

    /** Required scope/permission for executing this tool */
    scope?: string;

    /**
     * Input-schema property that names the **scope** this tool runs in —
     * typically the parent / routing id consumers use for API routing and
     * access control (e.g. `teamId`, `organizationId`, or `scenarioId` for a
     * sub-resource).
     *
     * Distinct from {@link resourceId}, which names the single resource the
     * tool acts on. A single tool may have both:
     *   - `executions_get`: `scopeId = 'scenarioId'`, `resourceId = 'executionId'`
     *   - `data-structures_get`: `scopeId = 'dataStructureId'`, `resourceId = 'dataStructureId'`
     *
     * Distinct also from {@link scope}, which is the OAuth permission string
     * required to run the tool (e.g. `scenarios:read`); `scopeId` names the
     * input property, `scope` names the permission.
     *
     * The value SHOULD be a key in {@link inputSchema}.properties when set.
     */
    scopeId?: string;

    /**
     * @deprecated Use {@link scopeId} instead. Kept as an alias for backward
     * compatibility with consumers built against earlier SDK versions. When
     * both are set they MUST have the same value.
     */
    identifier?: string;

    /**
     * Input-schema property that names the **resource** this tool operates on.
     *
     * Populate when the tool acts on a single, already-existing resource
     * (get/update/delete/run-style actions). Leave undefined for
     * collection-scoped actions (list/create) and for tools that don't act
     * on a single resource (e.g. auth, health, enums).
     *
     * The value MUST be a key in {@link inputSchema}.properties.
     *
     * Distinct from {@link scopeId}, which names the scope/parent id used for
     * client routing and access control. A single tool may have both:
     *   - `executions_get`: `scopeId = 'scenarioId'`, `resourceId = 'executionId'`
     *   - `data-structures_get`: `scopeId = 'dataStructureId'`, `resourceId = 'dataStructureId'`
     */
    resourceId?: string;

    /** Behavioral hints about the tool's operations */
    annotations?: {
        /**
         * If true, the tool may perform destructive updates to its environment.
         * If false, the tool performs only additive updates.
         * This property is meaningful only when readOnlyHint == false.
         * @default true
         */
        destructiveHint?: boolean;

        /**
         * If true, calling the tool repeatedly with the same arguments will have
         * no additional effect on its environment.
         * This property is meaningful only when readOnlyHint == false.
         * @default false
         */
        idempotentHint?: boolean;

        /**
         * If true, the tool does not modify its environment.
         * @default false
         */
        readOnlyHint?: boolean;
    };

    /** JSON Schema defining the input parameters */
    inputSchema: JSONSchema;

    /** Example input payloads illustrating how to use the tool */
    examples?: Record<string, JSONValue>[];

    /**
     * Function that executes the tool's operation.
     * @param make The Make SDK client instance
     * @param args The input arguments matching the inputSchema
     * @returns Promise resolving to the operation result
     */
    execute: (make: Make, args?: Record<string, JSONValue>) => Promise<JSONValue>;
};

/**
 * Aggregated list of every tool definition exposed by the Make SDK.
 *
 * Consumed by the MCP server (via `./mcp`), the Make CLI, and any other harness
 * that wants a uniform view of SDK operations.
 */
export const MakeTools = [
    // SDK Tools
    ...SDKAppsTools,
    ...SDKConnectionsTools,
    ...SDKFunctionsTools,
    ...SDKModulesTools,
    ...SDKRPCsTools,
    ...SDKWebhooksTools,

    // Core Endpoint Tools
    ...ScenariosTools,
    ...ExecutionsTools,
    ...IncompleteExecutionsTools,
    ...FoldersTools,
    ...FunctionsTools,
    ...HooksTools,
    ...DevicesTools,
    ...DataStructuresTools,
    ...ConnectionsTools,
    ...KeysTools,
    ...CredentialRequestsTools,
    ...DataStoresTools,
    ...DataStoreRecordsTools,
    ...TeamsTools,
    ...OrganizationsTools,
    ...UsersTools,
    ...EnumsTools,
] as MakeTool[];
