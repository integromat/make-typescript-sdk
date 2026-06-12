import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'on-prem-agent_list',
        title: 'List on-prem agents',
        description:
            'List on-prem bridge agents for an organization. These are customer-hosted agents, not Make AI agents.',
        category: 'on-prem-agent',
        scope: 'agents:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 5 }],
        execute: async (make: Make, args: { organizationId: number }) => {
            return await make.onPremAgents.list(args.organizationId);
        },
    },
    {
        name: 'on-prem-agent_get',
        title: 'Get on-prem agent',
        description: 'Get details of a specific on-prem bridge agent.',
        category: 'on-prem-agent',
        scope: 'agents:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'agentId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                agentId: { type: 'string', description: 'The on-prem agent UUID' },
            },
            required: ['organizationId', 'agentId'],
        },
        examples: [{ organizationId: 5, agentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }],
        execute: async (make: Make, args: { organizationId: number; agentId: string }) => {
            return await make.onPremAgents.get(args.organizationId, args.agentId);
        },
    },
    {
        name: 'on-prem-agent_create',
        title: 'Register on-prem agent',
        description:
            'Register a new on-prem bridge agent. The server assigns id and clientSecret; store the secret securely — it may only be shown once.',
        category: 'on-prem-agent',
        scope: 'agents:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            idempotentHint: false,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                name: { type: 'string', description: 'Display name for the new on-prem agent' },
            },
            required: ['organizationId', 'name'],
        },
        examples: [{ organizationId: 5, name: 'Production bridge' }],
        execute: async (make: Make, args: { organizationId: number; name: string }) => {
            return await make.onPremAgents.create(args.organizationId, { name: args.name });
        },
    },
    {
        name: 'on-prem-agent_update',
        title: 'Update on-prem agent',
        description: 'Update an on-prem bridge agent (currently supports renaming).',
        category: 'on-prem-agent',
        scope: 'agents:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'agentId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                agentId: { type: 'string', description: 'The on-prem agent UUID' },
                name: { type: 'string', description: 'New display name for the agent' },
            },
            required: ['organizationId', 'agentId'],
        },
        examples: [{ organizationId: 5, agentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Renamed agent' }],
        execute: async (make: Make, args: { organizationId: number; agentId: string; name?: string }) => {
            return await make.onPremAgents.update(args.organizationId, args.agentId, { name: args.name });
        },
    },
    {
        name: 'on-prem-agent_delete',
        title: 'Delete on-prem agent',
        description: 'Delete an on-prem bridge agent. This is destructive and cannot be undone.',
        category: 'on-prem-agent',
        scope: 'agents:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'agentId',
        annotations: {
            destructiveHint: true,
            idempotentHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                agentId: { type: 'string', description: 'The on-prem agent UUID' },
            },
            required: ['organizationId', 'agentId'],
        },
        examples: [{ organizationId: 5, agentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }],
        execute: async (make: Make, args: { organizationId: number; agentId: string }) => {
            return await make.onPremAgents.delete(args.organizationId, args.agentId);
        },
    },
    {
        name: 'on-prem-agent_get-app-config',
        title: 'Get on-prem agent app config',
        description:
            'Get dynamic input field definitions for creating a connected system on an on-prem agent app. Use connected-system_list-apps to choose appName, then supply keyed inputs when creating a connected system.',
        category: 'on-prem-agent',
        scope: 'agents:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'agentId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                agentId: { type: 'string', description: 'The on-prem agent UUID' },
                appName: {
                    type: 'string',
                    description: 'Connected-system app slug (e.g. http, sap-agent)',
                },
            },
            required: ['organizationId', 'agentId', 'appName'],
        },
        examples: [
            {
                organizationId: 5,
                agentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                appName: 'http',
            },
        ],
        execute: async (
            make: Make,
            args: { organizationId: number; agentId: string; appName: string },
        ) => {
            return await make.onPremAgents.getAppConfig(args.organizationId, args.agentId, args.appName);
        },
    },
];
