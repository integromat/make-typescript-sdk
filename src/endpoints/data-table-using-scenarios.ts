import type { FetchFunction } from '../types.js';

/**
 * Represents a scenario registered as using a Make data table.
 * Tracks which scenario reads from or writes to the table and which columns it uses.
 */
export type DataTableUsingScenario = {
    /** Unique identifier of the scenario */
    scenarioId: number;
    /** IDs of the columns the scenario uses */
    columnIds: number[];
};

/**
 * Internal response types (not exported)
 */
type ListDataTableUsingScenariosResponse = {
    scenarios: DataTableUsingScenario[];
};

/**
 * Class providing methods for tracking which scenarios use a Make data table.
 */
export class DataTableUsingScenarios {
    readonly #fetch: FetchFunction;

    /**
     * Create a new DataTableUsingScenarios instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List scenarios registered as using a data table.
     * @param dataTableId The data table ID to list using scenarios for
     * @returns Promise with the list of using scenarios
     */
    async list(dataTableId: number): Promise<DataTableUsingScenario[]> {
        return (await this.#fetch<ListDataTableUsingScenariosResponse>(`/data-tables/${dataTableId}/using-scenarios`))
            .scenarios;
    }

    /**
     * Register a scenario as using a data table.
     * @param dataTableId The data table ID the scenario uses
     * @param body The scenario and the columns it uses
     * @returns Promise that resolves when the scenario is registered
     */
    async add(dataTableId: number, body: DataTableUsingScenario): Promise<void> {
        await this.#fetch(`/data-tables/${dataTableId}/add-using-scenario`, {
            method: 'POST',
            body,
        });
    }

    /**
     * Update the columns a registered scenario uses.
     * @param dataTableId The data table ID the scenario uses
     * @param body The scenario and the new set of columns it uses
     * @returns Promise that resolves when the registration is updated
     */
    async update(dataTableId: number, body: DataTableUsingScenario): Promise<void> {
        await this.#fetch(`/data-tables/${dataTableId}/using-scenario`, {
            method: 'PATCH',
            body,
        });
    }

    /**
     * Remove a scenario's registration from a data table.
     * @param dataTableId The data table ID the scenario was registered on
     * @param scenarioId The scenario ID to remove
     * @returns Promise that resolves when the registration is removed
     */
    async remove(dataTableId: number, scenarioId: number): Promise<void> {
        await this.#fetch(`/data-tables/${dataTableId}/remove-using-scenario`, {
            method: 'DELETE',
            body: {
                scenarioId,
            },
        });
    }
}
