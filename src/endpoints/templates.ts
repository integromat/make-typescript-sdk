import type { FetchFunction, JSONValue, Pagination, PickColumns } from '../types.js';
import type { Blueprint } from './blueprints.js';
import type { Scheduling } from './scenarios.js';

/**
 * Represents a template in Make — a team's own saved scenario configuration.
 */
export type Template = {
    /** Unique identifier of the template */
    id: number;
    /** Name of the template */
    name: string;
    /** ID of the team that owns the template */
    teamId: number;
    /** Name of the owning team (admin-only column) */
    teamName?: string;
    /** ID of the owning organization (admin-only column) */
    organizationId?: number;
    /** Whether the template has been soft-deleted (admin-only column) */
    deleted?: boolean;
    /** Human-readable description of the template, or null if not set */
    description: string | null;
    /** List of app identifiers used in the template */
    usedApps: string[];
    /** Whether the template has been submitted to the public gallery */
    public: boolean;
    /** ISO date-time the template was published, or null */
    published: string | null;
    /** ISO date-time the template was approved, or null */
    approved: string | null;
    /** ID of the user who approved the template, or null */
    approvedId: number | null;
    /** Whether approval into the public gallery has been requested */
    requestedApproval: boolean;
    /** ID of the user who published the template, or null */
    publishedId: number | null;
    /** URL slug in the public gallery once approved, or null */
    publicUrl: string | null;
    /** Name of the user who approved the template, or null */
    approvedName: string | null;
    /** Name of the user who published the template, or null */
    publishedName: string | null;
};

/**
 * Controller configuration tracked alongside a template's blueprint.
 */
export type TemplateController = {
    /** Controller name */
    name: string;
    /** Controller-tracked module state, keyed by module ID */
    modules: Record<string, JSONValue>;
    /** Next ID to assign when adding a module */
    idSequence: number;
};

/**
 * Blueprint payload returned by the template blueprint endpoint.
 * Wraps the scenario blueprint together with its scheduling and controller configuration.
 */
export type TemplateBlueprintEnvelope = {
    /** The scenario blueprint definition (modules, flow, metadata). Scheduling is exposed at the top level of this payload instead. */
    blueprint: Omit<Blueprint, 'scheduling' | 'interface'>;
    /** Controller configuration for the scenario */
    controller: TemplateController;
    /** Scheduling configuration for the scenario */
    scheduling: Scheduling;
    /** Language code for the template (e.g. "en") */
    language: string;
    /** Additional metadata for the template, or null if not set */
    metadata: Record<string, JSONValue> | null;
};

/**
 * Options for listing templates.
 * @template C Keys of the Template type to include in the response
 */
export type ListTemplatesOptions<C extends keyof Template = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<Template>>;
    /** Filter templates by the owning team's ID */
    teamId?: number;
    /** Filter templates by apps used */
    usedApps?: string[];
    /** Filter by public status; omit to get every status */
    public?: boolean;
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
 * Options for getting a template's blueprint.
 */
export type GetTemplateBlueprintOptions = {
    /** Whether the blueprint is being fetched to base a new scenario on it */
    forUse?: boolean;
};

/**
 * Body for creating a template.
 */
export type CreateTemplateBody = {
    /** ID of the team where the template will be created */
    teamId: number;
    /** Language code for the template (e.g. "en") */
    language: string;
    /** Blueprint containing the scenario configuration */
    blueprint: Omit<Blueprint, 'scheduling' | 'interface'>;
    /** Scheduling configuration for the template */
    scheduling: Scheduling;
    /** Controller configuration for the template */
    controller: TemplateController;
    /** Additional metadata, e.g. input_spec/output_spec for on-demand templates */
    metadata?: {
        input_spec?: JSONValue;
        output_spec?: JSONValue;
    };
};

/**
 * Body for updating a template.
 */
export type UpdateTemplateBody = {
    /** New name for the template */
    name?: string;
    /** Updated blueprint configuration */
    blueprint?: Omit<Blueprint, 'scheduling' | 'interface'>;
    /** Updated scheduling configuration */
    scheduling?: Scheduling;
    /** Updated controller configuration */
    controller?: TemplateController;
    /** Additional metadata, e.g. input_spec/output_spec for on-demand templates */
    metadata?: {
        input_spec?: JSONValue;
        output_spec?: JSONValue;
    };
};

/**
 * Response format for listing templates.
 */
type ListTemplatesResponse<C extends keyof Template = never> = {
    /** List of templates matching the query */
    templates: PickColumns<Template, C>[];
    /** Pagination information */
    pg: Pagination<Template>;
};

