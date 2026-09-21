import type { FetchFunction, JSONValue, Pagination, PickColumns } from '../types.js';
import type { Blueprint } from './blueprints.js';
import type { Scheduling } from './scenarios.js';

export type Template = {
    id: number;
    name: string;
    teamId: number;
    teamName?: string;
    organizationId?: string;
    description: string | null;
    usedApps: string[];
    public: boolean;
    published: string | null;
    approved: string | null;
    approvedId: number | null;
    requestedApproval: boolean;
    publishedId: number | null;
    publicUrl: string | null;
    approvedName: string | null;
    publishedName: string | null;
};

export type TemplateController = {
    name: string;
    modules: Record<string, JSONValue>;
    idSequence: number;
};

export type TemplateBlueprintEnvelope = {
    blueprint: Omit<Blueprint, 'scheduling' | 'interface'>;
    controller: TemplateController;
    scheduling: Scheduling;
    language: string;
    metadata: Record<string, unknown> | null;
};

export type ListTemplatesOptions<C extends keyof Template = never> = {
    cols?: C[] | ['*'];
    pg?: Partial<Pagination<Template>>;
    teamId?: number;
    usedApps?: string[];
    public?: boolean;
};

export type GetTemplateOptions<C extends keyof Template = never> = {
    cols?: C[] | ['*'];
};

export type GetTemplateBlueprintOptions = {
    forUse?: boolean;
};

export type CreateTemplateBody = {
    teamId: number;
    language: string;
    blueprint: Blueprint;
    scheduling: Scheduling;
    controller: TemplateController;
    metadata?: {
        input_spec?: JSONValue;
        output_spec?: JSONValue;
    };
};

export type UpdateTemplateBody = {
    name?: string;
    blueprint?: Blueprint;
    scheduling?: Scheduling;
    controller?: TemplateController;
    metadata?: {
        input_spec?: JSONValue;
        output_spec?: JSONValue;
    };
};

type ListTemplatesResponse<C extends keyof Template = never> = {
    templates: PickColumns<Template, C>[];
    pg: Pagination<Template>;
};

type GetTemplateResponse<C extends keyof Template = never> = {
    template: PickColumns<Template, C>;
};

type CreateTemplateResponse = {
    template: Template;
};

type UpdateTemplateResponse = {
    template: Template[];
};

type DeleteTemplateResponse = {
    template: number;
};

export class Templates {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

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

    async getBlueprint(id: number, options: GetTemplateBlueprintOptions = {}): Promise<TemplateBlueprintEnvelope> {
        return await this.#fetch<TemplateBlueprintEnvelope>(`/templates/${id}/blueprint`, {
            query: { forUse: options.forUse },
        });
    }

    async create(body: CreateTemplateBody): Promise<Template> {
        return (
            await this.#fetch<CreateTemplateResponse>('/templates', {
                method: 'POST',
                body,
            })
        ).template;
    }

    async update(id: number, body: UpdateTemplateBody): Promise<Template> {
        const template = (
            await this.#fetch<UpdateTemplateResponse>(`/templates/${id}`, {
                method: 'PATCH',
                body,
            })
        ).template[0];
        return template as Template;
    }

    async delete(id: number): Promise<number> {
        return (
            await this.#fetch<DeleteTemplateResponse>(`/templates/${id}`, {
                method: 'DELETE',
                query: { confirmed: true },
            })
        ).template;
    }
}
