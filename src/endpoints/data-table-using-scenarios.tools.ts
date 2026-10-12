import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type { DataTableUsingScenario } from './data-table-using-scenarios.js';

export const tools: MakeTool[] = [
    {
        name: 'data-table-using-scenarios_list',
        title: 'List scenarios using data table',
        description: 'List scenarios registered as using a data table and the columns they use.',
        category: 'data-table-using-scenarios',
        scope: 'data-tables:read',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID to list using scenarios for' },
            },
            required: ['dataTableId'],
        },
        examples: [{ dataTableId: 137 }],
        execute: async (make: Make, args: { dataTableId: number }) => {
            return await make.dataTables.usingScenarios.list(args.dataTableId);
        },
    },
    {
        name: 'data-table-using-scenarios_add',
        title: 'Add scenario using data table',
        description: 'Register a scenario as using a data table, including the columns it uses.',
        category: 'data-table-using-scenarios',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID the scenario uses' },
                scenarioId: { type: 'number', description: 'The scenario ID to register' },
                columnIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'The IDs of the columns the scenario uses',
                },
            },
            required: ['dataTableId', 'scenarioId', 'columnIds'],
        },
        examples: [{ dataTableId: 137, scenarioId: 25, columnIds: [10, 11] }],
        execute: async (make: Make, args: { dataTableId: number } & DataTableUsingScenario) => {
            const { dataTableId, ...body } = args;
            await make.dataTables.usingScenarios.add(dataTableId, body);
            return `Scenario has been registered as using the data table.`;
        },
    },
    {
        name: 'data-table-using-scenarios_update',
        title: 'Update scenario using data table',
        description: 'Update the columns a registered scenario uses in a data table.',
        category: 'data-table-using-scenarios',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID the scenario uses' },
                scenarioId: { type: 'number', description: 'The scenario ID whose registration to update' },
                columnIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'The new set of column IDs the scenario uses',
                },
            },
            required: ['dataTableId', 'scenarioId', 'columnIds'],
        },
        examples: [{ dataTableId: 137, scenarioId: 25, columnIds: [10] }],
        execute: async (make: Make, args: { dataTableId: number } & DataTableUsingScenario) => {
            const { dataTableId, ...body } = args;
            await make.dataTables.usingScenarios.update(dataTableId, body);
            return `Using scenario registration has been updated.`;
        },
    },
    {
        name: 'data-table-using-scenarios_remove',
        title: 'Remove scenario using data table',
        description: "Remove a scenario's registration from a data table.",
        category: 'data-table-using-scenarios',
        scope: 'data-tables:write',
        scopeId: 'dataTableId',
        identifier: 'dataTableId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                dataTableId: { type: 'number', description: 'The data table ID the scenario was registered on' },
                scenarioId: { type: 'number', description: 'The scenario ID to remove' },
            },
            required: ['dataTableId', 'scenarioId'],
        },
        examples: [{ dataTableId: 137, scenarioId: 25 }],
        execute: async (make: Make, args: { dataTableId: number; scenarioId: number }) => {
            await make.dataTables.usingScenarios.remove(args.dataTableId, args.scenarioId);
            return `Using scenario registration has been removed.`;
        },
    },
];
