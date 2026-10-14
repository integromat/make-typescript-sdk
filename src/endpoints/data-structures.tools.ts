import type { Make } from '../make.js';
import type { DataStructureField } from './data-structures.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'data-structures_list',
        title: 'List data structures',
        description: 'List data structures for a project.',
        category: 'data-structures',
        scope: 'udts:read',
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
                projectId: { type: 'number', description: 'The project ID to list data structures for' },
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
            destructiveHint: false,
            openWorldHint: false,
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
        scopeId: 'projectId',
        identifier: 'projectId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                projectId: {
                    type: 'number',
                    description: 'The unique ID of the project in which the data structure will be created',
                },
                teamId: {
                    type: 'number',
                    description:
                        'Deprecated: legacy name of projectId (Teams were renamed to Projects). Use projectId.',
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
            required: ['projectId', 'name', 'strict', 'spec'],
        },
        examples: [
            {
                projectId: 5,
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
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
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
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
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
