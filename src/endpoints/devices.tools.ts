import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'devices_list',
        title: 'List devices',
        description: 'List devices registered in a project.',
        category: 'devices',
        scope: 'devices:read',
        scopeId: 'projectId',
        identifier: 'projectId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: { type: 'number', description: 'The project ID to list devices for' },
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
            return await make.devices.list(args.teamId);
        },
    },
];
