import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'credential_requests_list',
        title: 'List credential requests',
        description:
            'Retrieve a list of credential requests with optional filtering and pagination. Use this to view pending authorization requests, track credential request history, or find specific requests.',
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
        name: 'credential_requests_get_detail',
        title: 'Get credential request detail',
        description:
            'Retrieve detailed information about a specific credential request by its ID, including all associated credentials with their authorization status, provider configuration, and user details.',
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
        name: 'credential_requests_create',
        title: 'Create credential request',
        description:
            'Create a new credential request to obtain user authorization for accessing external services. When setting up scenarios or connections programmatically, this endpoint generates an authorization URL that users can visit to grant permissions.',
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
                name: { type: 'string', description: 'Name of the request' },
                teamId: { type: 'number', description: 'Team ID' },
                description: { type: 'string', description: 'Description of the request' },
                connections: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Array of connections to include in the request',
                },
                keys: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Array of keys to include in the request',
                },
                provider: { type: 'object', description: 'Provider information' },
            },
            required: ['name', 'teamId', 'provider'],
        },
        execute: async (
            make: Make,
            args: {
                name: string;
                teamId: number;
                description?: string;
                connections?: Record<string, JSONValue>[];
                keys?: Record<string, JSONValue>[];
                provider: Record<string, JSONValue>;
            },
        ) => {
            return await make.credentialRequests.create(args);
        },
    },
    {
        name: 'credential_requests_delete',
        title: 'Delete credential request',
        description:
            'Delete a credential request by ID. Use the confirmed flag to also delete all associated credentials (connections and keys) along with the request.',
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
                confirmed: {
                    type: 'boolean',
                    description: 'When true, also deletes associated credentials (connections and keys)',
                },
            },
            required: ['requestId'],
        },
        execute: async (make: Make, args: { requestId: string; confirmed?: boolean }) => {
            await make.credentialRequests.delete(args.requestId, { confirmed: args.confirmed });
            return args.confirmed
                ? 'Credential request and associated credentials have been deleted.'
                : 'Credential request has been deleted.';
        },
    },
    {
        name: 'credential_requests_get_credential',
        title: 'Get credential',
        description:
            'Get details of a specific credential by ID. Returns metadata about the credential including its authorization status, associated request, and timestamps.',
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
        name: 'credential_requests_decline_credential',
        title: 'Decline credential',
        description:
            'Decline a credential authorization request by ID with an optional reason. The credential status will be updated to declined.',
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
        name: 'credential_requests_delete_credential',
        title: 'Delete credential',
        description:
            'Delete a credential (e.g., revoke OAuth tokens) and reset its state to pending. This allows the credential to be re-authorized with fresh permissions.',
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
        name: 'credential_requests_create_action',
        title: 'Create credential action',
        description:
            'Create a credential request action directly for the current user, bypassing the typical creation flow.',
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
                accountName: { type: 'string', description: 'Account name' },
                scopes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'OAuth scopes',
                },
            },
            required: ['teamId', 'accountName', 'scopes'],
        },
        execute: async (
            make: Make,
            args: {
                teamId: number;
                accountName: string;
                scopes: string[];
            },
        ) => {
            return await make.credentialRequests.createAction({
                ...args,
                connections: [], // Add appropriate connections here
                keys: [], // Add appropriate keys here
            });
        },
    },
];
