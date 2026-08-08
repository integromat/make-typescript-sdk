import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type { JSONValue } from '../types.js';

export const tools: MakeTool[] = [
    {
        name: 'scenario-custom-properties_get',
        title: 'Get scenario custom properties data',
        description: 'Get the custom properties data filled in for a scenario.',
        category: 'scenario-custom-properties',
        scope: 'scenarios:read',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'scenarioId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to get custom properties data for' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 22 }],
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.scenarios.customProperties.get(args.scenarioId);
        },
    },
    {
        name: 'scenario-custom-properties_create',
        title: 'Fill in scenario custom properties data',
        description:
            'Fill in custom properties data for a scenario for the first time. Fails with IM005 if the scenario already has data — use scenario-custom-properties_update or scenario-custom-properties_replace instead. Every item marked required in the custom property structure must be given a value. Use custom-property-structure-items_list to see the available items.',
        category: 'scenario-custom-properties',
        scope: 'scenarios:write',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to fill in custom properties data for' },
                customProperties: {
                    type: 'object',
                    description:
                        'Custom properties keyed by structure item name, e.g. { "highPriority": true, "category": ["eshop"] }.',
                },
            },
            required: ['scenarioId', 'customProperties'],
        },
        examples: [{ scenarioId: 80, customProperties: { companyTeam: 'marketing', highPriority: false } }],
        execute: async (make: Make, args: { scenarioId: number; customProperties: Record<string, JSONValue> }) => {
            return await make.scenarios.customProperties.create(args.scenarioId, args.customProperties);
        },
    },
    {
        name: 'scenario-custom-properties_replace',
        title: 'Replace scenario custom properties data',
        description:
            'Replace all custom properties data for a scenario. Fails with IM013 if the scenario has no data yet — use scenario-custom-properties_create first. Every item marked required in the structure must be given a value.',
        category: 'scenario-custom-properties',
        scope: 'scenarios:write',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'scenarioId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to replace custom properties data for' },
                customProperties: {
                    type: 'object',
                    description:
                        'Complete set of custom properties keyed by structure item name; replaces all existing data.',
                },
            },
            required: ['scenarioId', 'customProperties'],
        },
        examples: [{ scenarioId: 80, customProperties: { companyTeam: 'engineering', highPriority: false } }],
        execute: async (make: Make, args: { scenarioId: number; customProperties: Record<string, JSONValue> }) => {
            return await make.scenarios.customProperties.replace(args.scenarioId, args.customProperties);
        },
    },
    {
        name: 'scenario-custom-properties_update',
        title: 'Update scenario custom properties data',
        description:
            'Merge-update custom properties data for a scenario; only the specified items are changed. Fails with IM013 if the scenario has no data yet — use scenario-custom-properties_create first.',
        category: 'scenario-custom-properties',
        scope: 'scenarios:write',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'scenarioId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to update custom properties data for' },
                customProperties: {
                    type: 'object',
                    description:
                        'Custom properties to update, keyed by structure item name; unspecified items are left unchanged.',
                },
            },
            required: ['scenarioId', 'customProperties'],
        },
        examples: [{ scenarioId: 80, customProperties: { location: 'Wien, AUS' } }],
        execute: async (make: Make, args: { scenarioId: number; customProperties: Record<string, JSONValue> }) => {
            return await make.scenarios.customProperties.update(args.scenarioId, args.customProperties);
        },
    },
    {
        name: 'scenario-custom-properties_delete',
        title: 'Delete scenario custom properties data',
        description: 'Delete all custom properties data for a scenario. This is irreversible.',
        category: 'scenario-custom-properties',
        scope: 'scenarios:write',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'scenarioId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to delete custom properties data for' },
                confirmed: {
                    type: 'boolean',
                    description: 'Confirmation of the deletion, in case the API starts requiring it for this call.',
                },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 28 }],
        execute: async (make: Make, args: { scenarioId: number; confirmed?: boolean }) => {
            await make.scenarios.customProperties.delete(args.scenarioId, { confirmed: args.confirmed });
            return 'Scenario custom properties data has been deleted.';
        },
    },
];
