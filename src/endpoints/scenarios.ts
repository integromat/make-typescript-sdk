import type { FetchFunction, JSONValue, Pagination, PickColumns } from '../types.js';
import { Blueprint } from './blueprints.js';
import type { DataStructureField } from './data-structures.js';

/**
 * Represents a Make scenario.
 * Scenarios allow you to create and run automation tasks consisting of a series
 * of modules that indicate how data should be transferred and transformed
 * between apps or services.
 */
export type Scenario = {
    /** Unique identifier of the scenario */
    id: number;
    /** Name of the scenario */
    name: string;
    /** Description of the scenario */
    description: string;
    /** ID of the team that owns the scenario */
    teamId: number;
    /** ID of the folder containing the scenario */
    folderId: number;
    /** List of packages/apps used in the scenario */
    usedPackages: string[];
    /** Scheduling configuration for the scenario */
    scheduling: Scheduling;
    /** Whether the scenario is currently active */
    isActive: boolean;
    /** Whether the scenario has been stopped because of an error */
    isinvalid: boolean;
    /** Whether the scenario is paused because of the subscription problem */
    isPaused: boolean;
    /** Timestamp of the last edit */
    lastEdit: string;
    /** Timestamp when the scenario was created */
    created: string;
    /** Information about the user who created the scenario */
    createdByUser: {
        /** User ID */
        id: number;
        /** User name */
        name: number;
        /** User email */
        email: number;
    };
    /** Information about the user who last updated the scenario */
    updatedByUser: {
        /** User ID */
        id: number;
        /** User name */
        name: number;
        /** User email */
        email: number;
    };
    /** Count of incomplete executions (DLQ items) */
    dlqCount: number;
    /** Number of operations the scenario consumed in the current period */
    operations: number;
    /** Data transfer consumed in the current period */
    transfer: number;
    /** Custom properties defined for the scenario */
    customProperties?: Record<string, unknown>;
};

export type Scheduling = {
    /** Type of scheduling */
    type: 'immediately' | 'indefinitely' | 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'on-demand';
    /** Interval for scheduling when type is 'indefinitely' (in seconds, minimum 60) */
    interval?: number;
    /** Date and time to run the scenario when type is 'once' */
    date?: string;
    /** Days of the week to run the scenario when type is 'weekly' (0-6, where 0 is Sunday)
     * Days of the month to run the scenario when type is 'monthly' or 'yearly' (1-31)
     */
    days?: number[];
    /** Months of the year to run the scenario when type is 'yearly' (1-12) */
    months?: number[];
    /** Time to run the scenario when type is 'daily', 'weekly', 'monthly', or 'yearly' */
    time?: string;
    /** Date and time range to run the scenario for all types (ISO 8601 format) */
    between?: string[];
    /** Restrictions for scheduling */
    restrict?: {
        /** Days of the week to run the scenario when type is 'weekly' (0-6, where 0 is Sunday) */
        days?: number[];
        /** Months of the year to run the scenario when type is 'yearly' (1-12) */
        months?: number[];
        /** Time range to run the scenario (e.g. ['09:00', '17:00']) */
        time?: string[];
    }[];
};

/**
 * Options for retrieving a scenario.
 * @template C Keys of the Scenario type to include in the response
 */
export type GetScenarioOptions<C extends keyof Scenario = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Options for listing scenarios.
 * @template C Keys of the Scenario type to include in the response
 */
export type ListScenariosOptions<C extends keyof Scenario = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<Scenario>>;
};

/**
 * Response format for listing scenarios.
 * @template C Keys of the Scenario type to include in the response
 */
type ListScenariosResponse<C extends keyof Scenario = never> = {
    /** List of scenarios matching the query */
    scenarios: PickColumns<Scenario, C>[];
    /** Pagination information */
    pg: Pagination<Scenario>;
};

/**
 * Represents the input and output interface of a scenario.
 */
