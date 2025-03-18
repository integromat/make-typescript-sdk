import type { FetchFunction, JSONValue, Pagination, PickColumns } from '../types.js';
import type { DataStructureField } from './data-structures.js';

export type Scenario = {
    id: number;
    name: string;
    teamId: number;
    folderId: number;
    usedPackages: string[];
    scheduling: {
        type: string;
    };
    isActive: boolean;
    isinvalid: boolean;
    isPaused: boolean;
    lastEdit: string;
    created: string;
    createdByUser: {
        id: number;
        name: number;
        email: number;
    };
    updatedByUser: {
        id: number;
        name: number;
        email: number;
    };
    dlqCount: number;
    operations: number;
    transfer: number;
    customProperties?: Record<string, unknown>;
};

export type ListScenariosOptions<C extends keyof Scenario = never> = {
    cols?: C[];
    pg?: Partial<Pagination>;
};

type ListScenariosResponse<C extends keyof Scenario = never> = {
    scenarios: PickColumns<Scenario, C>[];
    pg: Pagination;
};

export type ScenarioInteface = {
    input: DataStructureField[] | null;
    output: DataStructureField[] | null;
};

type GetScenarioInterfaceResponse = {
    interface: ScenarioInteface;
};

export type RunScenarioResponse = {
    executionId: string;
    outputs: unknown;
};

type ActivateScenarioResponse = {
    scenario: Pick<Scenario, 'id' | 'isActive'>;
};

export type CreateScenarioBody = {
    teamId: number;
    folderId?: number;
    scheduling: string;
    blueprint: string;
    basedon?: string;
};

export type CreateScenarioOptions<C extends keyof Scenario = never> = {
    cols?: C[];
    confirmed?: boolean;
};

type CreateScenarioResponse<C extends keyof Scenario = never> = {
    scenario: PickColumns<Scenario, C>;
};

export type UpdateScenarioBody = {
    name?: string;
    folderId?: number;
    scheduling?: string;
    blueprint?: string;
};

export type UpdateScenarioOptions<C extends keyof Scenario = never> = {
    cols?: C[];
    confirmed?: boolean;
};

type GetScenarioResponse<C extends keyof Scenario = never> = {
    scenario: PickColumns<Scenario, C>;
};

type UpdateScenarioResponse<C extends keyof Scenario = never> = {
    scenario: PickColumns<Scenario, C>;
};

type DeactivateScenarioResponse = {
    scenario: Pick<Scenario, 'id' | 'isActive'>;
};

export class Scenarios {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Create a new scenario
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
                body: {
                    teamId: scenario.teamId,
                    folderId: scenario.folderId,
                    scheduling: scenario.scheduling,
                    blueprint: scenario.blueprint,
                    basedon: scenario.basedon,
                },
            })
        ).scenario;
    }

    /**
     * Get scenario details
     * @param scenarioId The scenario ID to get details for
     * @returns Promise with the scenario details
     */
    async get(scenarioId: number): Promise<Scenario> {
        return (await this.#fetch<GetScenarioResponse>(`/scenarios/${scenarioId}`)).scenario;
    }

    /**
     * List all scenarios for a team
     * @param teamId The team ID to filter scenarios by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of scenarios and metadata
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
     * List all scenarios for an organization
     * @param organizationId The organization ID to filter scenarios by
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of scenarios and metadata
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
     * Update a scenario
     * @param scenarioId The scenario ID to update
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
                body: {
                    name: scenario.name,
                    folderId: scenario.folderId,
                    scheduling: scenario.scheduling,
                    blueprint: scenario.blueprint,
                },
            })
        ).scenario;
    }

    /**
     * Delete a scenario
     * @param scenarioId The scenario ID to delete
     * @returns Promise with void
     */
    async delete(scenarioId: number): Promise<void> {
        await this.#fetch(`/scenarios/${scenarioId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Activate a scenario
     * @param scenarioId The scenario ID to activate
     * @returns Promise with boolean indicating if the scenario is active
     */
    async activate(scenarioId: number): Promise<boolean> {
        return (
            await this.#fetch<ActivateScenarioResponse>(`/scenarios/${scenarioId}/start`, {
                method: 'POST',
            })
        ).scenario.isActive;
    }

    /**
     * Deactivate a scenario
     * @param scenarioId The scenario ID to deactivate
     * @returns Promise with boolean indicating if the scenario is active
     */
    async deactivate(scenarioId: number): Promise<boolean> {
        return (
            await this.#fetch<DeactivateScenarioResponse>(`/scenarios/${scenarioId}/stop`, {
                method: 'POST',
            })
        ).scenario.isActive;
    }

    /**
     * Run a scenario
     * @param scenarioId The scenario ID to run
     * @param body The body to run the scenario with
     * @param options Optional parameters for the run
     * @returns Promise with the run scenario response
     */
    async run(
        scenarioId: number,
        body?: Record<string, JSONValue>,
        options?: { responsive?: boolean },
    ): Promise<RunScenarioResponse> {
        return await this.#fetch<RunScenarioResponse>(`/scenarios/${scenarioId}/run`, {
            method: 'POST',
            body: {
                data: body,
                responsive: options?.responsive ?? true,
            },
        });
    }

    /**
     * Get the interface for a scenario
     * @param scenarioId The scenario ID to get the interface for
     * @returns Promise with the scenario interface
     */
    async ['interface'](scenarioId: number): Promise<ScenarioInteface> {
        return (await this.#fetch<GetScenarioInterfaceResponse>(`/scenarios/${scenarioId}/interface`)).interface;
    }
}
