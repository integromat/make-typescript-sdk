import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';
import type {
    CreateCustomPropertyStructureItemBody,
    CustomPropertyStructureItemType,
} from './custom-property-structure-items.js';

export const tools: MakeTool[] = [
    {
        name: 'custom-property-structure-items_list',
        title: 'List custom property structure items',
        description:
            'List the items (field definitions) of a custom property structure. Use custom-property-structures_list to find the structure ID.',
        category: 'custom-property-structure-items',
        scope: 'custom-property-structures:read',
        scopeId: 'customPropertyStructureId',
        identifier: 'customPropertyStructureId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                customPropertyStructureId: {
                    type: 'number',
                    description: 'The custom property structure ID to list items for',
                },
                id: { type: 'number', description: 'Filter items by exact ID' },
                name: { type: 'string', description: 'Filter items by name (case-insensitive regular expression)' },
                label: { type: 'string', description: 'Filter items by label (case-insensitive regular expression)' },
                description: {
                    type: 'string',
                    description: 'Filter items by description (case-insensitive regular expression)',
                },
                type: {
                    type: 'string',
                    enum: ['boolean', 'number', 'shortText', 'longText', 'date', 'dropdown', 'multiselect'],
                    description: 'Filter items by data type',
                },
                required: { type: 'boolean', description: 'Filter items by whether they are required' },
            },
            required: ['customPropertyStructureId'],
        },
        examples: [{ customPropertyStructureId: 6 }, { customPropertyStructureId: 6, type: 'dropdown' }],
        execute: async (
            make: Make,
            args: {
                customPropertyStructureId: number;
                id?: number;
                name?: string;
                label?: string;
                description?: string;
                type?: CustomPropertyStructureItemType;
                required?: boolean;
            },
        ) => {
            const { customPropertyStructureId, ...options } = args;
            return await make.customPropertyStructures.items.list(customPropertyStructureId, {
                ...options,
                cols: ['*'],
            });
        },
    },
    {
        name: 'custom-property-structure-items_create',
        title: 'Create custom property structure item',
        description:
            "Create an item (field definition) in a custom property structure. The item's name and type cannot be changed after creation. `options` is required for the 'dropdown' and 'multiselect' types and not allowed for any other type.",
        category: 'custom-property-structure-items',
        scope: 'custom-property-structures:write',
        scopeId: 'customPropertyStructureId',
        identifier: 'customPropertyStructureId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                customPropertyStructureId: {
                    type: 'number',
                    description: 'The custom property structure ID to add the item to',
                },
                name: {
                    type: 'string',
                    description:
                        'Unique name of the item within the structure, used as its key in scenario data. Must match ^[a-zA-Z_$][0-9a-zA-Z_$]*$, max 64 characters. Cannot be changed after creation.',
                },
                label: {
                    type: 'string',
                    description: 'Label shown to users in the scenario table header, max 64 characters',
                },
                type: {
                    type: 'string',
                    enum: ['boolean', 'number', 'shortText', 'longText', 'date', 'dropdown', 'multiselect'],
                    description: 'Data type of the item. Cannot be changed after creation.',
                },
                description: {
                    type: 'string',
                    description: 'Description shown in the Scenario properties tab, max 1024 characters',
                },
                options: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: { value: { type: 'string', description: 'The option value, max 250 characters' } },
                        required: ['value'],
                    },
                    description:
                        "Available choices. Required for 'dropdown'/'multiselect' items, not allowed otherwise. Values must be unique.",
                },
                required: {
                    type: 'boolean',
                    description:
                        'Whether filling in this item is mandatory when setting scenario custom properties data',
                },
            },
            required: ['customPropertyStructureId', 'name', 'label', 'type', 'required'],
        },
        examples: [
            {
                customPropertyStructureId: 6,
                name: 'teamLocation',
                label: 'Team location',
                type: 'shortText',
                required: true,
            },
            {
                customPropertyStructureId: 6,
                name: 'category',
                label: 'Category',
                type: 'multiselect',
                options: [{ value: 'Eshop' }, { value: 'Notifications' }],
                required: false,
            },
        ],
        execute: async (
            make: Make,
            args: {
                customPropertyStructureId: number;
                name: string;
                label: string;
                type: CustomPropertyStructureItemType;
                description?: string;
                options?: { value: string }[];
                required: boolean;
            },
        ) => {
            const { customPropertyStructureId, ...body } = args;
            // This tool's inputSchema stays flat rather than using oneOf to mirror
            // CreateCustomPropertyStructureItemBody's discriminated union, matching this repo's
            // convention of simplifying generics/unions for MCP tools; the live API still
            // validates the dropdown/multiselect+options coupling (IM error otherwise), so this
            // just forwards the caller's input as given.
            return await make.customPropertyStructures.items.create(
                customPropertyStructureId,
                body as CreateCustomPropertyStructureItemBody,
            );
        },
    },
    {
        name: 'custom-property-structure-items_update',
        title: 'Update custom property structure item',
        description:
            "Update a custom property structure item. The item's name and type cannot be changed. When updating `options` of a 'dropdown'/'multiselect' item, the new set fully replaces the current one — existing scenario data referencing removed options is not remapped.",
        category: 'custom-property-structure-items',
        scope: 'custom-property-structures:write',
        scopeId: 'customPropertyStructureItemId',
        identifier: 'customPropertyStructureItemId',
        resourceId: 'customPropertyStructureItemId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                customPropertyStructureItemId: {
                    type: 'number',
                    description: 'The custom property structure item ID to update',
                },
                label: { type: 'string', description: 'New label, max 64 characters' },
                description: { type: 'string', description: 'New description, max 1024 characters' },
                options: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: { value: { type: 'string', description: 'The option value, max 250 characters' } },
                        required: ['value'],
                    },
                    description: "Full replacement set of available choices. Only for 'dropdown'/'multiselect' items.",
                },
                required: { type: 'boolean', description: 'Whether filling in this item is mandatory' },
            },
            required: ['customPropertyStructureItemId'],
        },
        examples: [
            { customPropertyStructureItemId: 2, label: 'Updated categories' },
            { customPropertyStructureItemId: 2, options: [{ value: 'Logistics' }, { value: 'People team' }] },
        ],
        execute: async (
            make: Make,
            args: {
                customPropertyStructureItemId: number;
                label?: string;
                description?: string;
                options?: { value: string }[];
                required?: boolean;
            },
        ) => {
            const { customPropertyStructureItemId, ...body } = args;
            return await make.customPropertyStructures.items.update(customPropertyStructureItemId, body);
        },
    },
    {
        name: 'custom-property-structure-items_delete',
        title: 'Delete custom property structure item',
        description:
            "Delete a custom property structure item. Deleting an item also deletes any scenario data filled in for it — this is irreversible. If scenarios already have data for the item, the call fails with IM004 unless 'confirmed' is true.",
        category: 'custom-property-structure-items',
        scope: 'custom-property-structures:write',
        scopeId: 'customPropertyStructureItemId',
        identifier: 'customPropertyStructureItemId',
        resourceId: 'customPropertyStructureItemId',
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                customPropertyStructureItemId: {
                    type: 'number',
                    description: 'The custom property structure item ID to delete',
                },
                confirmed: {
                    type: 'boolean',
                    description:
                        'Confirmation of the deletion. Required when scenarios already have data for this item; confirming discards that data.',
                },
            },
            required: ['customPropertyStructureItemId'],
        },
        examples: [{ customPropertyStructureItemId: 2 }, { customPropertyStructureItemId: 2, confirmed: true }],
        execute: async (make: Make, args: { customPropertyStructureItemId: number; confirmed?: boolean }) => {
            await make.customPropertyStructures.items.delete(args.customPropertyStructureItemId, {
                confirmed: args.confirmed,
            });
            return 'Custom property structure item has been deleted.';
        },
    },
];
