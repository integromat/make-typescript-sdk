import type { Make } from '../make.js';

export const tools = [
    {
        name: 'enums_countries',
        title: 'List countries',
        description: 'List all available countries',
        category: 'enums',
        scope: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        execute: async (make: Make) => {
            return await make.enums.countries();
        },
    },
    {
        name: 'enums_regions',
        title: 'List regions',
        description: 'List all available regions',
        category: 'enums',
        scope: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        execute: async (make: Make) => {
            return await make.enums.regions();
        },
    },
    {
        name: 'enums_timezones',
        title: 'List timezones',
        description: 'List all available timezones',
        category: 'enums',
        scope: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        execute: async (make: Make) => {
            return await make.enums.timezones();
        },
    },
];
