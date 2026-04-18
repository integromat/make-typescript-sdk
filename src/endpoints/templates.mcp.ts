import type { Make } from '../make.js';

export const tools = [
    {
        name: 'templates_list',
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
                includeEn: {
                    type: 'boolean',
                    description: 'Whether to include English-language templates in results',
                },
            },
        },
        examples: [{ name: 'webhook' }],
        execute: async (make: Make, args: { name?: string; usedApps?: string[]; includeEn?: boolean }) => {
            return await make.templates.list({ ...args, cols: ['*'] });
        },
    },
    {
        name: 'templates_get',
        title: 'Get public template',
        description:
            'Get details of a public template by its URL slug (e.g. "12289-add-webhook-data-to-a-google-sheet"). Use this for templates discovered via templates_list.',
        category: 'templates',
        scope: 'templates:read',
        identifier: 'templateUrl',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                templateUrl: {
                    type: 'string',
                    description: 'The URL slug of the template (e.g. "12289-add-webhook-data-to-a-google-sheet")',
                },
            },
            required: ['templateUrl'],
        },
        examples: [{ templateUrl: '12289-add-webhook-data-to-a-google-sheet' }],
        execute: async (make: Make, args: { templateUrl: string }) => {
            return await make.templates.get(args.templateUrl, { cols: ['*'] });
        },
    },
    {
        name: 'templates_get-blueprint',
        title: 'Get public template blueprint',
        description:
            'Get the full blueprint of a public template including scenario flow, controller configuration, scheduling, and metadata. Use this for templates discovered via templates_list.',
        category: 'templates',
        scope: 'templates:read',
        identifier: 'templateUrl',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                templateUrl: {
                    type: 'string',
                    description: 'The URL slug of the template (e.g. "12289-add-webhook-data-to-a-google-sheet")',
                },
            },
            required: ['templateUrl'],
        },
        examples: [{ templateUrl: '12289-add-webhook-data-to-a-google-sheet' }],
        execute: async (make: Make, args: { templateUrl: string }) => {
            return await make.templates.getBlueprint(args.templateUrl);
        },
    },
];
