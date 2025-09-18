import type { Make } from '../../make.js';

export const tools = [
    {
        name: 'sdk_modules_list',
        title: 'List SDK modules',
        description: 'List modules for the app with optional filtering',
        category: 'sdk.modules',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
            },
            required: ['appName', 'appVersion'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number }) => {
            return await make.sdk.modules.list(args.appName, args.appVersion);
        },
    },
    {
        name: 'sdk_modules_get',
        title: 'Get SDK module',
        description: 'Get a single module by name',
        category: 'sdk.modules',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                moduleName: { type: 'string', description: 'The name of the module' },
            },
            required: ['appName', 'appVersion', 'moduleName'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number; moduleName: string }) => {
            return await make.sdk.modules.get(args.appName, args.appVersion, args.moduleName);
        },
    },
    {
        name: 'sdk_modules_create',
        title: 'Create SDK module',
        description: 'Create a new module',
        category: 'sdk.modules',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                name: { type: 'string', description: 'The name of the module' },
                typeId: { type: 'number', description: 'The type ID of the module' },
                label: { type: 'string', description: 'The label of the module visible in the scenario builder' },
                description: { type: 'string', description: 'The description of the module' },
                moduleInitMode: {
                    type: 'string',
                    enum: ['blank', 'example', 'module'],
                    description: 'Module initialization mode',
                },
            },
            required: ['appName', 'appVersion', 'name', 'typeId', 'label', 'description'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                name: string;
                typeId: number;
                label: string;
                description: string;
                moduleInitMode?: 'blank' | 'example' | 'module';
            },
        ) => {
            const { appName, appVersion, ...body } = args;
            return await make.sdk.modules.create(appName, appVersion, body);
        },
    },
    {
        name: 'sdk_modules_update',
        title: 'Update SDK module',
        description: 'Update an existing module',
        category: 'sdk.modules',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                moduleName: { type: 'string', description: 'The name of the module' },
                label: { type: 'string', description: 'The label of the module visible in the scenario builder' },
                description: { type: 'string', description: 'The description of the module' },
                connection: { type: 'string', description: 'Connection name' },
            },
            required: ['appName', 'appVersion', 'moduleName'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                moduleName: string;
                label?: string;
                description?: string;
                connection?: string;
            },
        ) => {
            const { appName, appVersion, moduleName, ...body } = args;
            return await make.sdk.modules.update(appName, appVersion, moduleName, body);
        },
    },
    {
        name: 'sdk_modules_delete',
        title: 'Delete SDK module',
        description: 'Delete a module',
        category: 'sdk.modules',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                moduleName: { type: 'string', description: 'The name of the module' },
            },
            required: ['appName', 'appVersion', 'moduleName'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number; moduleName: string }) => {
            await make.sdk.modules.delete(args.appName, args.appVersion, args.moduleName);
            return `Module has been deleted.`;
        },
    },
    {
        name: 'sdk_modules_get_section',
        title: 'Get SDK module section',
        description: 'Get a specific section of a module',
        category: 'sdk.modules',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                moduleName: { type: 'string', description: 'The name of the module' },
                section: {
                    type: 'string',
                    enum: ['api', 'epoch', 'parameters', 'expect', 'interface', 'samples', 'scope'],
                    description: 'The section to get',
                },
            },
            required: ['appName', 'appVersion', 'moduleName', 'section'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                moduleName: string;
                section: 'api' | 'epoch' | 'parameters' | 'expect' | 'interface' | 'samples' | 'scope';
            },
        ) => {
            return await make.sdk.modules.getSection(args.appName, args.appVersion, args.moduleName, args.section);
        },
    },
    {
        name: 'sdk_modules_set_section',
        title: 'Set SDK module section',
        description: 'Set/update a specific section of a module',
        category: 'sdk.modules',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                moduleName: { type: 'string', description: 'The name of the module' },
                section: {
                    type: 'string',
                    enum: ['api', 'epoch', 'parameters', 'expect', 'interface', 'samples', 'scope'],
                    description: 'The section to set',
                },
                body: { type: 'string', description: 'The section data to set in JSONC format' },
            },
            required: ['appName', 'appVersion', 'moduleName', 'section', 'body'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                moduleName: string;
                section: 'api' | 'epoch' | 'parameters' | 'expect' | 'interface' | 'samples' | 'scope';
                body: string;
            },
        ) => {
            await make.sdk.modules.setSection(args.appName, args.appVersion, args.moduleName, args.section, args.body);
            return `Section '${args.section}' has been set.`;
        },
    },
];