export type ScenarioInterface = {
    /** Input fields for the scenario, or null if no input is defined */
    input: DataStructureField[];
    /** Output fields for the scenario, or null if no output is defined */
    output: DataStructureField[];
};

/**
 * @deprecated Use `ScenarioInterface` instead. Will be removed in the next major version.
 */
export type ScenarioInteface = ScenarioInterface;

/**
 * Response format for getting a scenario interface.
 */
type GetScenarioInterfaceResponse = {
    /** The scenario interface definition */
    interface: Partial<ScenarioInterface>;
};

/**
 * Parameters for updating a scenario interface.
 */
export type UpdateScenarioInterfaceBody = {
    /** The interface definition with input and output specifications */
    interface: ScenarioInterface;
};

/**
 * Response format for updating a scenario interface.
 */
type UpdateScenarioInterfaceResponse = {
    /** The updated scenario interface definition */
    interface: ScenarioInterface;
};

/**
 * Response format for running a scenario.
 */
export type RunScenarioResponse = {
    /** ID of the execution that was created */
    executionId: string;
    /** Status of the scenario execution when run in responsive mode (1 = successful, 2 = successful with warnings, 3 = failed) */
    status?: 1 | 2 | 3;
    /** Output data from the scenario execution (when run in responsive mode) */
    outputs: unknown;
};

/**
 * Options for running a scenario.
 */
export type RunScenarioOptions = {
    /** Whether to run responsively (defaults to true) */
    responsive?: boolean;
    /** URL that will be called once the scenario execution finishes */
    callbackUrl?: string;
};

/**
 * Response format for activating a scenario.
 */
type ActivateScenarioResponse = {
    /** Basic scenario information with updated active status */
    scenario: Pick<Scenario, 'id' | 'isActive'>;
};

/**
 * Parameters for creating a new scenario.
 */
export type CreateScenarioBody = {
    /** ID of the team where the scenario will be created */
    teamId: number;
    /** ID of the folder where the scenario will be placed */
    folderId?: number;
    /** Scheduling configuration for the scenario */
    scheduling: Scheduling | string;
    /** Blueprint containing the scenario configuration */
    blueprint: Blueprint | string;
    /** ID of an existing template to base this one on */
    basedon?: string;
};

/**
 * Options for creating a scenario.
 * @template C Keys of the Scenario type to include in the response
 */
export type CreateScenarioOptions<C extends keyof Scenario = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Confirmation in case the scenario uses apps that are not yet installed in the organization */
    confirmed?: boolean;
};

/**
 * Response format for creating a scenario.
 * @template C Keys of the Scenario type to include in the response
 */
type CreateScenarioResponse<C extends keyof Scenario = never> = {
    /** The created scenario */
    scenario: PickColumns<Scenario, C>;
};

/**
 * Parameters for updating a scenario.
 */
export type UpdateScenarioBody = {
    /** New name for the scenario */
    name?: string;
    /** New description for the scenario */
    description?: string;
    /** New folder ID for the scenario */
    folderId?: number;
    /** Updated scheduling configuration */
    scheduling?: Scheduling | string;
    /** Updated blueprint configuration */
    blueprint?: Blueprint | string;
};

/**
 * Normalizes the payload for creating or updating a scenario.
 * @param payload The payload to normalize
 * @returns The normalized payload
 */
