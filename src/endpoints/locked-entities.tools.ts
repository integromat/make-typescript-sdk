import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'locked-entities_list',
        title: 'List locked entities',
        description:
            'List the locked connections and keys of a team, each with your own permissions on it and the access-list members you may see. Requires both the connections:read and keys:read scopes. Fails with 400 (IM903) where locked connections are off for the organization.',
        category: 'locked-entities',
        // The API also needs keys:read, which a single `scope` cannot express; consumers that check scopes add it.
        scope: 'connections:read',
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
                teamId: { type: 'number', description: 'The team ID to list locked entities for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.lockedEntities.list(args.teamId);
        },
    },
];
