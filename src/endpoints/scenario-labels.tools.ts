import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type { CreateScenarioLabelBody, ScenarioLabelColour, UpdateScenarioLabelBody } from './scenario-labels.js';

const LABEL_COLOURS: ScenarioLabelColour[] = [
    'white',
    'neutral',
    'brand',
    'info',
    'success',
    'warning',
    'danger',
    'pink',
];

export const tools: MakeTool[] = [
    {
        name: 'labels_list',
        title: 'List scenario labels',
        description:
            "List a team's scenario label catalog, including how many scenarios carry each label. Scenario labels are team-scoped tags that can be assigned to scenarios, independent of folders. If you do not know the teamId, call users_me to learn it.",
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
    {
        name: 'labels_create',
        title: 'Create scenario label',
        description:
            'Create a new scenario label in a team. Labels are team-scoped tags that can be assigned to scenarios. If you do not know the teamId, call users_me to learn it.',
        category: 'labels',
        scope: 'scenarios:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID where the label will be created' },
                name: { type: 'string', description: 'Name of the label (1-30 characters)' },
                colour: {
                    type: 'string',
                    enum: LABEL_COLOURS,
                    description: 'Colour of the label, one of the fixed palette values',
                },
                description: { type: 'string', description: 'Optional description of the label (max 500 characters)' },
            },
            required: ['teamId', 'name', 'colour'],
        },
        examples: [
            { teamId: 5, name: 'critical', colour: 'danger' },
            { teamId: 5, name: 'billing', colour: 'info', description: 'Scenarios owned by the billing team' },
        ],
        execute: async (make: Make, args: CreateScenarioLabelBody) => {
            return await make.scenarioLabels.create(args);
        },
    },
    {
        name: 'labels_update',
        title: 'Update scenario label',
        description:
            'Update the name, colour, or description of an existing scenario label. Provide at least one property to change; omitted properties are left unchanged. Changes are reflected on every scenario carrying the label.',
        category: 'labels',
        scope: 'scenarios:write',
        scopeId: 'labelId',
        identifier: 'labelId',
        resourceId: 'labelId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                labelId: { type: 'number', description: 'The label ID to update' },
                name: { type: 'string', description: 'New name for the label (1-30 characters)' },
                colour: {
                    type: 'string',
                    enum: LABEL_COLOURS,
                    description: 'New colour for the label, one of the fixed palette values',
                },
                description: {
                    oneOf: [{ type: 'string' }, { type: 'null' }],
                    description:
                        'New description for the label (max 500 characters). Use null to clear it; omit to leave unchanged.',
                },
            },
            required: ['labelId'],
        },
        examples: [
            { labelId: 42, name: 'high-priority' },
            { labelId: 42, colour: 'warning' },
            { labelId: 42, description: null },
        ],
        execute: async (make: Make, args: { labelId: number } & UpdateScenarioLabelBody) => {
            const { labelId, ...body } = args;
            return await make.scenarioLabels.update(labelId, body);
        },
    },
    {
        name: 'labels_delete',
        title: 'Delete scenario label',
        description:
            'Delete a scenario label. The label is removed from the team catalog and unassigned from every scenario carrying it. This cannot be undone.',
        category: 'labels',
        scope: 'scenarios:write',
        scopeId: 'labelId',
        identifier: 'labelId',
        resourceId: 'labelId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                labelId: { type: 'number', description: 'The label ID to delete' },
            },
            required: ['labelId'],
        },
        examples: [{ labelId: 42 }],
        execute: async (make: Make, args: { labelId: number }) => {
            await make.scenarioLabels.delete(args.labelId);
            return `Label has been deleted.`;
        },
    },
];