/**
 * Response format for getting a single template.
 */
type GetTemplateResponse<C extends keyof Template = never> = {
    /** The requested template */
    template: PickColumns<Template, C>;
};

/**
 * Response format for creating a template.
 */
type CreateTemplateResponse = {
    /** The created template */
    template: Template;
};

/**
 * Response format for updating a template.
 */
type UpdateTemplateResponse = {
    /** The updated template */
    template: Template;
};

/**
 * Response format for deleting a template.
 */
type DeleteTemplateResponse = {
    /** The deleted template's ID */
    template: number;
};

/**
 * Serializes blueprint/scheduling/controller to JSON strings, as the API requires.
 * `blueprint`'s `Omit` type only blocks fresh object literals from carrying
 * `scheduling`/`interface` — a `Blueprint` value from elsewhere (e.g. `blueprints.get()`) still
 * has them at runtime, so they're stripped here rather than relied on at the type level.
 * @param body The body to serialize
 * @returns The serialized body
 */
function serializeTemplateBody<T extends Partial<Pick<CreateTemplateBody, 'blueprint' | 'scheduling' | 'controller'>>>(
    body: T,
): T {
    const blueprint = body.blueprint !== undefined ? { ...(body.blueprint as Partial<Blueprint>) } : undefined;
    if (blueprint !== undefined) {
        blueprint.scheduling = undefined;
        blueprint.interface = undefined;
    }
    return {
        ...body,
        blueprint: blueprint !== undefined ? JSON.stringify(blueprint) : undefined,
        scheduling: body.scheduling !== undefined ? JSON.stringify(body.scheduling) : undefined,
        controller: body.controller !== undefined ? JSON.stringify(body.controller) : undefined,
    } as T;
}

/**
 * Class providing methods for working with a team's own saved templates.
 * Templates are usable as a reference or copied into new scenarios.
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
     * List templates, optionally scoped to a team and filtered by apps used or public status.
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of templates
     */
    async list<C extends keyof Template = never>(
        options: ListTemplatesOptions<C> = {},
    ): Promise<PickColumns<Template, C>[]> {
        return (
            await this.#fetch<ListTemplatesResponse<C>>('/templates', {
                query: {
                    teamId: options.teamId,
                    usedApps: options.usedApps,
                    public: options.public,
                    cols: options.cols,
                    pg: options.pg,
                },
            })
        ).templates;
    }

    /**
     * Get a single template by its ID.
     * @param id The template ID
     * @param options Optional parameters for field selection
     * @returns Promise with the template details
     */
    async get<C extends keyof Template = never>(
        id: number,
        options: GetTemplateOptions<C> = {},
    ): Promise<PickColumns<Template, C>> {
        return (
            await this.#fetch<GetTemplateResponse<C>>(`/templates/${id}`, {
                query: { cols: options.cols },
            })
        ).template;
    }

    /**
     * Get the blueprint (scenario definition) for a template by its ID.
     * @param id The template ID
     * @param options Optional parameters, e.g. whether the blueprint is being fetched for use
     * @returns Promise with the full blueprint envelope
     */
    async getBlueprint(id: number, options: GetTemplateBlueprintOptions = {}): Promise<TemplateBlueprintEnvelope> {
        return await this.#fetch<TemplateBlueprintEnvelope>(`/templates/${id}/blueprint`, {
            query: { forUse: options.forUse },
        });
    }

    /**
     * Create a new template.
     * @param body Parameters for the template to create
     * @returns Promise with the created template
     */
    async create(body: CreateTemplateBody): Promise<Template> {
        return (
            await this.#fetch<CreateTemplateResponse>('/templates', {
                method: 'POST',
                body: serializeTemplateBody(body),
            })
        ).template;
    }

    /**
     * Update a template.
     * @param id The template ID to update
     * @param body Parameters to update in the template
     * @returns Promise with the updated template
     */
    async update(id: number, body: UpdateTemplateBody): Promise<Template> {
        return (
            await this.#fetch<UpdateTemplateResponse>(`/templates/${id}`, {
                method: 'PATCH',
                body: serializeTemplateBody(body),
            })
        ).template;
    }

    /**
     * Delete a template.
     * @param id The template ID to delete
     * @returns Promise with the deleted template's ID
     */
    async delete(id: number): Promise<number> {
        return (
            await this.#fetch<DeleteTemplateResponse>(`/templates/${id}`, {
                method: 'DELETE',
                query: { confirmed: true },
            })
        ).template;
    }
}
