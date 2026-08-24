import type { FetchFunction } from '../types.js';

/**
 * Colour of a scenario label, one of the fixed palette values supported by the API.
 */
export type ScenarioLabelColour = 'white' | 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'pink';

/**
 * Represents a scenario label in Make.
 * Scenario labels are team-scoped tags with a many-to-many relationship to scenarios:
 * a scenario can carry any number of labels and a label can be assigned to any number
 * of the team's scenarios. Labels are independent of scenario folders.
 */
export type ScenarioLabel = {
    /** Unique identifier of the label */
    id: number;
    /** Name of the label */
    name: string;
    /** Colour of the label */
    colour: ScenarioLabelColour;
    /** Scope of the label. Currently always `team` */
    scope: 'team';
    /** ID of the team that owns the label */
    teamId: number | null;
    /** Optional human-readable description of the label, or `null` when not set */
    description: string | null;
    /** ID of the user who created the label, or `null` when unavailable */
    createdBy: number | null;
    /** Timestamp when the label was created */
    created: string;
    /** Timestamp when the label was last updated, or `null` when never updated */
    updated: string | null;
};

/**
 * Catalog item shape returned when listing a team's scenario labels: the label plus the
 * aggregate number of non-trashed scenarios currently carrying it. The aggregate is
 * list-only — single-label responses return a plain {@link ScenarioLabel}.
 */
export type ScenarioLabelWithCount = ScenarioLabel & {
    /** Number of the team's non-trashed scenarios carrying this label */
    scenariosCount: number;
};

/**
 * Response format for listing scenario labels.
 */
type ListScenarioLabelsResponse = {
    /** The team's scenario label catalog */
    labels: ScenarioLabelWithCount[];
};

/**
 * Class providing methods for working with scenario labels.
 */
export class ScenarioLabels {
    readonly #fetch: FetchFunction;

    /** @internal */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List a team's scenario label catalog, including how many scenarios carry each label.
     * @param teamId The team ID to list scenario labels for
     * @returns The team's scenario labels with their scenario counts
     */
    async list(teamId: number): Promise<ScenarioLabelWithCount[]> {
        const response = await this.#fetch<ListScenarioLabelsResponse>('/scenario-labels', {
            query: { teamId },
        });
        return response.labels;
    }
}
