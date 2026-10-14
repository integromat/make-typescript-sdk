import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'teams_list',
        title: 'List projects',
        description:
            "List the projects of an organization. Requires an organizationId — get it from organizations_list, whose response also includes each organization's projects (id and name). Results include only projects you can view. 'Access denied' usually means the token lacks the teams:read scope — ask the user to re-authorize and grant teams:read.",
        category: 'teams',
        scope: 'teams:read',
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
                organizationId: { type: 'number', description: 'The organization ID to list projects for' },
                includePrivateSpaces: {
                    type: 'boolean',
                    description: 'Whether to include private spaces in the results',
                },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 5 }, { organizationId: 5, includePrivateSpaces: true }],
        execute: async (make: Make, args: { organizationId: number; includePrivateSpaces?: boolean }) => {
            const { organizationId, ...options } = args;
            // Legacy /teams paths: the API serves /projects only where project naming is enabled.
            return await make.teams.list(organizationId, { ...options, cols: ['*'] });
        },
    },
    {
        name: 'teams_get',
        title: 'Get project',
        description: 'Get details of a specific project.',
        category: 'teams',
        scope: 'teams:read',
        scopeId: 'projectId',
        identifier: 'projectId',
        resourceId: 'projectId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: { type: 'number', description: 'The project ID to retrieve' },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
                },
            },
            required: ['projectId'],
        },
        examples: [{ projectId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.teams.get(args.teamId);
        },
    },
    {
        name: 'teams_create',
        title: 'Create project',
        description: 'Create a new project.',
        category: 'teams',
        scope: 'teams:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name for the new project' },
                organizationId: {
                    type: 'number',
                    description: 'ID of the organization where the project will be created',
                },
                operationsLimit: { type: 'number', description: 'Maximum operations limit for the project' },
                transferLimit: { type: 'number', description: 'Maximum data transfer limit for the project' },
            },
            required: ['name', 'organizationId'],
        },
        examples: [{ name: 'My Project', organizationId: 5 }],
        execute: async (
            make: Make,
            args: { name: string; organizationId: number; operationsLimit?: number; transferLimit?: number },
        ) => {
            return await make.teams.create(args);
        },
    },
    {
        name: 'teams_delete',
        title: 'Delete project',
        description: 'Delete a project.',
        category: 'teams',
        scope: 'teams:write',
        scopeId: 'projectId',
        identifier: 'projectId',
        resourceId: 'projectId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: { type: 'number', description: 'The project ID to delete' },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
                },
            },
            required: ['projectId'],
        },
        examples: [{ projectId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            await make.teams.delete(args.teamId);
            return `Project has been deleted.`;
        },
    },
];
