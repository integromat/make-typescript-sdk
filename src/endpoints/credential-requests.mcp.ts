import type { Make } from '../make.js';

export const tools = [
    {
        name: 'credential_requests_list',
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
        },
        execute: async (
            make: Make,
            args: {
                teamId?: number;
                userId?: number;
                makeProviderId?: string | number;
                status?: string;
                name?: string;
            },
        ) => {
            return await make.credentialRequests.list({
                teamId: args.teamId,
                userId: args.userId,
                makeProviderId: args.makeProviderId,
                status: args.status,
                name: args.name,
                cols: ['*'],
            });
        },
    },
    {
        name: 'credential_requests_get',
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
        execute: async (make: Make, args: { requestId: string }) => {
            return await make.credentialRequests.getDetail(args.requestId);
        },
    },
    {
        name: 'credential_requests_delete',
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
        execute: async (make: Make, args: { requestId: string }) => {
            await make.credentialRequests.delete(args.requestId);
            return 'Credential request and associated credentials have been deleted.';
        },
    },
    {
        name: 'credential_get',
        title: 'Get credential',
        description:
            'Get details of a specific credential (connection or API key) by its ID. ' +
            'Returns metadata including authorization status, the parent credential request, provider and account type information, and timestamps. ' +
            'Use this to check the current state of an individual credential within a request.',
        category: 'credential-requests',
        scope: 'credential-requests:read',
        identifier: 'credentialId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                credentialId: { type: 'string', description: 'The credential ID to get' },
            },
            required: ['credentialId'],
        },
        execute: async (make: Make, args: { credentialId: string }) => {
            return await make.credentialRequests.getCredential(args.credentialId, { cols: ['*'] });
        },
    },
    {
        name: 'credential_decline',
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
        execute: async (make: Make, args: { credentialId: string; reason?: string }) => {
            return await make.credentialRequests.declineCredential(args.credentialId, args.reason);
        },
    },
    {
        name: 'credential_delete',
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
        execute: async (make: Make, args: { credentialId: string }) => {
            return await make.credentialRequests.deleteCredential(args.credentialId);
        },
    },
    {
        name: 'credential_requests_create',
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
        execute: async (
            make: Make,
            args: {
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
];
