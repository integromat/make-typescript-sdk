import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';
import type { MakeTool } from '../../tools.js';

type PngInfo = {
    width: number;
    height: number;
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function readPngInfo(buffer: Buffer): PngInfo {
    if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
        throw new Error('Icon file must be a PNG image.');
    }

    const ihdrType = buffer.subarray(12, 16).toString('ascii');
    if (ihdrType !== 'IHDR') {
        throw new Error('Icon file is not a valid PNG image: missing IHDR chunk.');
    }

    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
    };
}

function visibilityResult(scope: 'app', name: string, version: number, visibility: 'public' | 'private', response: JSONValue) {
    return {
        changed: true,
        scope,
        appName: name,
        version,
        visibility,
        public: visibility === 'public',
        response,
    };
}

export const tools: MakeTool[] = [
    {
        name: 'sdk-apps_list',
        title: 'List SDK apps',
        description: 'List SDK apps with optional filtering.',
        category: 'sdk-apps',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        examples: [{}],
        execute: async (make: Make) => {
            return await make.sdk.apps.list({ cols: ['*'] });
        },
    },
    {
        name: 'sdk-apps_get',
        title: 'Get SDK app',
        description: 'Get a SDK app by name and version.',
        category: 'sdk-apps',
        scope: 'sdk-apps:read',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1 }],
        execute: async (make: Make, args: { name: string; version: number }) => {
            return await make.sdk.apps.get(args.name, args.version, { cols: ['*'] });
        },
    },
    {
        name: 'sdk-apps_create',
        title: 'Create SDK app',
        description: 'Create a new SDK app.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
            required: ['name', 'label', 'theme', 'language', 'audience'],
        },
        examples: [
            {
                name: 'my-app',
                label: 'My App',
                description: 'A custom app',
                theme: '#FF5733',
                language: 'en',
                audience: 'global',
            },
        ],
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
        name: 'sdk-apps_update',
        title: 'Update SDK app',
        description: 'Update an existing SDK app.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1, label: 'My Updated App' }],
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
        name: 'sdk-apps_delete',
        title: 'Delete SDK app',
        description: 'Delete a SDK app by name and version.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1 }],
        execute: async (make: Make, args: { name: string; version: number }) => {
            await make.sdk.apps.delete(args.name, args.version);
            return `App has been deleted.`;
        },
    },
    {
        name: 'sdk-apps_get-section',
        title: 'Get SDK app section',
        description: 'Get a specific section of a SDK app.',
        category: 'sdk-apps',
        scope: 'sdk-apps:read',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1, section: 'base' }],
        execute: async (
            make: Make,
            args: { name: string; version: number; section: 'base' | 'groups' | 'install' | 'installSpec' },
        ) => {
            return await make.sdk.apps.getSection(args.name, args.version, args.section);
        },
    },
    {
        name: 'sdk-apps_set-section',
        title: 'Set SDK app section',
        description: 'Set/update a specific section of a SDK app.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1, section: 'base', body: '{"baseUrl": "https://api.example.com"}' }],
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
        name: 'sdk-apps_get-docs',
        title: 'Get SDK app documentation',
        description: 'Get app documentation (readme).',
        category: 'sdk-apps',
        scope: 'sdk-apps:read',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1 }],
        execute: async (make: Make, args: { name: string; version: number }) => {
            return await make.sdk.apps.getDocs(args.name, args.version);
        },
    },
    {
        name: 'sdk-apps_set-docs',
        title: 'Set SDK app documentation',
        description: 'Set app documentation (readme).',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1, docs: '# My App\n\nThis app integrates with the Example API.' }],
        execute: async (make: Make, args: { name: string; version: number; docs: string }) => {
            await make.sdk.apps.setDocs(args.name, args.version, args.docs);
            return `Documentation has been set.`;
        },
    },
    {
        name: 'sdk-apps_get-common',
        title: 'Get SDK app common data',
        description: 'Get app common data (client credentials and shared configuration).',
        category: 'sdk-apps',
        scope: 'sdk-apps:read',
        scopeId: undefined,
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
        examples: [{ name: 'my-app', version: 1 }],
        execute: async (make: Make, args: { name: string; version: number }) => {
            return await make.sdk.apps.getCommon(args.name, args.version);
        },
    },
    {
        name: 'sdk-apps_set-icon',
        title: 'Set SDK app icon',
        description: 'Upload a PNG icon for a SDK app.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
                file: { type: 'string', description: 'Path to the PNG icon file to upload' },
                allowNon512: { type: 'boolean', description: 'Allow PNG icons that are not 512x512', default: false },
                sdkVersion: { type: 'string', description: 'Apps SDK version header', default: '2.5.0' },
            },
            required: ['name', 'version', 'file'],
        },
        examples: [{ name: 'my-app', version: 1, file: './assets/icon.png' }],
        execute: async (
            make: Make,
            args: { name: string; version: number; file: string; allowNon512?: boolean; sdkVersion?: string },
        ) => {
            const icon = await readFile(args.file);
            const pngInfo = readPngInfo(icon);
            if (!args.allowNon512 && (pngInfo.width !== 512 || pngInfo.height !== 512)) {
                throw new Error(
                    `Icon must be 512x512 PNG. Got ${pngInfo.width}x${pngInfo.height}. ` +
                        'Resize it first or pass allowNon512 intentionally.',
                );
            }

            const changed = await make.sdk.apps.setIcon(args.name, args.version, icon, { sdkVersion: args.sdkVersion });
            return {
                changed,
                appName: args.name,
                version: args.version,
                file: basename(args.file),
                width: pngInfo.width,
                height: pngInfo.height,
                readbackPath: `/sdk/apps/${args.name}/${args.version}/icon/512`,
            };
        },
    },
    {
        name: 'sdk-apps_get-icon',
        title: 'Get SDK app icon',
        description: 'Download a SDK app icon. Writes to outputFile when provided, otherwise returns base64 PNG data.',
        category: 'sdk-apps',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
                outputFile: { type: 'string', description: 'Optional path to write the PNG icon' },
                size: { type: 'number', description: 'Icon size to download', default: 512 },
                sdkVersion: { type: 'string', description: 'Apps SDK version header', default: '2.5.0' },
            },
            required: ['name', 'version'],
        },
        examples: [{ name: 'my-app', version: 1, outputFile: '/tmp/my-app-icon.png', size: 512 }],
        execute: async (
            make: Make,
            args: { name: string; version: number; outputFile?: string; size?: number; sdkVersion?: string },
        ) => {
            const icon = Buffer.from(
                await make.sdk.apps.getIcon(args.name, args.version, args.size ?? 512, { sdkVersion: args.sdkVersion }),
            );
            const pngInfo = readPngInfo(icon);

            if (args.outputFile) {
                await writeFile(args.outputFile, icon);
                return {
                    appName: args.name,
                    version: args.version,
                    file: args.outputFile,
                    width: pngInfo.width,
                    height: pngInfo.height,
                };
            }

            return {
                appName: args.name,
                version: args.version,
                size: args.size ?? 512,
                width: pngInfo.width,
                height: pngInfo.height,
                contentType: 'image/png',
                dataBase64: icon.toString('base64'),
            };
        },
    },
    {
        name: 'sdk-apps_set-public',
        title: 'Set SDK app public',
        description: 'Mark a SDK app version as public.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        identifier: undefined,
        annotations: { idempotentHint: true, destructiveHint: false },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
            },
            required: ['name', 'version'],
        },
        examples: [{ name: 'my-app', version: 1 }],
        execute: async (make: Make, args: { name: string; version: number }) => {
            const response = await make.sdk.apps.makePublic(args.name, args.version);
            return visibilityResult('app', args.name, args.version, 'public', response as JSONValue);
        },
    },
    {
        name: 'sdk-apps_set-private',
        title: 'Set SDK app private',
        description: 'Mark a SDK app version as private.',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        identifier: undefined,
        annotations: { idempotentHint: true, destructiveHint: false },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'The name of the app' },
                version: { type: 'number', description: 'The version of the app' },
            },
            required: ['name', 'version'],
        },
        examples: [{ name: 'my-app', version: 1 }],
        execute: async (make: Make, args: { name: string; version: number }) => {
            const response = await make.sdk.apps.makePrivate(args.name, args.version);
            return visibilityResult('app', args.name, args.version, 'private', response as JSONValue);
        },
    },
    {
        name: 'sdk-apps_set-common',
        title: 'Set SDK app common data',
        description: 'Set app common data (client credentials and shared configuration).',
        category: 'sdk-apps',
        scope: 'sdk-apps:write',
        scopeId: undefined,
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
        examples: [
            { name: 'my-app', version: 1, common: { clientId: 'my-client-id', clientSecret: 'my-client-secret' } },
        ],
        execute: async (make: Make, args: { name: string; version: number; common: Record<string, JSONValue> }) => {
            await make.sdk.apps.setCommon(args.name, args.version, args.common);
            return `Common data has been set.`;
        },
    },
];