function normalizePayload(payload: UpdateScenarioBody | CreateScenarioBody) {
    let blueprint: Partial<Blueprint> | undefined =
        typeof payload.blueprint === 'string' ? JSON.parse(payload.blueprint) : payload.blueprint;
    let scheduling: Scheduling | undefined =
        typeof payload.scheduling === 'string' ? JSON.parse(payload.scheduling) : payload.scheduling;
    const metadata: {
        input_spec: DataStructureField[];
        output_spec: DataStructureField[];
    } = {
        input_spec: [],
        output_spec: [],
    };

    if (blueprint?.scheduling) {
        scheduling = blueprint.scheduling;
        blueprint = { ...blueprint, scheduling: undefined };
    }
    if (blueprint?.interface) {
        metadata.input_spec = blueprint.interface.input ?? [];
        metadata.output_spec = blueprint.interface.output ?? [];
        blueprint = { ...blueprint, interface: undefined };
    }
    if (blueprint?.io) {
        metadata.input_spec = blueprint.io.input_spec ?? [];
        metadata.output_spec = blueprint.io.output_spec ?? [];
        blueprint = { ...blueprint, io: undefined };
    }

    return {
        ...payload,
        scheduling: scheduling ? JSON.stringify(scheduling) : undefined,
        blueprint: blueprint ? JSON.stringify(blueprint) : undefined,
        metadata,
    };
}

/**
 * Options for updating a scenario.
 * @template C Keys of the Scenario type to include in the response
 */
export type UpdateScenarioOptions<C extends keyof Scenario = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Confirmation in case the scenario uses apps that are not yet installed in the organization */
    confirmed?: boolean;
};

/**
 * Response format for getting a scenario.
 * @template C Keys of the Scenario type to include in the response
 */
type GetScenarioResponse<C extends keyof Scenario = never> = {
    /** The requested scenario */
    scenario: PickColumns<Scenario, C>;
};

/**
 * Response format for updating a scenario.
 * @template C Keys of the Scenario type to include in the response
 */
type UpdateScenarioResponse<C extends keyof Scenario = never> = {
    /** The updated scenario */
    scenario: PickColumns<Scenario, C>;
};

/**
 * Response format for deactivating a scenario.
 */
type DeactivateScenarioResponse = {
    /** Basic scenario information with updated active status */
    scenario: Pick<Scenario, 'id' | 'isActive'>;
};

/**
 * Class providing methods for working with Make scenarios.
 * Scenarios allow you to create and run automation tasks consisting of a series of modules
 * that indicate how data should be transferred and transformed between apps or services.
 */
