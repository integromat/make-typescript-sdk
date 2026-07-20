import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'teams_list',
        title: 'List teams',
        description:
            "List the teams of an organization. Requires an organizationId — get it from organizations_list or users_me. 'Access denied' means your token is team-scoped and cannot list teams: call users_me to learn your teamId and use teams_get instead.",
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
                organizationId: { type: 'number', description: 'The organization ID to list teams for' },
                includePrivateSpaces: {
                    type: 'boolean',
                    description: 'Whether to include private spaces (personal teams) in the results',
                },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 5 }, { organizationId: 5, includePrivateSpaces: true }],
        execute: async (make: Make, args: { organizationId: number; includePrivateSpaces?: boolean }) => {
            const { organizationId, ...options } = args;
            return await make.teams.list(organizationId, { ...options, cols: ['*'] });
        },
    },
    {
        name: 'teams_get',
        title: 'Get team',
        description: 'Get details of a specific team.',
        category: 'teams',
        scope: 'teams:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        resourceId: 'teamId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to retrieve' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.teams.get(args.teamId);
        },
    },
    {
        name: 'teams_create',
        title: 'Create team',
        description: 'Create a new team.',
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
                name: { type: 'string', description: 'Name for the new team' },
                organizationId: {
                    type: 'number',
                    description: 'ID of the organization where the team will be created',
                },
                operationsLimit: { type: 'number', description: 'Maximum operations limit for the team' },
                transferLimit: { type: 'number', description: 'Maximum data transfer limit for the team' },
            },
            required: ['name', 'organizationId'],
        },
        examples: [{ name: 'My Team', organizationId: 5 }],
        execute: async (
            make: Make,
            args: { name: string; organizationId: number; operationsLimit?: number; transferLimit?: number },
        ) => {
            return await make.teams.create(args);
        },
    },
    {
        name: 'teams_delete',
        title: 'Delete team',
        description: 'Delete a team.',
        category: 'teams',
        scope: 'teams:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        resourceId: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to delete' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            await make.teams.delete(args.teamId);
            return `Team has been deleted.`;
        },
    },
];
