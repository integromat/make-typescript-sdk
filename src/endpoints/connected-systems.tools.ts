import type { Make } from '../make.js';
import type { JSONValue } from '../types.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'connected-system_list',
        title: 'List connected systems',
        description:
            'List on-prem connected systems for a specific on-prem agent. Requires both organizationId and agentId.',
        category: 'connected-system',
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
                agentId: { type: 'string', description: 'The on-prem agent UUID' },
            },
            required: ['organizationId', 'agentId'],
        },
        examples: [
            {
                organizationId: 5,
                agentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
        ],
        execute: async (make: Make, args: { organizationId: number; agentId: string }) => {
            return await make.connectedSystems.list(args.organizationId, args.agentId);
        },
    },
    {
        name: 'connected-system_get',
        title: 'Get connected system',
        description: 'Get details of an on-prem connected system.',
        category: 'connected-system',
        scope: 'agents:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'connectedSystemId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                connectedSystemId: { type: 'string', description: 'The connected system UUID' },
            },
            required: ['organizationId', 'connectedSystemId'],
        },
        examples: [
            {
                organizationId: 5,
                connectedSystemId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            },
        ],
        execute: async (make: Make, args: { organizationId: number; connectedSystemId: string }) => {
            return await make.connectedSystems.get(args.organizationId, args.connectedSystemId);
        },
    },
    {
        name: 'connected-system_create',
        title: 'Create connected system',
        description:
            'Create an on-prem connected system on an agent. First use connected-system_list-apps to pick appName, then on-prem-agent_get-app-config to discover required input keys. Supply inputs as a keyed object matching those fields.',
        category: 'connected-system',
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
                name: { type: 'string', description: 'Display name for the connected system' },
                agentId: { type: 'string', description: 'On-prem agent UUID that hosts the connection' },
                appName: { type: 'string', description: 'App slug from connected-system_list-apps' },
                inputs: {
                    type: 'object',
                    description: 'App-specific configuration values keyed by field name',
                },
            },
            required: ['organizationId', 'name', 'agentId', 'appName', 'inputs'],
        },
        examples: [
            {
                organizationId: 5,
                name: 'SAP production',
                agentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                appName: 'sap-agent',
                inputs: { ashost: '10.0.0.150', sysnr: '00', client: '100' },
            },
        ],
        execute: async (
            make: Make,
            args: {
                organizationId: number;
                name: string;
                agentId: string;
                appName: string;
                inputs: Record<string, JSONValue>;
            },
        ) => {
            return await make.connectedSystems.create(args.organizationId, {
                name: args.name,
                agentId: args.agentId,
                appName: args.appName,
                inputs: args.inputs,
            });
        },
    },
    {
        name: 'connected-system_update',
        title: 'Update connected system',
        description: 'Update an on-prem connected system. All body fields are optional.',
        category: 'connected-system',
        scope: 'agents:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'connectedSystemId',
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                connectedSystemId: { type: 'string', description: 'The connected system UUID' },
                name: { type: 'string', description: 'New display name' },
                agentId: { type: 'string', description: 'Move to a different on-prem agent' },
                appName: { type: 'string', description: 'Change the app slug' },
                inputs: {
                    type: 'object',
                    description: 'Updated configuration values keyed by field name',
                },
            },
            required: ['organizationId', 'connectedSystemId'],
        },
        examples: [
            {
                organizationId: 5,
                connectedSystemId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                name: 'SAP staging',
                inputs: { ashost: '10.0.0.150', sysnr: '00', client: '100' },
            },
        ],
        execute: async (
            make: Make,
            args: {
                organizationId: number;
                connectedSystemId: string;
                name?: string;
                agentId?: string;
                appName?: string;
                inputs?: Record<string, JSONValue>;
            },
        ) => {
            return await make.connectedSystems.update(args.organizationId, args.connectedSystemId, {
                name: args.name,
                agentId: args.agentId,
                appName: args.appName,
                inputs: args.inputs,
            });
        },
    },
    {
        name: 'connected-system_delete',
        title: 'Delete connected system',
        description: 'Delete an on-prem connected system. This is destructive and cannot be undone.',
        category: 'connected-system',
        scope: 'agents:write',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'connectedSystemId',
        annotations: {
            destructiveHint: true,
            idempotentHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID' },
                connectedSystemId: { type: 'string', description: 'The connected system UUID' },
            },
            required: ['organizationId', 'connectedSystemId'],
        },
        examples: [
            {
                organizationId: 5,
                connectedSystemId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            },
        ],
        execute: async (make: Make, args: { organizationId: number; connectedSystemId: string }) => {
            return await make.connectedSystems.delete(args.organizationId, args.connectedSystemId);
        },
    },
];
