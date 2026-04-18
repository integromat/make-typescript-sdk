import type { Make } from '../../make.js';

export const tools = [
    {
        name: 'sdk-webhooks_list',
        title: 'List SDK webhooks',
        description: 'List webhooks for a specific app.',
        category: 'sdk-webhooks',
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
        examples: [{ appName: 'my-app' }],
        execute: async (make: Make, args: { appName: string }) => {
            return await make.sdk.webhooks.list(args.appName);
        },
    },
    {
        name: 'sdk-webhooks_get',
        title: 'Get SDK webhook',
        description: 'Get a single webhook by name.',
        category: 'sdk-webhooks',
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
        examples: [{ webhookName: 'my-app' }],
        execute: async (make: Make, args: { webhookName: string }) => {
            return await make.sdk.webhooks.get(args.webhookName);
        },
    },
    {
        name: 'sdk-webhooks_create',
        title: 'Create SDK webhook',
        description: 'Create a new webhook for an app.',
        category: 'sdk-webhooks',
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
        examples: [{ appName: 'my-app', type: 'web', label: 'New Item' }],
        execute: async (make: Make, args: { appName: string; type: string; label: string }) => {
            const { appName, ...body } = args;
            return await make.sdk.webhooks.create(appName, body);
        },
    },
    {
        name: 'sdk-webhooks_update',
        title: 'Update SDK webhook',
        description: 'Update an existing webhook.',
        category: 'sdk-webhooks',
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
        examples: [{ webhookName: 'my-app', label: 'New Item (Updated)' }],
        execute: async (make: Make, args: { webhookName: string; label?: string }) => {
            const { webhookName, ...body } = args;
            return await make.sdk.webhooks.update(webhookName, body);
        },
    },
    {
        name: 'sdk-webhooks_delete',
        title: 'Delete SDK webhook',
        description: 'Delete a webhook.',
        category: 'sdk-webhooks',
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
        examples: [{ webhookName: 'my-app' }],
        execute: async (make: Make, args: { webhookName: string }) => {
            await make.sdk.webhooks.delete(args.webhookName);
            return `Webhook has been deleted.`;
        },
    },
    {
        name: 'sdk-webhooks_get-section',
        title: 'Get SDK webhook section',
        description: 'Get a specific section of a webhook.',
        category: 'sdk-webhooks',
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
                    enum: ['api', 'parameters', 'attach', 'detach', 'scope'],
                    description: 'The section to get',
                },
            },
            required: ['webhookName', 'section'],
        },
        examples: [{ webhookName: 'my-app', section: 'api' }],
        execute: async (
            make: Make,
            args: {
                webhookName: string;
                section: 'api' | 'parameters' | 'attach' | 'detach' | 'scope';
            },
        ) => {
            return await make.sdk.webhooks.getSection(args.webhookName, args.section);
        },
    },
    {
        name: 'sdk-webhooks_set-section',
        title: 'Set SDK webhook section',
        description: 'Set a specific section of a webhook.',
        category: 'sdk-webhooks',
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
                    enum: ['api', 'parameters', 'attach', 'detach', 'scope'],
                    description: 'The section to set',
                },
                body: { type: 'string', description: 'The section data to set in JSONC format' },
            },
            required: ['webhookName', 'section', 'body'],
        },
        examples: [{ webhookName: 'my-app', section: 'api', body: '{"url": "/webhooks/subscribe", "method": "POST"}' }],
        execute: async (
            make: Make,
            args: {
                webhookName: string;
                section: 'api' | 'parameters' | 'attach' | 'detach' | 'scope';
                body: string;
            },
        ) => {
            await make.sdk.webhooks.setSection(args.webhookName, args.section, args.body);
            return `Section '${args.section}' has been set.`;
        },
    },
];
