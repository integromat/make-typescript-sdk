import type { Blueprint, DataStructureField } from '../index.js';
import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { Scheduling } from './scenarios.js';
import type { JSONSchema, MakeTool } from '../tools.js';

/**
 * JSON Schema for the `scheduling` parameter of `scenarios_create` / `scenarios_update`.
 * Mirrors the {@link Scheduling} type. The API itself also accepts a JSON-encoded string of the
 * same shape, but validating consumers (the MCP host) enforce the object form declared here.
 */
const schedulingInputSchema: JSONSchema = {
    type: 'object',
    description:
        "Scheduling configuration. Only the listed properties exist — there is no 'cron', 'hour' or similar property.",
    properties: {
        type: {
            type: 'string',
            enum: ['immediately', 'indefinitely', 'once', 'daily', 'weekly', 'monthly', 'yearly', 'on-demand'],
            description:
                "Type of scheduling. 'indefinitely' runs on an interval; 'on-demand' only runs when triggered manually or via scenarios_run.",
        },
        interval: {
            type: 'number',
            minimum: 60,
            description: "Interval in seconds when type is 'indefinitely' (minimum 60)",
        },
        date: { type: 'string', description: "Date and time to run the scenario when type is 'once' (ISO 8601)" },
        days: {
            type: 'array',
            items: { type: 'number' },
            description:
                "Days of the week to run the scenario when type is 'weekly' (0-6, where 0 is Sunday); days of the month when type is 'monthly' or 'yearly' (1-31)",
        },
        months: {
            type: 'array',
            items: { type: 'number' },
            description: "Months of the year to run the scenario when type is 'yearly' (1-12)",
        },
        time: {
            type: 'string',
            description:
                "Time of day to run the scenario when type is 'daily', 'weekly', 'monthly', or 'yearly' (e.g. '09:00')",
        },
        between: {
            type: 'array',
            items: { type: 'string' },
            description: 'Date and time range the scenario may run in, for all types (ISO 8601)',
        },
        restrict: {
            type: 'array',
            items: { type: 'object' },
            description: 'Restrictions for scheduling (days/months/time windows)',
        },
    },
    required: ['type'],
    additionalProperties: false,
};

/**
 * JSON Schema for the `blueprint` parameter of `scenarios_create` / `scenarios_update`.
 * Mirrors the {@link Blueprint} type. The API itself also accepts a JSON-encoded string of the
 * same shape, but validating consumers (the MCP host) enforce the object form declared here.
 *
 * `additionalProperties: true` (here and on `flow.items`) is load-bearing: blueprints carry more
 * properties than this schema declares (e.g. a webhook node's `listener`), and the MCP host's
 * validation pipeline strips undeclared properties from a `scenarios_get` → edit →
 * `scenarios_update` round-trip unless the schema explicitly allows them.
 */
const blueprintInputSchema: JSONSchema = {
    type: 'object',
    description:
        "Blueprint containing the scenario configuration. Every `module` value must be an existing module identifier verified via app-modules_list — never invent module names.",
    properties: {
        name: { type: 'string', description: 'Name of the scenario' },
        flow: {
            type: 'array',
            description:
                "Modules of the scenario in execution order. A module's filter lives in its `filter` property; there is no `epoch` property anywhere in a blueprint.",
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'Unique numeric identifier of the module within the blueprint',
                    },
                    module: {
                        type: 'string',
                        description:
                            "Module identifier in `app:ModuleName` format (e.g. 'http:ActionSendData'). Must exist — verify via app-modules_list / app-module_get; never guess",
                    },
                    version: { type: 'number', description: 'Version of the module' },
                    parameters: { type: 'object', description: 'Static module parameters' },
                    mapper: { type: 'object', description: 'Mappable module parameters' },
                    metadata: { type: 'object', description: 'Module metadata' },
                    routes: {
                        type: 'array',
                        items: { type: 'object' },
                        description: 'Routes to other nodes, each `{"flow": [...]}` — only for router modules',
                    },
                    onerror: { type: 'array', items: { type: 'object' }, description: 'Error handling modules' },
                    filter: {
                        type: 'object',
                        description:
                            'Filter applied before this module runs: `{"name": "...", "conditions": [[{"a": "...", "o": "text:equal", "b": "..."}]]}`',
                    },
                },
                required: ['id', 'module', 'version'],
                additionalProperties: true,
            },
        },
        metadata: {
            type: 'object',
            description: 'Metadata for the blueprint — required by the API; use `{"version": 1}` if unsure',
        },
    },
    required: ['name', 'flow', 'metadata'],
    additionalProperties: true,
};

