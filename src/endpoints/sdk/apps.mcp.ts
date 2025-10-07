import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';

export const tools = [
    {
        name: 'sdk_apps_list',
        title: 'List SDK apps',
        description: 'List SDK apps with optional filtering',
        category: 'sdk.apps',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {}
        },
        execute: async (make: Make) => {
            return await make.sdk.apps.list();
        },
    },
    {
        name: 'sdk_apps_get',
        title: 'Get SDK app',
        description: 'Get a SDK app by name and version',
        category: 'sdk.apps',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
            },
            required: ['name', 'version'],
        },
        execute: async (make: Make, args: { name: string; version: number }) => {
            return await make.sdk.apps.get(args.name, args.version);
        },
    },
    {
        name: 'sdk_apps_create',
        title: 'Create SDK app',
        description: 'Create a new SDK app',
        category: 'sdk.apps',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app visible in the URL' },
                label: { type: 'string', description: 'The label of the app visible in the scenario builder' },
                description: { type: 'string', description: 'The description of the app' },
                theme: { type: 'string', description: 'The color of the app logo' },
                language: { type: 'string', description: 'The language of the app' },
                countries: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Countries where the app is available',
                },
                private: { type: 'boolean', description: 'Whether the app is private' },
                audience: { type: 'string', description: 'Audience setting for the app' },
            },
            required: ['name', 'label', 'audience'],
        },
        execute: async (
            make: Make,
            args: {
                name: string;
                label: string;
                description?: string;
                theme?: string;
                language?: string;
                countries?: string[];
                private?: boolean;
                audience: string;
            },
        ) => {
            return await make.sdk.apps.create(args);
        },
    },
    {
        name: 'sdk_apps_update',
        title: 'Update SDK app',
        description: 'Update an existing SDK app',
        category: 'sdk.apps',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
                label: { type: 'string', description: 'The label of the app visible in the scenario builder' },
                description: { type: 'string', description: 'The description of the app' },
                theme: { type: 'string', description: 'The color of the app logo' },
                language: { type: 'string', description: 'The language of the app' },
                countries: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Countries where the app is available',
                },
                audience: { type: 'string', description: 'Audience setting' },
            },
            required: ['name', 'version'],
        },
        execute: async (
            make: Make,
            args: {
                name: string;
                version: number;
                label?: string;
                description?: string;
                theme?: string;
                language?: string;
                countries?: string[];
                audience?: string;
            },
        ) => {
            const { name, version, ...body } = args;
            return await make.sdk.apps.update(name, version, body);
        },
    },
    {
        name: 'sdk_apps_delete',
        title: 'Delete SDK app',
        description: 'Delete a SDK app by name and version',
        category: 'sdk.apps',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
            },
            required: ['name', 'version'],
        },
        execute: async (make: Make, args: { name: string; version: number }) => {
            await make.sdk.apps.delete(args.name, args.version);
            return `App has been deleted.`;
        },
    },
    {
        name: 'sdk_apps_get_section',
        title: 'Get SDK app section',
        description: 'Get a specific section of a SDK app',
        category: 'sdk.apps',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
                section: {
                    type: 'string',
                    enum: ['base', 'groups', 'install', 'installSpec'],
                    description: 'The section to get',
                },
            },
            required: ['name', 'version', 'section'],
        },
        execute: async (
            make: Make,
            args: { name: string; version: number; section: 'base' | 'groups' | 'install' | 'installSpec' },
        ) => {
            return await make.sdk.apps.getSection(args.name, args.version, args.section);
        },
    },
    {
        name: 'sdk_apps_set_section',
        title: 'Set SDK app section',
        description: 'Set/update a specific section of a SDK app',
        category: 'sdk.apps',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
                section: {
                    type: 'string',
                    enum: ['base', 'groups', 'install', 'installSpec'],
                    description: 'The section to set',
                },
                body: { type: 'string', description: 'The section data to set in JSONC format' },
            },
            required: ['name', 'version', 'section', 'body'],
        },
        execute: async (
            make: Make,
            args: {
                name: string;
                version: number;
                section: 'base' | 'groups' | 'install' | 'installSpec';
                body: string;
            },
        ) => {
            await make.sdk.apps.setSection(args.name, args.version, args.section, args.body);
            return `Section '${args.section}' has been set.`;
        },
    },
    {
        name: 'sdk_apps_get_docs',
        title: 'Get SDK app documentation',
        description: 'Get app documentation (readme)',
        category: 'sdk.apps',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
            },
            required: ['name', 'version'],
        },
        execute: async (make: Make, args: { name: string; version: number }) => {
            return await make.sdk.apps.getDocs(args.name, args.version);
        },
    },
    {
        name: 'sdk_apps_set_docs',
        title: 'Set SDK app documentation',
        description: 'Set app documentation (readme)',
        category: 'sdk.apps',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
                docs: { type: 'string', description: 'The documentation content in markdown format' },
            },
            required: ['name', 'version', 'docs'],
        },
        execute: async (make: Make, args: { name: string; version: number; docs: string }) => {
            await make.sdk.apps.setDocs(args.name, args.version, args.docs);
            return `Documentation has been set.`;
        },
    },
    {
        name: 'sdk_apps_get_common',
        title: 'Get SDK app common data',
        description: 'Get app common data (client credentials and shared configuration)',
        category: 'sdk.apps',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
            },
            required: ['name', 'version'],
        },
        execute: async (make: Make, args: { name: string; version: number }) => {
            return await make.sdk.apps.getCommon(args.name, args.version);
        },
    },
    {
        name: 'sdk_apps_set_common',
        title: 'Set SDK app common data',
        description: 'Set app common data (client credentials and shared configuration)',
        category: 'sdk.apps',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
                common: { type: 'object', description: 'The common data to set' },
            },
            required: ['name', 'version', 'common'],
        },
        execute: async (make: Make, args: { name: string; version: number; common: Record<string, JSONValue> }) => {
            await make.sdk.apps.setCommon(args.name, args.version, args.common);
            return `Common data has been set.`;
        },
    },
];
