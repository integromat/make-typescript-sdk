import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'roles_list',
        title: 'List roles',
        description:
            "List roles available to the current user, at the organization or project level. Custom roles are included only when 'organizationId' or 'projectId' is provided and the organization has the customRoles license feature enabled.",
        category: 'roles',
        scope: 'user:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    enum: ['organization', 'project', 'team'],
                    description:
                        "Restrict results to organization or project roles. 'team' is the legacy name of 'project'.",
                },
                excludeRole: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Role IDs to exclude from the response.',
                },
                roleId: { type: 'number', description: 'Return only the role matching this ID.' },
                organizationId: {
                    type: 'number',
                    description:
                        "Organization to resolve custom roles for. Required, together with the organization's customRoles license, for custom roles to be included.",
                },
                projectId: { type: 'number', description: 'Project to resolve custom roles for.' },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
                },
            },
        },
        examples: [{}, { organizationId: 5 }, { projectId: 12, category: 'project' }],
        execute: async (
            make: Make,
            args: {
                category?: 'organization' | 'project' | 'team';
                excludeRole?: number[];
                roleId?: number;
                organizationId?: number;
                teamId?: number;
            },
        ) => {
            return await make.roles.list({ ...args, cols: ['*'] });
        },
    },
    {
        name: 'roles_get',
        title: 'Get role',
        description:
            'Get details of a specific role, including its permissions. Requires Roleman to be enabled; not supported on private (on-premise) instances.',
        category: 'roles',
        scope: 'user:read',
        scopeId: 'roleId',
        identifier: 'roleId',
        resourceId: 'roleId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                roleId: { type: 'number', description: 'The role ID to retrieve.' },
            },
            required: ['roleId'],
        },
        examples: [{ roleId: 42 }],
        execute: async (make: Make, args: { roleId: number }) => {
            return await make.roles.get(args.roleId);
        },
    },
    {
        name: 'roles_permissions',
        title: 'List role permissions',
        description: 'List permissions that can be granted through a role.',
        category: 'roles',
        scope: 'user:read',
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                roleCategory: {
                    type: 'string',
                    enum: ['organization', 'project', 'team'],
                    description:
                        "Restrict results to organization or project permissions. 'team' is the legacy name of 'project'.",
                },
            },
        },
        examples: [{}, { roleCategory: 'organization' }],
        execute: async (make: Make, args: { roleCategory?: 'organization' | 'project' | 'team' }) => {
            return await make.roles.permissions(args);
        },
    },
];
