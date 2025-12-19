import type { Make } from '../make.js';

export const tools = [
    {
        name: 'teams_list',
        title: 'List teams',
        description: 'List teams for the current user',
        category: 'teams',
        scope: 'teams:read',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to list teams for' },
            },
            required: ['organizationId'],
        },
        execute: async (make: Make, args: { organizationId: number }) => {
            return await make.teams.list(args.organizationId, { cols: ['*'] });
        },
    },
    {
        name: 'teams_get',
        title: 'Get team',
        description: 'Get details of a specific team',
        category: 'teams',
        scope: 'teams:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to retrieve' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.teams.get(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'teams_create',
        title: 'Create team',
        description: 'Create a new team',
        category: 'teams',
        scope: 'teams:write',
        identifier: 'organizationId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
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
        description: 'Delete a team',
        category: 'teams',
        scope: 'teams:write',
        identifier: 'teamId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to delete' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            await make.teams.delete(args.teamId);
            return `Team has been deleted.`;
        },
    },
];
