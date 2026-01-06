import type { Blueprint, DataStructureField } from '../index.js';
import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { Scheduling } from './scenarios.js';

export const tools = [
    {
        name: 'scenarios_list',
        title: 'List scenarios',
        description: 'List all scenarios for a team',
        category: 'scenarios',
        scope: 'scenarios:read',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to filter scenarios by' },
            },
            required: ['teamId'],
        },
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.scenarios.list(args.teamId, { cols: ['*'] });
        },
    },
    {
        name: 'scenarios_get',
        title: 'Get scenario',
        description: 'Get a scenario and its blueprint by ID',
        category: 'scenarios',
        scope: 'scenarios:read',
        identifier: 'scenarioId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to retrieve' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            const scenario = await make.scenarios.get(args.scenarioId, { cols: ['*'] });
            const blueprint = await make.blueprints.get(scenario.id);

            return {
                ...scenario,
                blueprint,
            };
        },
    },
    {
        name: 'scenarios_create',
        title: 'Create scenario',
        description: 'Create a new scenario',
        category: 'scenarios',
        scope: 'scenarios:write',
        identifier: 'teamId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'ID of the team where the scenario will be created' },
                folderId: { type: 'number', description: 'ID of the folder where the scenario will be placed' },
                scheduling: { description: 'Scheduling configuration for the scenario' },
                blueprint: { description: 'Blueprint containing the scenario configuration' },
                basedon: { type: 'string', description: 'ID of an existing template to base this one on' },
                confirmed: {
                    type: 'boolean',
                    description: 'Confirmation in case the scenario uses apps that are not yet installed',
                },
            },
            required: ['teamId', 'scheduling', 'blueprint'],
        },
        execute: async (
            make: Make,
            args: {
                teamId: number;
                folderId?: number;
                scheduling: Scheduling;
                blueprint: Blueprint;
                basedon?: string;
                cols?: string[];
                confirmed?: boolean;
            },
        ) => {
            const { confirmed, ...body } = args;
            return await make.scenarios.create(body, { confirmed, cols: ['*'] });
        },
    },
    {
        name: 'scenarios_update',
        title: 'Update scenario',
        description: 'Update a scenario',
        category: 'scenarios',
        scope: 'scenarios:write',
        identifier: 'scenarioId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to update' },
                name: { type: 'string', description: 'New name for the scenario' },
                description: { type: 'string', description: 'New description for the scenario' },
                folderId: { type: 'number', description: 'New folder ID for the scenario' },
                scheduling: { description: 'Updated scheduling configuration' },
                blueprint: { description: 'Updated blueprint configuration' },
                confirmed: {
                    type: 'boolean',
                    description: 'Confirmation in case the scenario uses apps that are not yet installed',
                },
            },
            required: ['scenarioId'],
        },
        execute: async (
            make: Make,
            args: {
                scenarioId: number;
                name?: string;
                description?: string;
                folderId?: number;
                scheduling?: Scheduling;
                blueprint?: Blueprint;
                cols?: string[];
                confirmed?: boolean;
            },
        ) => {
            const { scenarioId, confirmed, ...body } = args;
            return await make.scenarios.update(scenarioId, body, { confirmed, cols: ['*'] });
        },
    },
    {
        name: 'scenarios_delete',
        title: 'Delete scenario',
        description: 'Delete a scenario',
        category: 'scenarios',
        scope: 'scenarios:write',
        identifier: 'scenarioId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to delete' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            await make.scenarios.delete(args.scenarioId);
            return `Scenario has been deleted.`;
        },
    },
    {
        name: 'scenarios_activate',
        title: 'Activate scenario',
        description: 'Activate a scenario',
        category: 'scenarios',
        scope: 'scenarios:write',
        identifier: 'scenarioId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to activate' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            return (await make.scenarios.activate(args.scenarioId))
                ? 'Scenario has been activated.'
                : 'Scenario has not been activated.';
        },
    },
    {
        name: 'scenarios_deactivate',
        title: 'Deactivate scenario',
        description: 'Deactivate a scenario',
        category: 'scenarios',
        scope: 'scenarios:write',
        identifier: 'scenarioId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to deactivate' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            return (await make.scenarios.deactivate(args.scenarioId))
                ? 'Scenario has been deactivated.'
                : 'Scenario has not been deactivated.';
        },
    },
    {
        name: 'scenarios_run',
        title: 'Run scenario',
        description: 'Execute a scenario with optional input data',
        category: 'scenarios',
        scope: 'scenarios:run',
        identifier: 'scenarioId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to run' },
                data: { type: 'object', description: 'Optional input data for the scenario' },
                responsive: { type: 'boolean', description: 'Whether to run responsively' },
            },
            required: ['scenarioId'],
        },
        execute: async (
            make: Make,
            args: { scenarioId: number; data?: Record<string, JSONValue>; responsive?: boolean },
        ) => {
            const { scenarioId, data, responsive } = args;
            return await make.scenarios.run(scenarioId, data, { responsive });
        },
    },
    {
        name: 'scenarios_interface',
        title: 'Get scenario interface',
        description: 'Get the interface for a scenario',
        category: 'scenarios',
        scope: 'scenarios:read',
        identifier: 'scenarioId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to get the interface for' },
            },
            required: ['scenarioId'],
        },
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.scenarios.getInterface(args.scenarioId);
        },
    },
    {
        name: 'scenarios_set_interface',
        title: 'Set scenario interface',
        description: 'Update the interface for a scenario',
        category: 'scenarios',
        scope: 'scenarios:write',
        identifier: 'scenarioId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to update the interface for' },
                interface: {
                    type: 'object',
                    description: 'The interface definition with input and output specifications',
                    properties: {
                        input: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                            description: 'Input fields for the scenario',
                        },
                        output: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                            description: 'Output fields for the scenario',
                        },
                    },
                },
            },
            required: ['scenarioId', 'interface'],
        },
        execute: async (
            make: Make,
            args: {
                scenarioId: number;
                interface: {
                    input: DataStructureField[];
                    output: DataStructureField[];
                };
            },
        ) => {
            return await make.scenarios.setInterface(args.scenarioId, { interface: args.interface });
        },
    },
];
