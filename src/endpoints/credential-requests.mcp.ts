import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';

export const tools = [
    {
        name: 'credential_requests_list',
        title: 'List credential requests',
        description: 'List credential requests with optional filtering and pagination',
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
        title: 'Get credential request',
        description: 'Get details of a specific credential request by ID',
        category: 'credential-requests',
        scope: 'credential-requests:read',
        identifier: 'requestId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                requestId: { type: 'string', description: 'The credential request ID to get' },
            },
            required: ['requestId'],
        },
        execute: async (make: Make, args: { requestId: string }) => {
            return await make.credentialRequests.get(args.requestId, { cols: ['*'] });
        },
    },
    {
        name: 'credential_requests_create',
        title: 'Create credential request',
        description: 'Create a new credential request',
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
        description: 'Delete a credential request by ID',
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
            return 'Credential request has been deleted.';
        },
    },
    {
        name: 'credential_requests_get_credential',
        title: 'Get credential',
        description: 'Get details of a specific credential by ID',
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
        description: 'Decline a credential by ID with optional reason',
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
        name: 'credential_requests_delete_remote_credential',
        title: 'Delete remote credential',
        description: 'Delete a credential from the remote platform and reset its state to pending',
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
                credentialId: { type: 'string', description: 'The credential ID to delete from remote' },
            },
            required: ['credentialId'],
        },
        execute: async (make: Make, args: { credentialId: string }) => {
            return await make.credentialRequests.deleteRemoteCredential(args.credentialId);
        },
    },
];
