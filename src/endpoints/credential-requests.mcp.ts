import type { Make } from '../make.js';

export const tools = [
    {
        name: 'credential-requests_list',
        title: 'List credential requests',
        description:
            'Retrieve a list of credential requests. Each request can contain multiple credentials (connections and API keys). Filter by team, user, provider, status, or name to find specific requests.',
        category: 'credential-requests',
        scope: 'credential-requests:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'Filter by team ID' },
                userId: { type: 'number', description: 'Filter by user ID' },
                makeProviderId: {
                    type: ['string', 'number'],
                    description: 'Filter by Make provider ID',
                },
                status: { type: 'string', description: 'Filter by status' },
                name: { type: 'string', description: 'Filter by name' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (
            make: Make,
            args: {
                teamId: number;
                userId?: number;
                makeProviderId?: string | number;
                status?: string;
                name?: string;
            },
        ) => {
            return await make.credentialRequests.list(args.teamId, {
                ...args,
                cols: ['*'],
            });
        },
    },
    {
        name: 'credential-requests_get',
        title: 'Get credential request details',
        description:
            'Retrieve detailed information about a specific credential request by its ID. ' +
            'Returns all associated credentials with their authorization status, provider configuration, user details, and authorization URLs for pending credentials. ' +
            'Use this to check the state of credentials within a request.',
        category: 'credential-requests',
        scope: 'credential-requests:read',
        identifier: 'requestId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                requestId: { type: 'string', description: 'The credential request ID to get details for' },
            },
            required: ['requestId'],
        },
        examples: [{ requestId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { requestId: string }) => {
            return await make.credentialRequests.getDetail(args.requestId);
        },
    },
    {
        name: 'credential-requests_delete',
        title: 'Delete credential request',
        description:
            'Permanently delete a credential request and all associated credentials (connections and API keys) by ID. ' +
            'Any scenarios using connections from this request will lose access to the corresponding services. This action cannot be undone.',
        category: 'credential-requests',
        scope: 'credential-requests:write',
        identifier: 'requestId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                requestId: { type: 'string', description: 'The credential request ID to delete' },
            },
            required: ['requestId'],
        },
        examples: [{ requestId: 'a07e16f2ad134bf49cf83a00aa95c0a5' }],
        execute: async (make: Make, args: { requestId: string }) => {
            await make.credentialRequests.delete(args.requestId);
            return 'Credential request and associated credentials have been deleted.';
        },
    },
    {
        name: 'credential-requests_credential-decline',
        title: 'Decline credential',
        description:
            'Decline a credential authorization request by ID, setting its status to "declined" and preventing it from being authorized. ' +
            'An optional reason can be provided to explain the decision. ' +
            'This operation is idempotent - declining an already-declined credential has no additional effect.',
        category: 'credential-requests',
        scope: 'credential-requests:write',
        identifier: 'credentialId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                credentialId: { type: 'string', description: 'The credential ID to decline' },
                reason: { type: 'string', description: 'Optional reason for declining' },
            },
            required: ['credentialId'],
        },
        examples: [{ credentialId: 'b12f9e3c2d15af8', reason: 'Not required for this project' }],
        execute: async (make: Make, args: { credentialId: string; reason?: string }) => {
            return await make.credentialRequests.declineCredential(args.credentialId, args.reason);
        },
    },
    {
        name: 'credential-requests_credential-delete',
        title: 'Delete credential',
        description:
            'Delete a credential (e.g., revoke OAuth tokens or remove stored API keys) and reset its state to pending. ' +
            'Use this when a credential needs re-authorization with updated permissions, tokens have become stale, or you want to force re-authentication. ' +
            'After deletion, the credential can be authorized again through the normal flow.',
        category: 'credential-requests',
        scope: 'credential-requests:write',
        identifier: 'credentialId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                credentialId: { type: 'string', description: 'The credential ID to delete' },
            },
            required: ['credentialId'],
        },
        examples: [{ credentialId: 'b12f9e3c2d15af8' }],
        execute: async (make: Make, args: { credentialId: string }) => {
            return await make.credentialRequests.deleteCredential(args.credentialId);
        },
    },
    {
        name: 'credential-requests_create',
        title: 'Create credential request',
        description:
            'Create a credential request for the currently authenticated user to set up connections and keys. ' +
            'This will return a URL where the user can authorize the credentials, so that they can be used in scenarios.',
        category: 'credential-requests',
        scope: 'credential-requests:write',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the Request which will be displayed to the End Users who open it.',
                },
                description: {
                    type: 'string',
                    description: 'Description of the Request which will be displayed to the End Users who open it.',
                },
                teamId: { type: 'number', description: 'Team ID' },
                credentials: {
                    type: 'array',
                    description: 'Array of app/module selections to derive credentials from.',
                    minItems: 1,
                    maxItems: 64,
                    items: {
                        type: 'object',
                        properties: {
                            appName: {
                                type: 'string',
                                description: 'Name of the application to request credentials for.',
                            },
                            appModules: {
                                type: 'array',
                                description:
                                    'Array of module IDs to request from the user, for example: ["WatchDirectMessages", "WatchFiles"]. ' +
                                    'Use ["*"] to select all modules for the given application.',
                                minItems: 1,
                                items: { type: 'string' },
                            },
                            appVersion: {
                                type: 'number',
                                description:
                                    'Version of the application. If not provided, it defaults to the latest available version.',
                            },
                            nameOverride: {
                                type: 'string',
                                description:
                                    'An optional name to use for the credential when created in the platform, overriding the default generated name.',
                            },
                            description: {
                                type: 'string',
                                description: 'Description for this credential to be displayed in the Request view.',
                            },
                        },
                        required: ['appName', 'appModules'],
                    },
                },
            },
            required: ['teamId', 'credentials'],
        },
        examples: [
            {
                name: 'Google Connection Request',
                teamId: 5,
                credentials: [{ appName: 'google', appModules: ['*'] }],
            },
        ],
        execute: async (
            make: Make,
            args: {
                name?: string;
                description?: string;
                teamId: number;
                credentials: {
                    appName: string;
                    appModules: string[];
                    appVersion?: number;
                    nameOverride?: string;
                    description?: string;
                }[];
            },
        ) => {
            return await make.credentialRequests.createAction(args);
        },
    },
    {
        name: 'credential-requests_create-by-credentials',
        title: 'Create credential request by connection/key types',
        description:
            'Create a credential request for one or more connections (OAuth) and/or keys (API keys) by their type identifiers (e.g. "google", "slack", "apikeyauth"). ' +
            'Use this when you know the exact connection or key types needed. ' +
            'The response includes the created request, an array of credentials associated with the request, and a publicUri where the end-user must go to authorize the requested credentials. ' +
            'At least one connection or one key must be provided.',
        category: 'credential-requests',
        scope: 'credential-requests:write',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description:
                        'Human-readable name for the credential request, displayed to the end-user who will authorize it.',
                },
                description: {
                    type: 'string',
                    description: 'Instructions or context for the end-user, displayed on the authorization page.',
                },
                teamId: {
                    type: 'number',
                    description:
                        'The numeric ID of the Make team where the connections/keys will be created once authorized.',
                },
                connections: {
                    type: 'array',
                    description:
                        'Array of OAuth or basic-auth connections to request. Each item needs at least a "type" (e.g. "google", "slack", "github").',
                    maxItems: 32,
                    items: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                description: 'Type of the Connection to be included in the Request.',
                            },
                            description: {
                                type: 'string',
                                description:
                                    'Description of the particular Connection to be displayed in the Request view.',
                            },
                            scope: {
                                type: 'array',
                                description: 'Array of Scopes that the Connection should ask for.',
                                items: { type: 'string' },
                            },
                            prefill: {
                                type: 'object',
                                description: 'Prefill values for the connection.',
                                properties: {
                                    hard: {
                                        type: 'object',
                                        description: 'Hard prefill values that the user cannot change.',
                                    },
                                    soft: {
                                        type: 'object',
                                        description: 'Soft prefill values that the user can change.',
                                    },
                                },
                            },
                            nameOverride: {
                                type: 'string',
                                description: 'An optional name to use for the credential when created in the platform.',
                            },
                        },
                        required: ['type'],
                    },
                },
                keys: {
                    type: 'array',
                    description:
                        'Array of API keys to request. Each item needs at least a "type" (e.g. "apikeyauth", "basicauth").',
                    maxItems: 32,
                    items: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                description: 'Type of the Key to be included in the Request.',
                            },
                            description: {
                                type: 'string',
                                description: 'Description of the particular Key to be displayed in the Request view.',
                            },
                            prefill: {
                                type: 'object',
                                description: 'Prefill values for the key.',
                                properties: {
                                    hard: {
                                        type: 'object',
                                        description: 'Hard prefill values that the user cannot change.',
                                    },
                                    soft: {
                                        type: 'object',
                                        description: 'Soft prefill values that the user can change.',
                                    },
                                },
                            },
                            nameOverride: {
                                type: 'string',
                                description: 'An optional name to use for the credential when created in the platform.',
                            },
                        },
                        required: ['type'],
                    },
                },
            },
            required: ['teamId'],
        },
        examples: [
            {
                name: 'My Credential Request',
                teamId: 5,
                connections: [{ type: 'google', scope: ['https://www.googleapis.com/auth/drive'] }],
                keys: [{ type: 'apikeyauth' }],
            },
        ],
        execute: async (
            make: Make,
            args: {
                name?: string;
                description?: string;
                teamId: number;
                connections?: {
                    type: string;
                    description?: string;
                    scope?: string[];
                    prefill?: {
                        hard?: Record<string, string | number | boolean>;
                        soft?: Record<string, string | number | boolean>;
                    };
                    nameOverride?: string;
                }[];
                keys?: {
                    type: string;
                    description?: string;
                    prefill?: {
                        hard?: Record<string, string | number | boolean>;
                        soft?: Record<string, string | number | boolean>;
                    };
                    nameOverride?: string;
                }[];
            },
        ) => {
            return await make.credentialRequests.createByCredentials(args);
        },
    },
    {
        name: 'credential-requests_extend-connection',
        title: 'Extend connection OAuth scopes',
        description:
            'Add new OAuth scopes to an existing connection. Use this when a connection exists but lacks the permissions (scopes) needed for a specific operation. ' +
            'Creates a credential request that the end-user must authorize via the returned publicUri to grant the additional scopes. ' +
            'Fails if all requested scopes are already present on the connection.',
        category: 'credential-requests',
        scope: 'credential-requests:write',
        identifier: 'connectionId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                connectionId: {
                    type: 'number',
                    description:
                        'The numeric ID of an existing Make connection whose OAuth scopes need to be expanded.',
                },
                scopes: {
                    type: 'array',
                    description:
                        'One or more new OAuth scope strings to add to the connection. At least one scope must be new (not already granted).',
                    minItems: 1,
                    items: {
                        type: 'string',
                        description: 'An OAuth scope string to add.',
                    },
                },
            },
            required: ['connectionId', 'scopes'],
        },
        examples: [
            {
                connectionId: 2,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            },
        ],
        execute: async (
            make: Make,
            args: {
                connectionId: number;
                scopes: string[];
            },
        ) => {
            return await make.credentialRequests.extendConnection(args);
        },
    },
    {
        name: 'credential-requests_list-app-modules-with-credentials',
        title: 'List app modules with credentials',
        description:
            'List all modules of a given Make app (and version) that require credentials, along with the required credential type and OAuth scopes. ' +
            'Use this to discover which modules exist for an app before constructing a credential request — the returned `id` values are what you pass in `credentials[].appModules` for `credential-requests_create`. ' +
            'For custom/SDK apps, prefix the app name with `app#` (e.g. `app#my-custom-app`).',
        category: 'credential-requests',
        scope: 'apps:read',
        identifier: 'appName',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: {
                    type: 'string',
                    description:
                        'App name (e.g. `slack`). For custom/SDK apps, prefix with `app#` (e.g. `app#my-custom-app`).',
                },
                appVersion: {
                    oneOf: [{ type: 'number' }, { type: 'string', const: 'latest' }],
                    description: 'App major version number (e.g. `4`), or the literal string `"latest"`.',
                },
            },
            required: ['appName', 'appVersion'],
        },
        examples: [
            { appName: 'slack', appVersion: 4 },
            { appName: 'slack', appVersion: 'latest' },
        ],
        execute: async (make: Make, args: { appName: string; appVersion: number | 'latest' }) => {
            return await make.credentialRequests.listAppModulesWithCredentials(args.appName, args.appVersion);
        },
    },
];
