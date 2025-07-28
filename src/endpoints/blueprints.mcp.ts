import type { Make } from '../make.js';

export const tools = [
    {
        name: 'blueprints_get',
        title: 'Get scenario blueprint',
        description: 'Get the blueprint of a scenario',
        category: 'blueprints',
        scope: 'scenarios:read',
        identifier: 'scenarioId',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to get the blueprint for' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.blueprints.get(args.scenarioId);
        },
    },
    {
        name: 'blueprints_versions',
        title: 'Get blueprint versions',
        description: "Get all versions of a scenario's blueprint",
        category: 'blueprints',
        scope: 'scenarios:read',
        identifier: 'scenarioId',
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to get blueprint versions for' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.blueprints.versions(args.scenarioId);
        },
    },
];
