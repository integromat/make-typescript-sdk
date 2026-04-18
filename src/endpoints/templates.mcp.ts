import type { Make } from '../make.js';

export const tools = [
    {
        name: 'templates_list',
        title: 'List templates',
        description:
            'List private templates accessible to the authenticated user, optionally filtered by team, public status, or used apps',
        category: 'templates',
        scope: 'templates:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to filter templates by' },
                public: { type: 'boolean', description: 'Filter by whether the template is public' },
                usedApps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Filter templates by apps used',
                },
            },
        },
        examples: [{ teamId: 1 }],
        execute: async (make: Make, args: { teamId?: number; public?: boolean; usedApps?: string[] }) => {
            return await make.templates.list({ ...args, cols: ['*'] });
        },
    },
    {
        name: 'templates_list-public',
        title: 'List public templates',
        description:
            'Search and list public (approved) templates available for anyone. Supports name-based search for template discovery. Results are sorted by usage by default.',
        category: 'templates',
        scope: 'templates:read',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Search templates by name' },
                usedApps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Filter templates by apps used',
                },
                includeEn: { type: 'boolean', description: 'Whether to include English-language templates in results' },
            },
        },
        examples: [{ name: 'webhook' }],
        execute: async (make: Make, args: { name?: string; usedApps?: string[]; includeEn?: boolean }) => {
            return await make.templates.listPublic({ ...args, cols: ['*'] });
        },
    },
    {
        name: 'templates_get',
        title: 'Get template',
        description: 'Get details of a private template by its ID',
        category: 'templates',
        scope: 'templates:read',
        identifier: 'templateId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                templateId: { type: 'number', description: 'The template ID to retrieve' },
            },
            required: ['templateId'],
        },
        examples: [{ templateId: 61 }],
        execute: async (make: Make, args: { templateId: number }) => {
            return await make.templates.get(args.templateId, { cols: ['*'] });
        },
    },
    {
        name: 'templates_get-blueprint',
        title: 'Get template blueprint',
        description:
            'Get the full blueprint of a template including scenario flow, controller configuration, scheduling, and metadata',
        category: 'templates',
        scope: 'templates:read',
        identifier: 'templateId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                templateId: { type: 'number', description: 'The template ID to retrieve the blueprint for' },
                forUse: {
                    type: 'boolean',
                    description: 'Whether to retrieve the blueprint for immediate use in a new scenario',
                },
                templatePublicId: {
                    type: 'number',
                    description: 'ID of the public template to retrieve the blueprint for',
                },
            },
            required: ['templateId'],
        },
        examples: [{ templateId: 61 }],
        execute: async (make: Make, args: { templateId: number; forUse?: boolean; templatePublicId?: number }) => {
            const { templateId, ...options } = args;
            return await make.templates.getBlueprint(templateId, options);
        },
    },
];
