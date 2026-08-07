import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'custom-property-structures_list',
        title: 'List custom property structures',
        description:
            "List the custom property structures defined for an organization. Requires the organization's custom-properties feature to be enabled (error IM027 otherwise). Currently there is at most one structure per organization (for the 'scenario' entity type), and structures cannot be deleted through the API.",
        category: 'custom-property-structures',
        scope: 'custom-property-structures:read',
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
                organizationId: {
                    type: 'number',
                    description: 'The organization ID to list custom property structures for',
                },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 57 }],
        execute: async (make: Make, args: { organizationId: number }) => {
            return await make.customPropertyStructures.list(args.organizationId);
        },
    },
    {
        name: 'custom-property-structures_create',
        title: 'Create custom property structure',
        description:
            "Create a custom property structure for an organization. Only one structure can exist per (associatedType, belongerType, belongerId) combination — creating a second one for the same organization fails with IM005. Once created, a structure cannot be deleted through the API. Use 'scenario' as associatedType and 'organization' as belongerType — these are the only values the API currently accepts.",
        category: 'custom-property-structures',
        scope: 'custom-property-structures:write',
        scopeId: 'belongerId',
        identifier: 'belongerId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                associatedType: {
                    type: 'string',
                    enum: ['scenario'],
                    description:
                        "The entity type the custom properties apply to. Only 'scenario' is currently supported.",
                },
                belongerType: {
                    type: 'string',
                    enum: ['organization'],
                    description: "The entity type that owns the structure. Only 'organization' is currently supported.",
                },
                belongerId: {
                    type: 'number',
                    description: 'The ID of the entity that owns the structure (the organization ID)',
                },
            },
            required: ['associatedType', 'belongerType', 'belongerId'],
        },
        examples: [{ associatedType: 'scenario', belongerType: 'organization', belongerId: 57 }],
        execute: async (
            make: Make,
            args: { associatedType: 'scenario'; belongerType: 'organization'; belongerId: number },
        ) => {
            return await make.customPropertyStructures.create(args);
        },
    },
];
