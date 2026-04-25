import type { Make } from '../make.js';
import type { MakeTool } from '../tools.js';

export const tools: MakeTool[] = [
    {
        name: 'enums_countries',
        title: 'List countries',
        description: 'List all available countries.',
        category: 'enums',
        scope: undefined,
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        examples: [{}],
        execute: async (make: Make) => {
            return await make.enums.countries();
        },
    },
    {
        name: 'enums_regions',
        title: 'List regions',
        description: 'List all available regions.',
        category: 'enums',
        scope: undefined,
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        examples: [{}],
        execute: async (make: Make) => {
            return await make.enums.regions();
        },
    },
    {
        name: 'enums_timezones',
        title: 'List timezones',
        description: 'List all available timezones.',
        category: 'enums',
        scope: undefined,
        scopeId: undefined,
        identifier: undefined,
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {},
        },
        examples: [{}],
        execute: async (make: Make) => {
            return await make.enums.timezones();
        },
    },
];
