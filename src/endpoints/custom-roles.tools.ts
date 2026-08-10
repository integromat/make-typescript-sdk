import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'custom-roles_create',
        title: 'Create custom role',
        description:
            "Create a new custom organization or team role. Requires the organization's customRoles license feature and the 'organization custom roles edit' permission.",
        category: 'custom-roles',
        scope: 'user:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 1, maxLength: 50, description: 'Name of the custom role.' },
                category: {
                    type: 'string',
                    enum: ['organization', 'team'],
                    description: 'Whether the role applies to the organization or a team.',
                },
                organizationId: { type: 'number', description: 'ID of the organization to create the custom role in.' },
                description: {
                    oneOf: [{ type: 'string' }, { type: 'null' }],
                    description: 'Description of the custom role.',
                },
                permissions: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'IDs of the permissions to assign to the custom role.',
                },
            },
            required: ['name', 'category', 'organizationId'],
        },
        examples: [{ name: 'Custom Viewer', category: 'organization', organizationId: 1, permissions: [101, 102] }],
        execute: async (
            make: Make,
            args: {
                name: string;
                category: 'organization' | 'team';
                organizationId: number;
                description?: string | null;
                permissions?: number[];
            },
        ) => {
            return await make.customRoles.create(args);
        },
    },
    {
        name: 'custom-roles_update',
        title: 'Update custom role',
        description:
            'Update the name, description, or permissions of an existing custom role. Only custom-managed roles can be updated.',
        category: 'custom-roles',
        scope: 'user:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'id',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'ID of the custom role to update.' },
                organizationId: { type: 'number', description: 'ID of the organization the custom role belongs to.' },
                name: { type: 'string', minLength: 1, maxLength: 50, description: 'New name for the custom role.' },
                description: {
                    oneOf: [{ type: 'string' }, { type: 'null' }],
                    description: 'New description for the custom role. Pass null to clear it.',
                },
                permissions: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Full list of permission IDs to assign to the role. Replaces existing permissions.',
                },
            },
            required: ['id', 'organizationId'],
        },
        examples: [{ id: 42, organizationId: 1, name: 'Updated Viewer' }],
        execute: async (
            make: Make,
            args: {
                id: number;
                organizationId: number;
                name?: string;
                description?: string | null;
                permissions?: number[];
            },
        ) => {
            return await make.customRoles.update(args);
        },
    },
    {
        name: 'custom-roles_delete',
        title: 'Delete custom role',
        description:
            'Delete an existing custom role. Only custom-managed roles can be deleted. The role must not be currently assigned to any users.',
        category: 'custom-roles',
        scope: 'user:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'id',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'ID of the custom role to delete.' },
                organizationId: { type: 'number', description: 'ID of the organization the custom role belongs to.' },
            },
            required: ['id', 'organizationId'],
        },
        examples: [{ id: 42, organizationId: 1 }],
        execute: async (make: Make, args: { id: number; organizationId: number }) => {
            return await make.customRoles.delete(args);
        },
    },
];
