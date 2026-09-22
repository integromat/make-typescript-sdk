import type { Make } from '../make.js';
import type { Blueprint } from './blueprints.js';
import type { Scheduling } from './scenarios.js';
import type { GetTemplateBlueprintOptions, TemplateController, UpdateTemplateBody } from './templates.js';
import type { JSONSchema, MakeTool } from '../tools.js';
import type { JSONValue } from '../types.js';

const controllerInputSchema: JSONSchema = {
    type: 'object',
    description: 'Controller configuration for the template.',
    properties: {
        name: { type: 'string', description: 'Controller name' },
        modules: { type: 'object', description: 'Controller-tracked module state, keyed by module ID' },
        idSequence: { type: 'number', description: 'Next ID to assign when adding a module' },
    },
    required: ['name', 'modules', 'idSequence'],
};

export const tools: MakeTool[] = [
    {
        name: 'templates_list',
        title: 'List templates',
        description:
            "List templates. Omit teamId to list every status the caller can see; provide teamId to scope the list to that team's own templates.",
        category: 'templates',
        scope: 'templates:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: "Filter templates by the owning team's ID" },
                usedApps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Filter templates by apps used',
                },
                public: {
                    type: 'boolean',
                    description: 'Filter by public status; omit to get every status',
                },
            },
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args?: { teamId?: number; usedApps?: string[]; public?: boolean }) => {
            return await make.templates.list({ ...(args ?? {}), cols: ['*'] });
        },
    },
    {
        name: 'templates_get',
        title: 'Get template',
        description: 'Get details of a template by its ID. Use this for templates discovered via templates_list.',
        category: 'templates',
        scope: 'templates:read',
        scopeId: 'id',
        identifier: 'id',
        resourceId: 'id',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'The template ID' },
            },
            required: ['id'],
        },
        examples: [{ id: 13 }],
        execute: async (make: Make, args: { id: number }) => {
            return await make.templates.get(args.id, { cols: ['*'] });
        },
    },
    {
        name: 'templates_get-blueprint',
        title: 'Get template blueprint',
        description:
            'Get the full blueprint of a template including scenario flow, controller configuration, scheduling, and metadata.',
        category: 'templates',
        scope: 'templates:read',
        scopeId: 'id',
        identifier: 'id',
        resourceId: 'id',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'The template ID' },
                forUse: {
                    type: 'boolean',
                    description: 'Whether the blueprint is being fetched to base a new scenario on it',
                },
            },
            required: ['id'],
        },
        examples: [{ id: 13 }],
        execute: async (make: Make, args: { id: number; forUse?: boolean }) => {
            const options: GetTemplateBlueprintOptions = { forUse: args.forUse };
            return await make.templates.getBlueprint(args.id, options);
        },
    },
    {
        name: 'templates_create',
        title: 'Create template',
        description: "Create a new template in a team's library from a blueprint.",
        category: 'templates',
        scope: 'scenarios:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'ID of the team where the template will be created' },
                language: { type: 'string', description: 'Language code for the template (e.g. "en")' },
                blueprint: { type: 'object', description: 'Blueprint containing the scenario configuration' },
                scheduling: { type: 'object', description: 'Scheduling configuration for the template' },
                controller: controllerInputSchema,
                metadata: {
                    type: 'object',
                    description: 'Additional metadata, e.g. input_spec/output_spec for on-demand templates',
                    properties: {
                        input_spec: { type: 'array', items: { type: 'object' } },
                        output_spec: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
            required: ['teamId', 'language', 'blueprint', 'scheduling', 'controller'],
        },
        examples: [
            {
                teamId: 5,
                language: 'en',
                blueprint: { name: 'Example', flow: [], metadata: { version: 1 } },
                scheduling: { type: 'indefinitely', interval: 900 },
                controller: { name: 'Example', modules: {}, idSequence: 1 },
            },
        ],
        execute: async (
            make: Make,
            args: {
                teamId: number;
                language: string;
                blueprint: Blueprint;
                scheduling: Scheduling;
                controller: TemplateController;
                metadata?: { input_spec?: JSONValue; output_spec?: JSONValue };
            },
        ) => {
            return await make.templates.create(args);
        },
    },
    {
        name: 'templates_update',
        title: 'Update template',
        description: "Update a template's name, blueprint, scheduling, or controller configuration.",
        category: 'templates',
        scope: 'templates:write',
        scopeId: 'id',
        identifier: 'id',
        resourceId: 'id',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'The template ID to update' },
                name: { type: 'string', description: 'New name for the template' },
                blueprint: { type: 'object', description: 'Updated blueprint configuration' },
                scheduling: { type: 'object', description: 'Updated scheduling configuration' },
                controller: controllerInputSchema,
                metadata: {
                    type: 'object',
                    description: 'Additional metadata, e.g. input_spec/output_spec for on-demand templates',
                    properties: {
                        input_spec: { type: 'array', items: { type: 'object' } },
                        output_spec: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
            required: ['id'],
        },
        examples: [{ id: 13, name: 'Renamed template' }],
        execute: async (make: Make, args: { id: number } & UpdateTemplateBody) => {
            const { id, ...body } = args;
            return await make.templates.update(id, body);
        },
    },
    {
        name: 'templates_delete',
        title: 'Delete template',
        description: 'Delete a template.',
        category: 'templates',
        scope: 'templates:write',
        scopeId: 'id',
        identifier: 'id',
        resourceId: 'id',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'The template ID to delete' },
            },
            required: ['id'],
        },
        examples: [{ id: 13 }],
        execute: async (make: Make, args: { id: number }) => {
            await make.templates.delete(args.id);
            return `Template has been deleted.`;
        },
    },
];
