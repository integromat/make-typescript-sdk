import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';

export const tools = [
    {
        name: 'sdk_webhooks_list',
        title: 'List SDK webhooks',
        description: 'List webhooks for a specific app',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
            },
            required: ['appName'],
        },
        execute: async (make: Make, args: { appName: string }) => {
            return await make.sdk.webhooks.list(args.appName);
        },
    },
    {
        name: 'sdk_webhooks_get',
        title: 'Get SDK webhook',
        description: 'Get a single webhook by name',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                webhookName: { type: 'string', description: 'The name of the webhook' },
            },
            required: ['webhookName'],
        },
        execute: async (make: Make, args: { webhookName: string }) => {
            return await make.sdk.webhooks.get(args.webhookName);
        },
    },
    {
        name: 'sdk_webhooks_create',
        title: 'Create SDK webhook',
        description: 'Create a new webhook for an app',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                type: { type: 'string', description: 'The type of the webhook' },
                label: { type: 'string', description: 'The label of the webhook visible in the scenario builder' },
            },
            required: ['appName', 'type', 'label'],
        },
        execute: async (make: Make, args: { appName: string; type: string; label: string }) => {
            const { appName, ...body } = args;
            return await make.sdk.webhooks.create(appName, body);
        },
    },
    {
        name: 'sdk_webhooks_update',
        title: 'Update SDK webhook',
        description: 'Update an existing webhook',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                webhookName: { type: 'string', description: 'The name of the webhook' },
                label: { type: 'string', description: 'The label of the webhook visible in the scenario builder' },
            },
            required: ['webhookName'],
        },
        execute: async (make: Make, args: { webhookName: string; label?: string }) => {
            const { webhookName, ...body } = args;
            return await make.sdk.webhooks.update(webhookName, body);
        },
    },
    {
        name: 'sdk_webhooks_delete',
        title: 'Delete SDK webhook',
        description: 'Delete a webhook',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                webhookName: { type: 'string', description: 'The name of the webhook' },
            },
            required: ['webhookName'],
        },
        execute: async (make: Make, args: { webhookName: string }) => {
            await make.sdk.webhooks.delete(args.webhookName);
            return `Webhook has been deleted.`;
        },
    },
    {
        name: 'sdk_webhooks_get_section',
        title: 'Get SDK webhook section',
        description: 'Get a specific section of a webhook',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                webhookName: { type: 'string', description: 'The name of the webhook' },
                section: {
                    type: 'string',
                    enum: ['api', 'parameters', 'attach', 'detach', 'scope', 'update'],
                    description: 'The section to get',
                },
            },
            required: ['webhookName', 'section'],
        },
        execute: async (
            make: Make,
            args: {
                webhookName: string;
                section: 'api' | 'parameters' | 'attach' | 'detach' | 'scope' | 'update';
            },
        ) => {
            return await make.sdk.webhooks.getSection(args.webhookName, args.section);
        },
    },
    {
        name: 'sdk_webhooks_set_section',
        title: 'Set SDK webhook section',
        description: 'Set a specific section of a webhook',
        category: 'sdk.webhooks',
        scope: 'sdk-apps:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                webhookName: { type: 'string', description: 'The name of the webhook' },
                section: {
                    type: 'string',
                    enum: ['api', 'parameters', 'attach', 'detach', 'scope', 'update'],
                    description: 'The section to set',
                },
                body: { type: 'string', description: 'The section data to set in JSONC format' },
            },
            required: ['webhookName', 'section', 'body'],
        },
        execute: async (
            make: Make,
            args: {
                webhookName: string;
                section: 'api' | 'parameters' | 'attach' | 'detach' | 'scope' | 'update';
                body: string;
            },
        ) => {
            await make.sdk.webhooks.setSection(args.webhookName, args.section, args.body);
            return `Section '${args.section}' has been set.`;
        },
    },
];
