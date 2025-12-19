import type { Make } from '../make.js';

export const tools = [
    {
        name: 'folders_list',
        title: 'List folders',
        description: 'List folders for a team',
        category: 'folders',
        scope: 'scenarios:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list folders for' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.folders.list(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'folders_create',
        title: 'Create folder',
        description: 'Create a new folder',
        category: 'folders',
        scope: 'scenarios:write',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the folder will be created' },
                name: { type: 'string', description: 'Name of the folder' },
            },
            required: ['teamId', 'name'],
        },
        execute: async (make: Make, args: { teamId: number; name: string }) => {
            return await make.folders.create(args);
        },
    },
    {
        name: 'folders_update',
        title: 'Update folder',
        description: 'Update an existing folder',
        category: 'folders',
        scope: 'scenarios:write',
        identifier: 'folderId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                folderId: { type: 'number', description: 'The folder ID to update' },
                name: { type: 'string', description: 'New name for the folder' },
            },
            required: ['folderId'],
        },
        execute: async (make: Make, args: { folderId: number; name?: string }) => {
            const { folderId, ...body } = args;
            return await make.folders.update(folderId, body, { cols: ['*'] });
        },
    },
    {
        name: 'folders_delete',
        title: 'Delete folder',
        description: 'Delete a folder',
        category: 'folders',
        scope: 'scenarios:write',
        identifier: 'folderId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                folderId: { type: 'number', description: 'The folder ID to delete' },
            },
            required: ['folderId'],
        },
        execute: async (make: Make, args: { folderId: number }) => {
            await make.folders.delete(args.folderId);
            return `Folder has been deleted.`;
        },
    },
];
