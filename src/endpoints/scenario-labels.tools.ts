import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'labels_list',
        title: 'List scenario labels',
        description:
            "List a team's scenario label catalog, including how many scenarios carry each label. Scenario labels are team-scoped tags that can be assigned to scenarios, independent of folders. If you do not know the teamId, find it via organizations_list (each organization lists its teams) or teams_list, or ask the user — never guess ids.",
        category: 'labels',
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
                teamId: { type: 'number', description: 'The team ID to list scenario labels for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.scenarioLabels.list(args.teamId);
        },
    },
];