export class Scenarios {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Scenarios instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Create a new scenario.
     * @param scenario Parameters for the scenario to create
     * @param options Options for creating the scenario
     * @returns Promise with the created scenario
     */
    async create<C extends keyof Scenario = never>(
        scenario: CreateScenarioBody,
        options?: CreateScenarioOptions<C>,
    ): Promise<PickColumns<Scenario, C>> {
        return (
            await this.#fetch<CreateScenarioResponse<C>>('/scenarios', {
                method: 'POST',
                query: {
                    cols: options?.cols,
                    confirmed: options?.confirmed,
                },
                body: normalizePayload(scenario),
            })
        ).scenario;
    }

    /**
     * Get scenario details.
     * @param scenarioId The scenario ID to get details for
     * @param options Options for filtering the returned fields
     * @returns Promise with the scenario details
     */
    async get<C extends keyof Scenario = never>(
        scenarioId: number,
        options?: GetScenarioOptions<C>,
    ): Promise<PickColumns<Scenario, C>> {
        return (
            await this.#fetch<GetScenarioResponse<C>>(`/scenarios/${scenarioId}`, { query: { cols: options?.cols } })
        ).scenario;
    }

    /**
     * List all scenarios for a team.
     * @param teamId The team ID to filter scenarios by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of scenarios
     */
    async list<C extends keyof Scenario = never>(
        teamId: number,
        options?: ListScenariosOptions<C>,
    ): Promise<PickColumns<Scenario, C>[]> {
        return (
            await this.#fetch<ListScenariosResponse<C>>('/scenarios', {
                query: {
                    teamId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).scenarios;
    }

    /**
     * List all scenarios for an organization.
     * @param organizationId The organization ID to filter scenarios by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of scenarios
     */
    async listInOrganization<C extends keyof Scenario = never>(
        organizationId: number,
        options?: ListScenariosOptions<C>,
    ): Promise<PickColumns<Scenario, C>[]> {
        return (
            await this.#fetch<ListScenariosResponse<C>>('/scenarios', {
                query: {
                    organizationId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).scenarios;
    }

    /**
     * Update a scenario.
     * @param scenarioId The scenario ID to update
     * @param scenario Parameters to update in the scenario
     * @param options Options for updating the scenario
     * @returns Promise with the updated scenario
     */
    async update<C extends keyof Scenario = never>(
        scenarioId: number,
        scenario: UpdateScenarioBody,
        options?: UpdateScenarioOptions<C>,
    ): Promise<PickColumns<Scenario, C>> {
        return (
            await this.#fetch<UpdateScenarioResponse<C>>(`/scenarios/${scenarioId}`, {
                method: 'PATCH',
                query: {
                    cols: options?.cols,
                    confirmed: options?.confirmed,
                },
                body: normalizePayload(scenario),
            })
        ).scenario;
    }

    /**
     * Delete a scenario.
     * @param scenarioId The scenario ID to delete
     */
    async delete(scenarioId: number): Promise<void> {
        await this.#fetch(`/scenarios/${scenarioId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Activate a scenario.
     * @param scenarioId The scenario ID to activate
     * @returns Promise with a boolean indicating success
     */
    async activate(scenarioId: number): Promise<boolean> {
        return (
            (
                await this.#fetch<ActivateScenarioResponse>(`/scenarios/${scenarioId}/start`, {
                    method: 'POST',
                })
            ).scenario.isActive === true
        );
    }

    /**
     * Deactivate a scenario.
     * @param scenarioId The scenario ID to deactivate
     * @returns Promise with a boolean indicating success
     */
    async deactivate(scenarioId: number): Promise<boolean> {
        return (
            (
                await this.#fetch<DeactivateScenarioResponse>(`/scenarios/${scenarioId}/stop`, {
                    method: 'POST',
                })
            ).scenario.isActive === false
        );
    }

    /**
     * Execute a scenario with optional input data.
     * @param scenarioId The scenario ID to run
     * @param body Optional input data for the scenario
     * @param options Options for running the scenario
     * @returns Promise with the execution result
     */
    async run(
        scenarioId: number,
        body?: Record<string, JSONValue>,
        options?: RunScenarioOptions,
    ): Promise<RunScenarioResponse> {
        return await this.#fetch<RunScenarioResponse>(`/scenarios/${scenarioId}/run`, {
            method: 'POST',
            body: {
                data: body,
                responsive: options?.responsive ?? true,
                callbackUrl: options?.callbackUrl,
            },
        });
    }

    /**
     * Get the interface for a scenario.
     * @param scenarioId The scenario ID to get the interface for
     * @returns Promise with the scenario interface
     * @deprecated Use getInterface instead
     */
    async ['interface'](scenarioId: number): Promise<ScenarioInterface> {
        return await this.getInterface(scenarioId);
    }

    /**
     * Get the interface for a scenario.
     * @param scenarioId The scenario ID to get the interface for
     * @returns Promise with the scenario interface
     */
    async getInterface(scenarioId: number): Promise<ScenarioInterface> {
        const result = await this.#fetch<GetScenarioInterfaceResponse>(`/scenarios/${scenarioId}/interface`);
        return {
            input: result.interface.input ?? [],
            output: result.interface.output ?? [],
        };
    }

    /**
     * Update a scenario interface.
     * @param scenarioId The scenario ID to update the interface for
     * @param body The new interface definition
     * @returns Promise with the updated scenario interface
     */
    async setInterface(scenarioId: number, body: UpdateScenarioInterfaceBody): Promise<ScenarioInterface> {
        return (
            await this.#fetch<UpdateScenarioInterfaceResponse>(`/scenarios/${scenarioId}/interface`, {
                method: 'PATCH',
                body: body,
            })
        ).interface;
    }
}
