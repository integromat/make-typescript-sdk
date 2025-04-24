import type { FetchFunction, JSONValue } from '../types.js';

/**
 * Represents a node in a Make scenario blueprint.
 * Each node is a module in the scenario with its configuration.
 */
export type BlueprintNode = {
    /** Unique identifier of the node within the blueprint */
    id: number;
    /** The module type (e.g., 'http:ActionSendData') */
    module: string;
    /** Version of the module */
    version: number;
    /** Module mappable parameters */
    mapper?: Record<string, JSONValue>;
    /** Module metadata */
    metadata?: Record<string, JSONValue>;
    /** Module parameters */
    parameters?: Record<string, JSONValue>;
    /** Routes to other nodes (only for router nodes) */
    routes?: Array<BlueprintRoute>;
    /** Error handling nodes */
    onerror?: BlueprintNode[];
    /** Whether this node is a (web|mail)hook-based trigger */
    listener?: boolean;
    /** Filter conditions for the node */
    filter?: {
        /** Name of the filter */
        name: string;
        /** Conditions for the filter */
        conditions?: {
            /** Left operand */
            a?: string;
            /** Operator */
            o: string;
            /** Right operand */
            b?: string;
        }[][];
    };
};

/**
 * Represents a route of a router node in a blueprint.
 * Routes define the flow of execution of modules.
 */
export type BlueprintRoute = {
    /** Nodes in the route */
    flow: BlueprintNode[];
};

/**
 * Represents a complete scenario blueprint.
 * Blueprints define the structure and behavior of scenarios.
 */
export type Blueprint = {
    /** Name of the blueprint */
    name: string;
    /** The main flow of nodes in the blueprint */
    flow: BlueprintNode[];
    /** Metadata for the blueprint */
    metadata: Record<string, JSONValue>;
};

/**
 * Response format for getting a scenario blueprint.
 */
type GetScenarioBlueprintResponse = {
    /** Response code */
    code: string;
    /** Response data */
    response: {
        /** The scenario blueprint */
        blueprint: Blueprint;
    };
};

/**
 * Represents a version of a blueprint.
 * Scenarios keep a history of blueprint versions as they are edited.
 */
export type BlueprintVersion = {
    /** Version number */
    version: number;
    /** Creation timestamp */
    created: string;
    /** ID of the scenario this blueprint version belongs to */
    scenarioId: number;
    /** Whether this is a draft version */
    draft: boolean;
};

/**
 * Response format for getting blueprint versions.
 */
type GetBlueprintVersionsResponse = {
    /** List of blueprint versions */
    scenariosBlueprints: BlueprintVersion[];
};

/**
 * Class providing methods for working with Make blueprints.
 * Blueprints define the structure and workflow of scenarios, including
 * the modules, their configuration, and the connections between them.
 */
export class Blueprints {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Blueprints instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Get the blueprint of a scenario.
     * @param scenarioId The scenario ID to get the blueprint for
     * @returns Promise with the complete scenario blueprint
     */
    async get(scenarioId: number): Promise<Blueprint> {
        return (await this.#fetch<GetScenarioBlueprintResponse>(`/scenarios/${scenarioId}/blueprint`)).response
            .blueprint;
    }

    /**
     * Get all versions of a scenario's blueprint.
     * @param scenarioId The scenario ID to get blueprint versions for
     * @returns Promise with a list of blueprint versions
     */
    async versions(scenarioId: number): Promise<BlueprintVersion[]> {
        return (await this.#fetch<GetBlueprintVersionsResponse>(`/scenarios/${scenarioId}/blueprints`))
            .scenariosBlueprints;
    }
}
