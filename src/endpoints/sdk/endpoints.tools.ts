import type { Make } from '../../make.js';
import type { MakeTool } from '../../tools.js';
import type { SDKEndpointAnnotations, SDKEndpointSectionType } from './endpoints.js';

const SECTION_ENUM = ['api', 'scope', 'inputParameters', 'outputParameters'];

export const tools: MakeTool[] = [
    {
        name: 'sdk-endpoints_list',
        title: 'List SDK Endpoints',
        description: 'List all Endpoints for the app.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:read',
        scopeId: undefined,
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
        examples: [{ appName: 'my-app', appVersion: 1 }],
        execute: async (make: Make, args: { appName: string; appVersion: number }) => {
            return await make.sdk.endpoints.list(args.appName, args.appVersion);
        },
    },
    {
        name: 'sdk-endpoints_get',
        title: 'Get SDK Endpoint',
        description: 'Get a single Endpoint by name.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
            },
            required: ['appName', 'appVersion', 'endpointName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, endpointName: 'getEntity' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; endpointName: string }) => {
            return await make.sdk.endpoints.get(args.appName, args.appVersion, args.endpointName);
        },
    },
    {
        name: 'sdk-endpoints_create',
        title: 'Create SDK Endpoint',
        description: 'Create a new Endpoint.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                name: { type: 'string', description: 'The name of the Endpoint' },
                label: { type: 'string', description: 'The label of the Endpoint' },
                description: { type: 'string', description: 'The description of the Endpoint' },
                attachedAccounts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Connection names to attach to the Endpoint',
                },
            },
            required: ['appName', 'appVersion', 'name', 'label'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, name: 'getEntity', label: 'Get Entity' }],
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                name: string;
                label: string;
                description?: string;
                attachedAccounts?: string[];
            },
        ) => {
            const { appName, appVersion, ...body } = args;
            return await make.sdk.endpoints.create(appName, appVersion, body);
        },
    },
    {
        name: 'sdk-endpoints_update',
        title: 'Update SDK Endpoint',
        description: "Update an existing Endpoint's metadata.",
        category: 'sdk-endpoints',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
                label: { type: 'string', description: 'The label of the Endpoint' },
                description: { type: 'string', description: 'The description of the Endpoint' },
                context: { type: 'string', description: 'Context for how to use the Endpoint' },
                annotations: {
                    type: 'object',
                    description: 'MCP-inspired behavior hints',
                    properties: {
                        readOnlyHint: {
                            type: 'boolean',
                            description: 'If true, the Endpoint does not modify its environment.',
                        },
                        destructiveHint: {
                            type: 'boolean',
                            description: 'If true, the Endpoint may perform destructive updates.',
                        },
                        idempotentHint: {
                            type: 'boolean',
                            description: 'If true, repeated calls with the same arguments have no additional effect.',
                        },
                        openWorldHint: {
                            type: 'boolean',
                            description:
                                'If true, the Endpoint may interact with an "open world" of external entities.',
                        },
                    },
                },
                attachedAccounts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Connection names attached to the Endpoint (replaces the existing list)',
                },
            },
            required: ['appName', 'appVersion', 'endpointName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, endpointName: 'getEntity', label: 'Get Entity (Updated)' }],
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                endpointName: string;
                label?: string;
                description?: string;
                context?: string;
                annotations?: SDKEndpointAnnotations;
                attachedAccounts?: string[];
            },
        ) => {
            const { appName, appVersion, endpointName, ...body } = args;
            return await make.sdk.endpoints.update(appName, appVersion, endpointName, body);
        },
    },
    {
        name: 'sdk-endpoints_delete',
        title: 'Delete SDK Endpoint',
        description: 'Delete an Endpoint.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
            },
            required: ['appName', 'appVersion', 'endpointName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, endpointName: 'getEntity' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; endpointName: string }) => {
            await make.sdk.endpoints.delete(args.appName, args.appVersion, args.endpointName);
            return `Endpoint has been deleted.`;
        },
    },
    {
        name: 'sdk-endpoints_set-public',
        title: 'Set SDK Endpoint public',
        description: 'Mark an SDK app Endpoint as public.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        annotations: { idempotentHint: true, destructiveHint: false },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
            },
            required: ['appName', 'appVersion', 'endpointName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, endpointName: 'getEntity' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; endpointName: string }) => {
            await make.sdk.endpoints.makePublic(args.appName, args.appVersion, args.endpointName);
            return `Endpoint has been made public.`;
        },
    },
    {
        name: 'sdk-endpoints_set-private',
        title: 'Set SDK Endpoint private',
        description: 'Mark an SDK app Endpoint as private.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        annotations: { idempotentHint: true, destructiveHint: false },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
            },
            required: ['appName', 'appVersion', 'endpointName'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, endpointName: 'getEntity' }],
        execute: async (make: Make, args: { appName: string; appVersion: number; endpointName: string }) => {
            await make.sdk.endpoints.makePrivate(args.appName, args.appVersion, args.endpointName);
            return `Endpoint has been made private.`;
        },
    },
    {
        name: 'sdk-endpoints_get-section',
        title: 'Get SDK Endpoint section',
        description: 'Get Endpoint section data.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:read',
        scopeId: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
                section: {
                    type: 'string',
                    enum: SECTION_ENUM,
                    description: 'The section to get',
                },
            },
            required: ['appName', 'appVersion', 'endpointName', 'section'],
        },
        examples: [{ appName: 'my-app', appVersion: 1, endpointName: 'getEntity', section: 'api' }],
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                endpointName: string;
                section: SDKEndpointSectionType;
            },
        ) => {
            return await make.sdk.endpoints.getSection(args.appName, args.appVersion, args.endpointName, args.section);
        },
    },
    {
        name: 'sdk-endpoints_set-section',
        title: 'Set SDK Endpoint section',
        description: 'Set Endpoint section data.',
        category: 'sdk-endpoints',
        scope: 'sdk-apps:write',
        scopeId: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                endpointName: { type: 'string', description: 'The name of the Endpoint' },
                section: {
                    type: 'string',
                    enum: SECTION_ENUM,
                    description: 'The section to set',
                },
                body: { type: 'string', description: 'The section data to set in JSONC format' },
            },
            required: ['appName', 'appVersion', 'endpointName', 'section', 'body'],
        },
        examples: [
            {
                appName: 'my-app',
                appVersion: 1,
                endpointName: 'getEntity',
                section: 'api',
                body: '{"url": "/entities/{{parameters.id}}", "method": "GET"}',
            },
        ],
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                endpointName: string;
                section: SDKEndpointSectionType;
                body: string;
            },
        ) => {
            await make.sdk.endpoints.setSection(
                args.appName,
                args.appVersion,
                args.endpointName,
                args.section,
                args.body,
            );
            return `Section '${args.section}' has been set.`;
        },
    },
];
