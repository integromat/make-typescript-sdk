import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'private-spaces_list',
        title: 'List private spaces',
        description:
            "List the private spaces of an organization. Requires the organization's private-spaces feature to be enabled (error IM903 otherwise) and the 'personal team manage' permission. Private spaces cannot be created or deleted through the API — they are provisioned automatically by organization settings.",
        category: 'private-spaces',
        scope: 'private-spaces:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to list private spaces for' },
                externalId: { type: 'string', description: 'Filter private spaces by their external ID' },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 5 }, { organizationId: 5, externalId: 'ext-1' }],
        execute: async (make: Make, args: { organizationId: number; externalId?: string }) => {
            const { organizationId, ...options } = args;
            return await make.privateSpaces.list(organizationId, { ...options, cols: ['*'] });
        },
    },
    {
        name: 'private-spaces_get',
        title: 'Get private space',
        description:
            'Get details of a specific private space, including usage totals (operations, transfer, centicredits). Callers who are not members of the space receive a 404 even when the space exists.',
        category: 'private-spaces',
        scope: 'private-spaces:read',
        scopeId: 'privateSpaceId',
        identifier: 'privateSpaceId',
        resourceId: 'privateSpaceId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                privateSpaceId: { type: 'number', description: 'The private space ID to retrieve' },
            },
            required: ['privateSpaceId'],
        },
        examples: [{ privateSpaceId: 101 }],
        execute: async (make: Make, args: { privateSpaceId: number }) => {
            return await make.privateSpaces.get(args.privateSpaceId, { cols: ['*'] });
        },
    },
    {
        name: 'private-spaces_update',
        title: 'Update private space',
        description:
            "Update a private space's operations limit. Set operationsLimit to null to remove the limit (unlimited); the transfer limit is derived automatically. When the new limit is below the space's current consumption the call fails with IM004 unless 'confirmed' is true — confirming pauses the space.",
        category: 'private-spaces',
        scope: 'private-spaces:write',
        scopeId: 'privateSpaceId',
        identifier: 'privateSpaceId',
        resourceId: 'privateSpaceId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                privateSpaceId: { type: 'number', description: 'The private space ID to update' },
                operationsLimit: {
                    oneOf: [{ type: 'number' }, { type: 'null' }],
                    description:
                        'Maximum operations limit (minimum 0). Pass null to remove the limit; omit to leave unchanged.',
                },
                confirmed: {
                    type: 'boolean',
                    description:
                        "Confirmation of the update. Required when the new limit is below the space's current consumption; confirming pauses the space.",
                },
            },
            required: ['privateSpaceId'],
        },
        examples: [
            { privateSpaceId: 101, operationsLimit: 10000 },
            { privateSpaceId: 101, operationsLimit: 50, confirmed: true },
            { privateSpaceId: 101, operationsLimit: null },
        ],
        execute: async (
            make: Make,
            args: { privateSpaceId: number; operationsLimit?: number | null; confirmed?: boolean },
        ) => {
            const { privateSpaceId, confirmed, ...body } = args;
            return await make.privateSpaces.update(privateSpaceId, body, { confirmed });
        },
    },
];
