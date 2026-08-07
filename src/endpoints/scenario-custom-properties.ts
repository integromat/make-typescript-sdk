import type { FetchFunction, JSONValue } from '../types.js';

/**
 * Free-form custom properties data for a scenario, keyed by the custom property structure
 * item's `name`. The shape and required keys are determined by the organization's custom
 * property structure — the SDK does not validate it locally.
 */
export type ScenarioCustomPropertiesData = Record<string, JSONValue>;

/**
 * Response format for reading or writing scenario custom properties data.
 */
type ScenarioCustomPropertiesResponse = {
    /** The scenario's custom properties data */
    customProperties: ScenarioCustomPropertiesData;
    /** ID of the scenario the data belongs to */
    scenarioId: number;
};

/**
 * Class providing methods for working with the custom properties data of a single scenario.
 * The available keys and their types are defined by the organization's custom property
 * structure — see `make.customPropertyStructures.items`.
 */
export class ScenarioCustomProperties {
    readonly #fetch: FetchFunction;

    /**
     * Create a new ScenarioCustomProperties instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Get the custom properties data of a scenario.
     * @param scenarioId The scenario ID to get custom properties data for
     * @returns Promise with the scenario's custom properties data
     *
     * @example
     * ```typescript
     * const data = await make.scenarios.customProperties.get(22);
     * ```
     */
    async get(scenarioId: number): Promise<ScenarioCustomPropertiesData> {
        return (await this.#fetch<ScenarioCustomPropertiesResponse>(`/scenarios/${scenarioId}/custom-properties`))
            .customProperties;
    }

    /**
     * Fill in custom properties data for a scenario for the first time.
     * Fails with IM005 if the scenario already has data — use `update()` or `replace()` instead.
     * Every item marked required in the organization's custom property structure must be given
     * a value, or the call fails.
     * @param scenarioId The scenario ID to fill in custom properties data for
     * @param data The custom properties data, keyed by structure item name
     * @returns Promise with the scenario's custom properties data
     *
     * @example
     * ```typescript
     * const data = await make.scenarios.customProperties.create(80, { companyTeam: 'marketing' });
     * ```
     */
    async create(scenarioId: number, data: ScenarioCustomPropertiesData): Promise<ScenarioCustomPropertiesData> {
        return (
            await this.#fetch<ScenarioCustomPropertiesResponse>(`/scenarios/${scenarioId}/custom-properties`, {
                method: 'POST',
                body: data,
            })
        ).customProperties;
    }

    /**
     * Replace all custom properties data for a scenario. The scenario must already have data
     * — fails with IM013 otherwise; use `create()` first. Every item marked required in the
     * structure must be given a value, or the call fails.
     * @param scenarioId The scenario ID to replace custom properties data for
     * @param data The complete replacement custom properties data, keyed by structure item name
     * @returns Promise with the scenario's custom properties data
     *
     * @example
     * ```typescript
     * const data = await make.scenarios.customProperties.replace(80, { companyTeam: 'engineering' });
     * ```
     */
    async replace(scenarioId: number, data: ScenarioCustomPropertiesData): Promise<ScenarioCustomPropertiesData> {
        return (
            await this.#fetch<ScenarioCustomPropertiesResponse>(`/scenarios/${scenarioId}/custom-properties`, {
                method: 'PUT',
                body: data,
            })
        ).customProperties;
    }

    /**
     * Merge-update custom properties data for a scenario; only the specified keys are changed.
     * The scenario must already have data — fails with IM013 otherwise; use `create()` first.
     * @param scenarioId The scenario ID to update custom properties data for
     * @param data The custom properties data to merge in, keyed by structure item name
     * @returns Promise with the scenario's custom properties data
     *
     * @example
     * ```typescript
     * const data = await make.scenarios.customProperties.update(80, { location: 'Wien, AUS' });
     * ```
     */
    async update(scenarioId: number, data: ScenarioCustomPropertiesData): Promise<ScenarioCustomPropertiesData> {
        return (
            await this.#fetch<ScenarioCustomPropertiesResponse>(`/scenarios/${scenarioId}/custom-properties`, {
                method: 'PATCH',
                body: data,
            })
        ).customProperties;
    }

    /**
     * Delete all custom properties data for a scenario. This is irreversible.
     * The underlying API does not currently require confirmation for this call (unlike deleting
     * a structure item), but this method always sends `confirmed: true` to match the documented
     * contract in case that changes.
     * @param scenarioId The scenario ID to delete custom properties data for
     *
     * @example
     * ```typescript
     * await make.scenarios.customProperties.delete(80);
     * ```
     */
    async delete(scenarioId: number): Promise<void> {
        await this.#fetch(`/scenarios/${scenarioId}/custom-properties`, {
            method: 'DELETE',
            query: { confirmed: true },
        });
    }
}
