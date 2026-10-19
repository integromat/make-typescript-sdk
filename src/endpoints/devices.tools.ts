import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'devices_list',
        title: 'List devices',
        description: 'List devices registered in a project.',
        category: 'devices',
        scope: 'devices:read',
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
                teamId: { type: 'number', description: 'The project ID to list devices for' },
                projectId: { type: 'number', description: 'Optional alias of teamId; used when teamId is not given.' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.devices.list(args.teamId);
        },
    },
];