export const tools: MakeTool[] = [
    {
        name: 'scenarios_list',
        title: 'List scenarios',
        description:
            'List all scenarios for a team. Results can be narrowed to one folder (optionally including its subfolders) and/or to scenarios carrying at least one of the given scenario labels. Returned scenarios include their assigned labels.',
        category: 'scenarios',
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
                teamId: { type: 'number', description: 'The team ID to filter scenarios by' },
                folderId: { type: 'number', description: 'Only return scenarios placed in this folder' },
                includeSubfolders: {
                    type: 'boolean',
                    description: 'When filtering by folderId, also include scenarios placed in its subfolders',
                },
                labelIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description:
                        'Only return scenarios carrying at least one of these scenario label IDs. Use labels_list to discover label IDs.',
                },
            },
            required: ['teamId'],
        },
        examples: [
            { teamId: 5 },
            { teamId: 5, folderId: 1576, includeSubfolders: true },
            { teamId: 5, labelIds: [42, 43] },
        ],
        execute: async (
            make: Make,
            args: { teamId: number; folderId?: number; includeSubfolders?: boolean; labelIds?: number[] },
        ) => {
            const { teamId, ...filters } = args;
            return await make.scenarios.list(teamId, { ...filters, cols: ['*'] });
        },
    },
    {
        name: 'scenarios_get',
        title: 'Get scenario',
        description: 'Get a scenario and its blueprint by ID.',
        category: 'scenarios',
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
                scenarioId: { type: 'number', description: 'The scenario ID to retrieve' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
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
        description:
            'Create a new scenario from a blueprint. Verify every module name in the blueprint via app-modules_list before creating — never invent module identifiers. The created scenario starts INACTIVE: call scenarios_activate before scenarios_run can execute it.',
        category: 'scenarios',
        scope: 'scenarios:write',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'ID of the team where the scenario will be created' },
                folderId: { type: 'number', description: 'ID of the folder where the scenario will be placed' },
                scheduling: schedulingInputSchema,
                blueprint: blueprintInputSchema,
                basedon: { type: 'string', description: 'ID of an existing template to base this one on' },
                confirmed: {
                    type: 'boolean',
                    description: 'Confirmation in case the scenario uses apps that are not yet installed',
                },
            },
            required: ['teamId', 'scheduling', 'blueprint'],
        },
        examples: [
            {
                teamId: 5,
                scheduling: { type: 'indefinitely', interval: 60 },
                blueprint: {
                    name: 'Gmail Attachments to Google Drive',
                    flow: [
                        {
                            id: 1,
                            module: 'google-email:watchEmails',
                            version: 1,
                            parameters: { connection: 5, folder: 'INBOX', filter: 'has:attachment' },
                            mapper: {},
                            metadata: { expect: [] },
                        },
                        {
                            id: 2,
                            module: 'google-drive:uploadFile',
                            version: 1,
                            parameters: { connection: 6 },
                            mapper: { folderId: 'your-folder-id-here', file: '{{1.attachments[]}}' },
                            metadata: { expect: [] },
                        },
                    ],
                    metadata: { version: 1 },
                },
            },
        ],
        execute: async (
            make: Make,
            args: {
                teamId: number;
                folderId?: number;
                scheduling: Scheduling;
                blueprint: Blueprint;
                basedon?: string;
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
        description:
            'Update a scenario. The `blueprint` parameter wholesale-REPLACES the existing blueprint (no merging): always fetch the current blueprint with scenarios_get first, edit that JSON, and send the complete result. Tool scenarios (created via tools_create) cannot be blueprint-edited with this tool — use tools_update.',
        category: 'scenarios',
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
                scenarioId: { type: 'number', description: 'The scenario ID to update' },
                name: { type: 'string', description: 'New name for the scenario' },
                description: {
                    type: 'string',
                    maxLength: 240,
                    description: 'New description for the scenario (maximum 240 characters)',
                },
                folderId: { type: 'number', description: 'New folder ID for the scenario' },
                scheduling: schedulingInputSchema,
                blueprint: blueprintInputSchema,
                confirmed: {
                    type: 'boolean',
                    description: 'Confirmation in case the scenario uses apps that are not yet installed',
                },
            },
            required: ['scenarioId'],
        },
        examples: [
            {
                scenarioId: 925,
                name: 'Updated Scenario',
                scheduling: { type: 'indefinitely', interval: 900 },
            },
        ],
        execute: async (
            make: Make,
            args: {
                scenarioId: number;
                name?: string;
                description?: string;
                folderId?: number;
                scheduling?: Scheduling;
                blueprint?: Blueprint;
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
        description: 'Delete a scenario.',
        category: 'scenarios',
        scope: 'scenarios:write',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'scenarioId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to delete' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
        execute: async (make: Make, args: { scenarioId: number }) => {
            await make.scenarios.delete(args.scenarioId);
            return `Scenario has been deleted.`;
        },
    },
    {
        name: 'scenarios_activate',
        title: 'Activate scenario',
        description:
            "Activate a scenario. Required before scenarios_run can execute it. If this fails with 'Scenario is already running', the scenario is already active — treat that as success and do not retry.",
        category: 'scenarios',
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
                scenarioId: { type: 'number', description: 'The scenario ID to activate' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
        execute: async (make: Make, args: { scenarioId: number }) => {
            return (await make.scenarios.activate(args.scenarioId))
                ? 'Scenario has been activated.'
                : 'Scenario has not been activated.';
        },
    },
    {
        name: 'scenarios_deactivate',
        title: 'Deactivate scenario',
        description:
            "Deactivate a scenario. If this fails with 'Scenario is not running', the scenario is already inactive — treat that as success and do not retry.",
        category: 'scenarios',
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
                scenarioId: { type: 'number', description: 'The scenario ID to deactivate' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
        execute: async (make: Make, args: { scenarioId: number }) => {
            return (await make.scenarios.deactivate(args.scenarioId))
                ? 'Scenario has been deactivated.'
                : 'Scenario has not been deactivated.';
        },
    },
    {
        name: 'scenarios_run',
        title: 'Run scenario',
        description:
            "Execute a scenario with optional input data. The scenario must be ACTIVE — a run of an inactive scenario fails with 'Scenario is not activated', so call scenarios_activate first (newly created scenarios start inactive). Returns an executionId: after a failed or suspicious run, inspect it with executions_get-detail BEFORE retrying or editing the scenario. A scenario cannot run twice concurrently — on 'Scenario is already being executed', wait for the running execution instead of retrying.",
        category: 'scenarios',
        scope: 'scenarios:run',
        scopeId: 'scenarioId',
        identifier: 'scenarioId',
        resourceId: 'scenarioId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                scenarioId: { type: 'number', description: 'The scenario ID to run' },
                data: {
                    type: 'object',
                    description:
                        "Optional input data for the scenario. Keys must match the scenario's input interface — check it with scenarios_interface",
                },
                responsive: {
                    type: 'boolean',
                    description:
                        'When true, waits for the execution to finish and returns its outputs; when false, the run is only queued and the executionId is returned immediately',
                },
                callbackUrl: { type: 'string', description: 'URL to call once the scenario execution finishes' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925, data: { name: 'John' }, responsive: true }],
        execute: async (
            make: Make,
            args: { scenarioId: number; data?: Record<string, JSONValue>; responsive?: boolean; callbackUrl?: string },
        ) => {
            const { scenarioId, data, responsive, callbackUrl } = args;
            return await make.scenarios.run(scenarioId, data, { responsive, callbackUrl });
        },
    },
    {
        name: 'scenarios_interface',
        title: 'Get scenario interface',
        description: 'Get the interface for a scenario.',
        category: 'scenarios',
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
                scenarioId: { type: 'number', description: 'The scenario ID to get the interface for' },
            },
            required: ['scenarioId'],
        },
        examples: [{ scenarioId: 925 }],
        execute: async (make: Make, args: { scenarioId: number }) => {
            return await make.scenarios.getInterface(args.scenarioId);
        },
    },
    {
        name: 'scenarios_set-interface',
        title: 'Set scenario interface',
        description: 'Update the interface for a scenario.',
        category: 'scenarios',
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
        examples: [
            {
                scenarioId: 925,
                interface: {
                    input: [{ name: 'myInput', type: 'text', required: true }],
                    output: [],
                },
            },
        ],
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
