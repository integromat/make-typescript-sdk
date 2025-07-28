import type { Make } from '../make.js';

export const tools = [
    {
        name: 'users_me',
        title: 'Get current user',
        description: 'Get details of the current user',
        category: 'users',
        scope: undefined,
        identifier: undefined,
        inputSchema: {
            type: 'object',
        },
        execute: async (make: Make) => {
            return await make.users.me();
        },
    },
    {
        name: 'users_current_authorization',
        title: 'Get current authorization',
        description: 'Get authorization details for the current user',
        category: 'users',
        scope: undefined,
        identifier: undefined,
        inputSchema: {
            type: 'object',
        },
        execute: async (make: Make) => {
            return await make.users.currentAuthorization();
        },
    },
];
