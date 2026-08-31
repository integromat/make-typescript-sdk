import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'folders_list',
        title: 'List folders',
        description:
            'List scenario folders for a team. If you do not know the teamId, find it via organizations_list (each organization lists its teams) or teams_list, or ask the user — never guess IDs.',
        category: 'folders',
        scope: 'scenarios:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list folders for' },
                parentId: {
                    type: 'number',
                    description:
                        'The parent folder whose direct children should be returned. Omit to return top-level folders.',
                },
                childrenDepth: {
                    type: 'string',
                    enum: ['all'],
                    description:
                        "Set to 'all' to return all descendants under children. By default, children includes only one direct child level.",
                },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }, { teamId: 5, parentId: 1576 }, { teamId: 5, childrenDepth: 'all' }],
        execute: async (make: Make, args: { teamId: number; parentId?: number; childrenDepth?: 'all' }) => {
            const { teamId, ...options } = args;
            return await make.folders.list(teamId, { ...options, cols: ['*'] });
        },
    },
    {
        name: 'folders_create',
        title: 'Create folder',
        description: 'Create a new folder.',
        category: 'folders',
        scope: 'scenarios:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the folder will be created' },
                name: { type: 'string', description: 'Name of the folder' },
                parentId: {
                    oneOf: [{ type: 'number' }, { type: 'null' }],
                    description: 'The unique ID of the parent folder. Omit or pass null to create a top-level folder.',
                },
            },
            required: ['teamId', 'name'],
        },
        examples: [
            { teamId: 5, name: 'My Folder' },
            { teamId: 5, name: 'My Subfolder', parentId: 1576 },
        ],
        execute: async (make: Make, args: { teamId: number; name: string; parentId?: number | null }) => {
            return await make.folders.create(args);
        },
    },
    {
        name: 'folders_update',
        title: 'Update folder',
        description: 'Update an existing folder.',
        category: 'folders',
        scope: 'scenarios:write',
        scopeId: 'folderId',
        identifier: 'folderId',
        resourceId: 'folderId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                folderId: { type: 'number', description: 'The folder ID to update' },
                name: { type: 'string', description: 'New name for the folder' },
                parentId: {
                    oneOf: [{ type: 'number' }, { type: 'null' }],
                    description:
                        'The unique ID of the new parent folder. Use null to move the folder to the top level; omit to leave unchanged.',
                },
            },
            required: ['folderId'],
        },
        examples: [
            { folderId: 1576, name: 'Updated Folder' },
            { folderId: 1576, parentId: 2001 },
            { folderId: 1576, parentId: null },
        ],
        execute: async (make: Make, args: { folderId: number; name?: string; parentId?: number | null }) => {
            const { folderId, ...body } = args;
            return await make.folders.update(folderId, body, { cols: ['*'] });
        },
    },
    {
        name: 'folders_delete',
        title: 'Delete folder',
        description: 'Delete a folder.',
        category: 'folders',
        scope: 'scenarios:write',
        scopeId: 'folderId',
        identifier: 'folderId',
        resourceId: 'folderId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                folderId: { type: 'number', description: 'The folder ID to delete' },
            },
            required: ['folderId'],
        },
        examples: [{ folderId: 1576 }],
        execute: async (make: Make, args: { folderId: number }) => {
            await make.folders.delete(args.folderId);
            return `Folder has been deleted.`;
        },
    },
];
