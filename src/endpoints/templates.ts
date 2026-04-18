import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a private team-scoped template in Make.
 * Templates allow users to create reusable scenario configurations
 * that can optionally be shared publicly or submitted for approval.
 */
export type Template = {
    /** Unique identifier of the template */
    id: number;
    /** Name of the template */
    name: string;
    /** ID of the team that owns the template */
    teamId: number;
    /** Human-readable description of what the template does, or null if not set */
    description: string | null;
    /** List of app identifiers used in the template */
    usedApps: string[];
    /** Whether the template has been made publicly visible */
    public: boolean;
    /** ISO timestamp when the template was published, or null if not published */
    published: string | null;
    /** ISO timestamp when the template was approved, or null if not approved */
    approved: string | null;
    /** ID of the approving user, or null if not approved */
    approvedId: number | null;
    /** Whether approval has been requested for the template, or null if not applicable */
    requestedApproval: boolean | null;
    /** ID of the publishing user, or null if not published */
    publishedId: number | null;
    /** Public URL slug of the template, or null if not published */
    publicUrl: string | null;
    /** Name of the approving user, or null if not approved */
    approvedName: string | null;
    /** Name of the publishing user, or null if not published */
    publishedName: string | null;
};

/**
 * Represents a publicly available approved template in Make.
 * Public templates can be discovered and used by all Make users.
 */
export type TemplatePublic = {
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
 * Options for listing private team templates.
 * @template C Keys of the Template type to include in the response
 */
export type ListTemplatesOptions<C extends keyof Template = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<Template>>;
    /** Filter templates by team ID */
    teamId?: number;
    /** Filter by whether the template is public */
    public?: boolean;
    /** Filter templates by apps used */
    usedApps?: string[];
};

/**
 * Options for listing public approved templates.
 * @template C Keys of the TemplatePublic type to include in the response
 */
export type ListTemplatesPublicOptions<C extends keyof TemplatePublic = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<TemplatePublic>>;
    /** Search templates by name */
    name?: string;
    /** Filter templates by apps used */
    usedApps?: string[];
    /** Whether to include English-language templates in results */
    includeEn?: boolean;
};

/**
 * Options for getting a single template.
 * @template C Keys of the Template type to include in the response
 */
export type GetTemplateOptions<C extends keyof Template = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Options for getting a template blueprint.
 */
export type GetTemplateBlueprintOptions = {
    /** Whether to retrieve the blueprint for immediate use in a new scenario */
    forUse?: boolean;
    /** ID of the public template to retrieve the blueprint for */
    templatePublicId?: number;
};

/**
 * Options for getting a single public template.
 * @template C Keys of the TemplatePublic type to include in the response
 */
export type GetTemplatePublicOptions<C extends keyof TemplatePublic = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** ID of the public template to retrieve */
    templatePublicId?: number;
};

/**
 * Options for getting a public template blueprint.
 */
export type GetTemplatePublicBlueprintOptions = {
    /** ID of the public template to retrieve the blueprint for */
    templatePublicId?: number;
};

/**
 * Response format for listing private templates.
 */
type ListTemplatesResponse<C extends keyof Template = never> = {
    /** List of templates matching the query */
    templates: PickColumns<Template, C>[];
    /** Pagination information */
    pg: Pagination<Template>;
};

/**
 * Response format for listing public templates.
 */
type ListTemplatesPublicResponse<C extends keyof TemplatePublic = never> = {
    /** List of public templates matching the query */
    templatesPublic: PickColumns<TemplatePublic, C>[];
    /** Pagination information */
    pg: Pagination<TemplatePublic>;
};

/**
 * Response format for getting a single template.
 */
type GetTemplateResponse<C extends keyof Template = never> = {
    /** The requested template */
    template: PickColumns<Template, C>;
};

/**
 * Response format for getting a single public template.
 */
type GetTemplatePublicResponse<C extends keyof TemplatePublic = never> = {
    /** The requested public template */
    templatePublic: PickColumns<TemplatePublic, C>;
};

