import type { Make } from '../make.js';

export const tools = [
    {
        name: 'public-templates_list',
        title: 'List public templates',
        description:
            'Search and list public (approved) templates available for anyone. Supports name-based search for template discovery. Results are sorted by usage by default.',
        category: 'public-templates',
        scope: 'templates:read',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Search public templates by name' },
                usedApps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Filter public templates by apps used',
                },
                includeEn: {
                    type: 'boolean',
                    description: 'Whether to include English-language public templates in results',
                },
            },
        },
        examples: [{ name: 'webhook' }],
        execute: async (make: Make, args?: { name?: string; usedApps?: string[]; includeEn?: boolean }) => {
            return await make.publicTemplates.list({ ...(args ?? {}), cols: ['*'] });
        },
    },
    {
        name: 'public-templates_get',
        title: 'Get public template',
        description:
            'Get details of a public template by its URL slug (e.g. "12289-add-webhook-data-to-a-google-sheet"). Use this for templates discovered via public-templates_list.',
        category: 'public-templates',
        scope: 'templates:read',
        scopeId: 'templateUrl',
        identifier: 'templateUrl',
        resourceId: 'templateUrl',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                templateUrl: {
                    type: 'string',
                    description:
                        'The URL slug of the public template (e.g. "12289-add-webhook-data-to-a-google-sheet")',
                },
            },
            required: ['templateUrl'],
        },
        examples: [{ templateUrl: '12289-add-webhook-data-to-a-google-sheet' }],
        execute: async (make: Make, args: { templateUrl: string }) => {
            return await make.publicTemplates.get(args.templateUrl, { cols: ['*'] });
        },
    },
    {
        name: 'public-templates_get-blueprint',
        title: 'Get public template blueprint',
        description:
            'Get the full blueprint of a public template including scenario flow, controller configuration, scheduling, and metadata. Use this for templates discovered via public-templates_list.',
        category: 'public-templates',
        scope: 'templates:read',
        scopeId: 'templateUrl',
        identifier: 'templateUrl',
        resourceId: 'templateUrl',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                templateUrl: {
                    type: 'string',
                    description:
                        'The URL slug of the public template (e.g. "12289-add-webhook-data-to-a-google-sheet")',
                },
            },
            required: ['templateUrl'],
        },
        examples: [{ templateUrl: '12289-add-webhook-data-to-a-google-sheet' }],
        execute: async (make: Make, args: { templateUrl: string }) => {
            return await make.publicTemplates.getBlueprint(args.templateUrl);
        },
    },
];
