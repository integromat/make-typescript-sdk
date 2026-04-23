import type { Make } from '../make.js';
import type { DataStructureField } from './data-structures.js';

export const tools = [
    {
        name: 'data-structures_list',
        title: 'List data structures',
        description: 'List data structures for a team.',
        category: 'data-structures',
        scope: 'udts:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list data structures for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 5 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.dataStructures.list(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'data-structures_get',
        title: 'Get data structure',
        description: 'Get details of a specific data structure.',
        category: 'data-structures',
        scope: 'udts:read',
        scopeId: 'dataStructureId',
        identifier: 'dataStructureId',
        resourceId: 'dataStructureId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataStructureId: { type: 'number', description: 'The data structure ID to retrieve' },
            },
            required: ['dataStructureId'],
        },
        examples: [{ dataStructureId: 178 }],
        execute: async (make: Make, args: { dataStructureId: number }) => {
            return await make.dataStructures.get(args.dataStructureId);
        },
    },
    {
        name: 'data-structures_create',
        title: 'Create data structure',
        description: 'Create a new data structure.',
        category: 'data-structures',
        scope: 'udts:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
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
                    description: 'Sets the data structure specification. Each item follows the Make Parameters Syntax.',
                },
            },
            required: ['teamId', 'name', 'strict', 'spec'],
        },
        examples: [
            {
                teamId: 5,
                name: 'Customer Data',
                strict: true,
                spec: [
                    { name: 'name', type: 'text', label: 'Name', required: true },
                    { name: 'email', type: 'text', label: 'Email', required: true },
                    { name: 'status', type: 'text', label: 'Status', required: false },
                ],
            },
        ],
        execute: async (
            make: Make,
            args: { teamId: number; name: string; strict: boolean; spec: DataStructureField[] },
        ) => {
            return await make.dataStructures.create(args);
        },
    },
    {
        name: 'data-structures_update',
        title: 'Update data structure',
        description: 'Update an existing data structure.',
        category: 'data-structures',
        scope: 'udts:write',
        scopeId: 'dataStructureId',
        identifier: 'dataStructureId',
        resourceId: 'dataStructureId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
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
                    description: 'Sets the data structure specification. Each item follows the Make Parameters Syntax.',
                },
            },
            required: ['dataStructureId'],
        },
        examples: [{ dataStructureId: 178, name: 'Updated Structure' }],
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
        name: 'data-structures_delete',
        title: 'Delete data structure',
        description: 'Delete a data structure.',
        category: 'data-structures',
        scope: 'udts:write',
        scopeId: 'dataStructureId',
        identifier: 'dataStructureId',
        resourceId: 'dataStructureId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataStructureId: { type: 'number', description: 'The data structure ID to delete' },
            },
            required: ['dataStructureId'],
        },
        examples: [{ dataStructureId: 178 }],
        execute: async (make: Make, args: { dataStructureId: number }) => {
            await make.dataStructures.delete(args.dataStructureId);
            return `Data structure has been deleted.`;
        },
    },
];