/**
 * Class providing methods for working with Make templates.
 * Templates allow users to create reusable scenario configurations
 * that can be shared, published, and discovered by other users.
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
     * List private templates accessible to the authenticated user.
     * Results can be filtered by team, public status, and used apps.
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of templates
     *
     * @example
     * ```typescript
     * // List all templates for team 1
     * const templates = await make.templates.list({ teamId: 1 });
     *
     * // List only public templates
     * const publicTemplates = await make.templates.list({ public: true });
     * ```
     */
    async list<C extends keyof Template = never>(
        options: ListTemplatesOptions<C> = {},
    ): Promise<PickColumns<Template, C>[]> {
        const { teamId, public: isPublic, usedApps, cols, pg } = options;
        return (
            await this.#fetch<ListTemplatesResponse<C>>('/templates', {
                query: {
                    teamId,
                    public: isPublic,
                    usedApps,
                    cols,
                    pg,
                },
            })
        ).templates;
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
     * const templates = await make.templates.listPublic({ name: 'webhook' });
     *
     * // Filter by apps used
     * const gmailTemplates = await make.templates.listPublic({ usedApps: ['gmail'] });
     * ```
     */
    async listPublic<C extends keyof TemplatePublic = never>(
        options: ListTemplatesPublicOptions<C> = {},
    ): Promise<PickColumns<TemplatePublic, C>[]> {
        return (
            await this.#fetch<ListTemplatesPublicResponse<C>>('/templates/public', {
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
     * Get a single template by ID.
     * @param templateId The template ID to retrieve
     * @param options Optional parameters for field selection
     * @returns Promise with the template details
     *
     * @example
     * ```typescript
     * const template = await make.templates.get(61);
     * ```
     */
    async get<C extends keyof Template = never>(
        templateId: number,
        options: GetTemplateOptions<C> = {},
    ): Promise<PickColumns<Template, C>> {
        return (
            await this.#fetch<GetTemplateResponse<C>>(`/templates/${templateId}`, {
                query: {
                    cols: options.cols,
                },
            })
        ).template;
    }

    /**
     * Get the blueprint (scenario definition) for a template.
     * The full response object is returned directly since the API returns a flat
     * structure rather than wrapping the blueprint in a named property.
     * @param templateId The template ID to retrieve the blueprint for
     * @param options Optional parameters for blueprint retrieval
     * @returns Promise with the full blueprint response
     *
     * @example
     * ```typescript
     * // Get blueprint for immediate use
     * const blueprint = await make.templates.getBlueprint(61, { forUse: true });
     * ```
     */
    async getBlueprint(templateId: number, options: GetTemplateBlueprintOptions = {}): Promise<TemplateBlueprint> {
        return await this.#fetch<TemplateBlueprint>(`/templates/${templateId}/blueprint`, {
            query: {
                forUse: options.forUse,
                templatePublicId: options.templatePublicId,
            },
        });
    }

    /**
     * Get a single public template by its URL slug.
     * Use this for templates discovered via {@link listPublic}.
     * @param templateUrl The URL slug of the template (e.g. "12289-add-webhook-data-to-a-google-sheet")
     * @param options Optional parameters for field selection
     * @returns Promise with the public template details
     *
     * @example
     * ```typescript
     * const template = await make.templates.getPublic('12289-add-webhook-data-to-a-google-sheet');
     * ```
     */
    async getPublic<C extends keyof TemplatePublic = never>(
        templateUrl: string,
        options: GetTemplatePublicOptions<C> = {},
    ): Promise<PickColumns<TemplatePublic, C>> {
        return (
            await this.#fetch<GetTemplatePublicResponse<C>>(`/templates/public/${templateUrl}`, {
                query: {
                    cols: options.cols,
                    templatePublicId: options.templatePublicId,
                },
            })
        ).templatePublic;
    }

    /**
     * Get the blueprint (scenario definition) for a public template.
     * Use this for templates discovered via {@link listPublic}.
     * The full response object is returned directly since the API returns a flat
     * structure rather than wrapping the blueprint in a named property.
     * @param templateUrl The URL slug of the template (e.g. "12289-add-webhook-data-to-a-google-sheet")
     * @param options Optional parameters for blueprint retrieval
     * @returns Promise with the full blueprint response
     *
     * @example
     * ```typescript
     * const blueprint = await make.templates.getPublicBlueprint('12289-add-webhook-data-to-a-google-sheet');
     * ```
     */
    async getPublicBlueprint(
        templateUrl: string,
        options: GetTemplatePublicBlueprintOptions = {},
    ): Promise<TemplateBlueprint> {
        return await this.#fetch<TemplateBlueprint>(`/templates/public/${templateUrl}/blueprint`, {
            query: {
                templatePublicId: options.templatePublicId,
            },
        });
    }
}
