import type { FetchFunction, Pagination, PickColumns } from '../types.js';
import type { Blueprint } from './blueprints.js';
import type { Scheduling } from './scenarios.js';

/**
 * Represents a publicly available approved template in Make.
 * Public templates can be discovered and used by all Make users.
 */
export type PublicTemplate = {
    /** Unique identifier of the public template */
    id: number;
    /** Name of the public template */
    name: string;
    /** Human-readable description of what the public template does, or null if not set */
    description: string | null;
    /** URL slug identifying this public template */
    url: string;
    /** List of app identifiers used in the public template */
    usedApps: string[];
    /** Number of times this public template has been used */
    usage: number;
};

/**
 * Blueprint payload returned by the public-template blueprint endpoint.
 * Wraps the scenario blueprint together with its scheduling and controller configuration.
 */
export type PublicTemplateBlueprint = {
    /** The scenario blueprint definition (modules, flow, metadata). Scheduling is exposed at the top level of this payload instead. */
    blueprint: Omit<Blueprint, 'scheduling' | 'interface'>;
    /** Controller configuration for the scenario */
    controller: {
        /** Controller name */
        name: string;
        /** Controller-tracked module state, keyed by module ID */
        modules: Record<string, unknown>;
        /** Next ID to assign when adding a module */
        idSequence: number;
    };
    /** Scheduling configuration for the scenario */
    scheduling: Scheduling;
    /** Language code for the public template (e.g. "en") */
    language: string;
    /** Additional metadata for the public template, or null if not set */
    metadata: Record<string, unknown> | null;
};

/**
 * Options for listing public (approved) templates.
 * @template C Keys of the PublicTemplate type to include in the response
 */
export type ListPublicTemplatesOptions<C extends keyof PublicTemplate = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<PublicTemplate>>;
    /** Search public templates by name */
    name?: string;
    /** Filter public templates by apps used */
    usedApps?: string[];
    /** Whether to include English-language public templates in results */
    includeEn?: boolean;
};

/**
 * Options for getting a single public template.
 * @template C Keys of the PublicTemplate type to include in the response
 */
export type GetPublicTemplateOptions<C extends keyof PublicTemplate = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Response format for listing public templates.
 */
type ListPublicTemplatesResponse<C extends keyof PublicTemplate = never> = {
    /** List of public templates matching the query */
    templatesPublic: PickColumns<PublicTemplate, C>[];
    /** Pagination information */
    pg: Pagination<PublicTemplate>;
};

/**
 * Response format for getting a single public template.
 */
type GetPublicTemplateResponse<C extends keyof PublicTemplate = never> = {
    /** The requested public template */
    templatePublic: PickColumns<PublicTemplate, C>;
};

/**
 * Class providing methods for working with public Make templates.
 * Public templates are approved scenario configurations that can be
 * discovered and used by any Make user.
 */
export class PublicTemplates {
    readonly #fetch: FetchFunction;

    /**
     * Create a new PublicTemplates instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List public (approved) templates available for anyone.
     * Supports name-based search for template discovery.
     * Results are sorted by usage in descending order by default.
     * @param options Optional parameters for searching, filtering, and pagination
     * @returns Promise with the list of public templates
     *
     * @example
     * ```typescript
     * // Search public templates by name
     * const templates = await make.templates.list({ name: 'webhook' });
     *
     * // Filter by apps used
     * const gmailTemplates = await make.templates.list({ usedApps: ['gmail'] });
     * ```
     */
    async list<C extends keyof PublicTemplate = never>(
        options: ListPublicTemplatesOptions<C> = {},
    ): Promise<PickColumns<PublicTemplate, C>[]> {
        return (
            await this.#fetch<ListPublicTemplatesResponse<C>>('/templates/public', {
                query: {
                    name: options.name,
                    usedApps: options.usedApps,
                    includeEn: options.includeEn,
                    cols: options.cols,
                    pg: options.pg,
                },
            })
        ).templatesPublic;
    }

    /**
     * Get a single public template by its URL slug.
     * Use this for templates discovered via {@link list}.
     * @param templateUrl The URL slug of the template (e.g. "12289-add-webhook-data-to-a-google-sheet")
     * @param options Optional parameters for field selection
     * @returns Promise with the public template details
     *
     * @example
     * ```typescript
     * const template = await make.templates.get('12289-add-webhook-data-to-a-google-sheet');
     * ```
     */
    async get<C extends keyof PublicTemplate = never>(
        templateUrl: string,
        options: GetPublicTemplateOptions<C> = {},
    ): Promise<PickColumns<PublicTemplate, C>> {
        return (
            await this.#fetch<GetPublicTemplateResponse<C>>(`/templates/public/${templateUrl}`, {
                query: {
                    cols: options.cols,
                },
            })
        ).templatePublic;
    }

    /**
     * Get the blueprint (scenario definition) for a public template by its URL slug.
     * The full response object is returned directly since the API returns a flat
     * structure rather than wrapping the blueprint in a named property.
     * @param templateUrl The URL slug of the template (e.g. "12289-add-webhook-data-to-a-google-sheet")
     * @returns Promise with the full blueprint response
     *
     * @example
     * ```typescript
     * const blueprint = await make.templates.getBlueprint('12289-add-webhook-data-to-a-google-sheet');
     * ```
     */
    async getBlueprint(templateUrl: string): Promise<PublicTemplateBlueprint> {
        return await this.#fetch<PublicTemplateBlueprint>(`/templates/public/${templateUrl}/blueprint`);
    }
}
