import type { Make } from '../make.js';

export const tools = [
    {
        name: 'organizations_list',
        title: 'List organizations',
        description: 'List organizations for the current user',
        category: 'organizations',
        scope: 'organizations:read',
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        execute: async (make: Make) => {
            return await make.organizations.list({ cols: ['*'] });
        },
    },
    {
        name: 'organizations_get',
        title: 'Get organization',
        description: 'Get details of a specific organization',
        category: 'organizations',
        scope: 'organizations:read',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to retrieve' },
            },
            required: ['organizationId'],
        },
        execute: async (make: Make, args: { organizationId: number }) => {
            return await make.organizations.get(args.organizationId);
        },
    },
    {
        name: 'organizations_create',
        title: 'Create organization',
        description: 'Create a new organization',
        category: 'organizations',
        scope: 'organizations:write',
        identifier: undefined,
        annotations: {
            idempotentHint: true,
            destructiveHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name of the organization' },
                regionId: { type: 'number', description: 'The ID of the region the organization will be created in' },
                timezoneId: { type: 'number', description: 'The ID of the timezone' },
                countryId: { type: 'number', description: 'The ID of the country' },
            },
            required: ['name', 'regionId', 'timezoneId', 'countryId'],
        },
        execute: async (
            make: Make,
            args: { name: string; regionId: number; timezoneId: number; countryId: number },
        ) => {
            return await make.organizations.create(args);
        },
    },
    {
        name: 'organizations_update',
        title: 'Update organization',
        description: 'Update an existing organization',
        category: 'organizations',
        scope: 'organizations:write',
        identifier: 'organizationId',
        annotations: {
            idempotentHint: true,
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to update' },
                name: { type: 'string', description: 'New name for the organization' },
                countryId: { type: 'number', description: 'New country ID' },
                timezoneId: { type: 'number', description: 'New timezone ID' },
            },
            required: ['organizationId'],
        },
        execute: async (
            make: Make,
            args: {
                organizationId: number;
                name?: string;
                countryId?: number;
                timezoneId?: number;
            },
        ) => {
            const { organizationId, ...body } = args;
            return await make.organizations.update(organizationId, body);
        },
    },
    {
        name: 'organizations_delete',
        title: 'Delete organization',
        description: 'Delete an organization',
        category: 'organizations',
        scope: 'organizations:write',
        identifier: 'organizationId',
        annotations: {
            destructiveHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to delete' },
            },
            required: ['organizationId'],
        },
        execute: async (make: Make, args: { organizationId: number }) => {
            await make.organizations.delete(args.organizationId);
            return `Organization has been deleted.`;
        },
    },
];
