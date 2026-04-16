import type { Make } from '../make.js';

export const tools = [
    {
        name: 'devices_list',
        title: 'List devices',
        description: 'List devices registered in a team.',
        category: 'devices',
        scope: 'devices:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list devices for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.devices.list(args.teamId);
        },
    },
];
