import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a publicly available approved template in Make.
 * Public templates can be discovered and used by all Make users.
 */
export type Template = {
    /** Unique identifier of the public template */
    id: number;
    /** Name of the public template */
    name: string;
    /** Human-readable description of what the template does, or null if not set */
    description: string | null;
    /** URL slug identifying this public template */
    url: string;
    /** List of app identifiers used in the template */
    usedApps: string[];
    /** Number of times this template has been used */
    usage: number;
};

/**
 * Represents the blueprint (scenario definition) extracted from a template.
 * Contains the full scenario configuration including flow, scheduling, and metadata.
 */
export type TemplateBlueprint = {
    /** The scenario blueprint definition */
    blueprint: Record<string, unknown>;
    /** Controller configuration for the scenario */
    controller: Record<string, unknown>;
    /** Scheduling configuration for the scenario */
    scheduling: Record<string, unknown>;
    /** Language code for the template */
    language: string;
    /** Additional metadata for the template, or null if not set */
    metadata: Record<string, unknown> | null;
};

/**
 * Options for listing public approved templates.
 * @template C Keys of the Template type to include in the response
 */
export type ListTemplatesOptions<C extends keyof Template = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<Template>>;
    /** Search templates by name */
    name?: string;
    /** Filter templates by apps used */
    usedApps?: string[];
    /** Whether to include English-language templates in results */
    includeEn?: boolean;
};

/**
 * Options for getting a single public template.
 * @template C Keys of the Template type to include in the response
 */
export type GetTemplateOptions<C extends keyof Template = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Response format for listing public templates.
 */
type ListTemplatesResponse<C extends keyof Template = never> = {
    /** List of public templates matching the query */
    templatesPublic: PickColumns<Template, C>[];
    /** Pagination information */
    pg: Pagination<Template>;
};

/**
 * Response format for getting a single public template.
 */
type GetTemplateResponse<C extends keyof Template = never> = {
    /** The requested public template */
    templatePublic: PickColumns<Template, C>;
};

/**
 * Class providing methods for working with public Make templates.
 * Public templates are approved scenario configurations that can be
 * discovered and used by any Make user.
 */
export class Templates {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Templates instance.
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
    async list<C extends keyof Template = never>(
        options: ListTemplatesOptions<C> = {},
    ): Promise<PickColumns<Template, C>[]> {
        return (
            await this.#fetch<ListTemplatesResponse<C>>('/templates/public', {
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
    async get<C extends keyof Template = never>(
        templateUrl: string,
        options: GetTemplateOptions<C> = {},
    ): Promise<PickColumns<Template, C>> {
        return (
            await this.#fetch<GetTemplateResponse<C>>(`/templates/public/${templateUrl}`, {
                query: {
                    cols: options.cols,
                },
            })
        ).templatePublic;
    }

    /**
     * Get the blueprint (scenario definition) for a public template.
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
    async getBlueprint(templateUrl: string): Promise<TemplateBlueprint> {
        return await this.#fetch<TemplateBlueprint>(`/templates/public/${templateUrl}/blueprint`);
    }
}
