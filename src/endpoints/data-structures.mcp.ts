import type { Make } from '../make.js';
import type { DataStructureField } from './data-structures.js';

export const tools = [
    {
        name: 'data_structures_list',
        title: 'List data structures',
        description: 'List data structures for a team',
        category: 'data-structures',
        scope: 'udts:read',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list data structures for' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.dataStructures.list(args.teamId);
        },
    },
    {
        name: 'data_structures_get',
        title: 'Get data structure',
        description: 'Get details of a specific data structure',
        category: 'data-structures',
        scope: 'udts:read',
        identifier: 'dataStructureId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStructureId: { type: 'number', description: 'The data structure ID to retrieve' },
            },
            required: ['dataStructureId'],
        },
        execute: async (make: Make, args: { dataStructureId: number }) => {
            return await make.dataStructures.get(args.dataStructureId);
        },
    },
    {
        name: 'data_structures_create',
        title: 'Create data structure',
        description: 'Create a new data structure',
        category: 'data-structures',
        scope: 'udts:write',
        identifier: 'teamId',
        inputSchema: {
            type: 'object',
            properties: {
                teamId: {
                    type: 'number',
                    description: 'The unique ID of the team in which the data structure will be created',
                },
                name: {
                    type: 'string',
                    description: 'The name of the data structure. The maximum length of the name is 128 characters',
                },
                strict: {
                    type: 'boolean',
                    description: 'Set to true to enforce strict validation of the data put in the data structure',
                },
                spec: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Sets the data structure specification',
                },
            },
            required: ['teamId', 'name', 'strict', 'spec'],
        },
        execute: async (
            make: Make,
            args: { teamId: number; name: string; strict: boolean; spec: DataStructureField[] },
        ) => {
            return await make.dataStructures.create(args);
        },
    },
    {
        name: 'data_structures_update',
        title: 'Update data structure',
        description: 'Update an existing data structure',
        category: 'data-structures',
        scope: 'udts:write',
        identifier: 'dataStructureId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStructureId: { type: 'number', description: 'The data structure ID to update' },
                name: {
                    type: 'string',
                    description: 'The name of the data structure. The maximum length of the name is 128 characters',
                },
                strict: {
                    type: 'boolean',
                    description: 'Set to true to enforce strict validation of the data put in the data structure',
                },
                spec: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Sets the data structure specification',
                },
            },
            required: ['dataStructureId'],
        },
        execute: async (
            make: Make,
            args: {
                dataStructureId: number;
                name?: string;
                strict?: boolean;
                spec?: DataStructureField[];
            },
        ) => {
            const { dataStructureId, ...body } = args;
            return await make.dataStructures.update(dataStructureId, body);
        },
    },
    {
        name: 'data_structures_clone',
        title: 'Clone data structure',
        description: 'Clone an existing data structure',
        category: 'data-structures',
        scope: 'udts:write',
        identifier: 'dataStructureId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStructureId: { type: 'number', description: 'The data structure ID to clone' },
                name: { type: 'string', description: 'Name for the cloned data structure' },
                targetTeamId: { type: 'number', description: 'Target team ID for the cloned data structure' },
            },
            required: ['dataStructureId', 'name', 'targetTeamId'],
        },
        execute: async (make: Make, args: { dataStructureId: number; name: string; targetTeamId: number }) => {
            return await make.dataStructures.clone(args.dataStructureId, {
                name: args.name,
                targetTeamId: args.targetTeamId,
            });
        },
    },
    {
        name: 'data_structures_delete',
        title: 'Delete data structure',
        description: 'Delete a data structure',
        category: 'data-structures',
        scope: 'udts:write',
        identifier: 'dataStructureId',
        inputSchema: {
            type: 'object',
            properties: {
                dataStructureId: { type: 'number', description: 'The data structure ID to delete' },
            },
            required: ['dataStructureId'],
        },
        execute: async (make: Make, args: { dataStructureId: number }) => {
            return await make.dataStructures.delete(args.dataStructureId);
        },
    },
];
