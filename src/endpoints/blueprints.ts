import type { FetchFunction, JSONValue } from '../types.js';

export type BlueprintNode = {
    id: number;
    module: string;
    version: number;
    mapper?: Record<string, JSONValue>;
    metadata?: Record<string, JSONValue>;
    parameters?: Record<string, JSONValue>;
    routes?: Array<BlueprintRoute>;
    onerror?: BlueprintNode[];
    listener?: boolean;
    filter?: {
        name: string;
        conditions?: {
            a?: string;
            o: string;
            b?: string;
        }[][];
    };
};

export type BlueprintRoute = {
    flow: BlueprintNode[];
};

export type Blueprint = {
    name: string;
    flow: BlueprintNode[];
    metadata: Record<string, JSONValue>;
};

type GetScenarioBlueprintResponse = {
    code: string;
    response: {
        blueprint: Blueprint;
    };
};

export type BlueprintVersion = {
    version: number;
    created: string;
    scenarioId: number;
    draft: boolean;
};

type GetBlueprintVersionsResponse = {
    scenariosBlueprints: BlueprintVersion[];
};

export class Blueprints {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Get scenario blueprint
     * @param scenarioId The scenario ID to get the blueprint for
     * @returns Promise with the scenario blueprint
     */
    async get(scenarioId: number): Promise<Blueprint> {
        return (await this.#fetch<GetScenarioBlueprintResponse>(`/scenarios/${scenarioId}/blueprint`)).response
            .blueprint;
    }

    /**
     * Get blueprint versions
     * @param scenarioId The scenario ID to get versions for
     * @returns Promise with the blueprint versions
     */
    async versions(scenarioId: number): Promise<BlueprintVersion[]> {
        return (await this.#fetch<GetBlueprintVersionsResponse>(`/scenarios/${scenarioId}/blueprints`))
            .scenariosBlueprints;
    }
}
