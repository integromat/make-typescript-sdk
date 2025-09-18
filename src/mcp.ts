import type { Make } from './make.js';
import type { JSONValue } from './types.js';

import { tools as SDKAppsTools } from './endpoints/sdk/apps.mcp.js';
import { tools as SDKConnectionsTools } from './endpoints/sdk/connections.mcp.js';
import { tools as SDKFunctionsTools } from './endpoints/sdk/functions.mcp.js';
import { tools as SDKModulesTools } from './endpoints/sdk/modules.mcp.js';
import { tools as SDKRPCsTools } from './endpoints/sdk/rpcs.mcp.js';
import { tools as SDKWebhooksTools } from './endpoints/sdk/webhooks.mcp.js';

import { tools as ScenariosTools } from './endpoints/scenarios.mcp.js';
import { tools as ConnectionsTools } from './endpoints/connections.mcp.js';
import { tools as DataStoresTools } from './endpoints/data-stores.mcp.js';
import { tools as DataStoreRecordsTools } from './endpoints/data-store-records.mcp.js';
import { tools as TeamsTools } from './endpoints/teams.mcp.js';
import { tools as OrganizationsTools } from './endpoints/organizations.mcp.js';
import { tools as UsersTools } from './endpoints/users.mcp.js';
import { tools as FunctionsTools } from './endpoints/functions.mcp.js';
import { tools as ExecutionsTools } from './endpoints/executions.mcp.js';
import { tools as HooksTools } from './endpoints/hooks.mcp.js';
import { tools as KeysTools } from './endpoints/keys.mcp.js';
import { tools as FoldersTools } from './endpoints/folders.mcp.js';
import { tools as IncompleteExecutionsTools } from './endpoints/incomplete-executions.mcp.js';
import { tools as DataStructuresTools } from './endpoints/data-structures.mcp.js';
import { tools as EnumsTools } from './endpoints/enums.mcp.js';

/**
 * JSON Schema definition for input parameters.
 */
export type JSONSchema = {
    /** The type of the schema (object, string, number, boolean, array, etc.) */
    type: 'object' | 'string' | 'number' | 'boolean' | 'array' | 'null';
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
    /** Default value */
    default?: JSONValue;
    /** Minimum value for numbers */
    minimum?: number;
    /** Maximum value for numbers */
    maximum?: number;
    /** Minimum length for strings/arrays */
    minLength?: number;
    /** Maximum length for strings/arrays */
    maxLength?: number;
    /** Pattern for string validation */
    pattern?: string;
};

/**
 * Interface for MCP (Model Context Protocol) tools.
 * Defines the structure and behavior of tools that can be executed by AI agents.
 */
export type MakeMCPTool = {
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
     * Field name used as the primary identifier for this tool's operations.
     * Used for resource identification and access control.
     */
    identifier?: string;

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

    /**
     * Function that executes the tool's operation.
     * @param make The Make SDK client instance
     * @param args The input arguments matching the inputSchema
     * @returns Promise resolving to the operation result
     */
    execute: (make: Make, args?: Record<string, JSONValue>) => Promise<JSONValue>;
};

export const MakeMCPTools = [
    // SDK Tools
    ...SDKAppsTools,
    ...SDKConnectionsTools,
    ...SDKFunctionsTools,
    ...SDKModulesTools,
    ...SDKRPCsTools,
    ...SDKWebhooksTools,

    // Core Endpoint Tools
    ...ScenariosTools,
    ...ConnectionsTools,
    ...DataStoresTools,
    ...DataStoreRecordsTools,
    ...TeamsTools,
    ...OrganizationsTools,
    ...UsersTools,
    ...FunctionsTools,
    ...ExecutionsTools,
    ...HooksTools,
    ...KeysTools,
    ...FoldersTools,
    ...IncompleteExecutionsTools,
    ...DataStructuresTools,
    ...EnumsTools,
] as MakeMCPTool[];
