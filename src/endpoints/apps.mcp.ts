import type { Make } from '../make.js';

export const tools = [
    {
        name: 'app_modules_with_credentials',
        title: 'List app modules with credentials',
        description:
            'Retrieve all modules with credential requirements for a specific app and version. Returns module identification, required credential type, OAuth scopes, and whether the module is a hook-based trigger. For custom/SDK apps, prefix the app name with "app#".',
        category: 'apps',
        scope: 'apps:read',
        identifier: 'appName',
        annotations: {
            readOnlyHint: true,
        },
        inputSchema: {
            type: 'object',
            properties: {
                appName: {
                    type: 'string',
                    description:
                        'The name of the app (e.g., "slack"). For custom/SDK apps, use the "app#" prefix (e.g., "app#my-custom-app").',
                },
                version: {
                    type: ['number', 'string'],
                    description: 'The major version of the app (e.g., 1, 2) or "latest" for the most recent version.',
                },
            },
            required: ['appName', 'version'],
        },
        execute: async (make: Make, args: { appName: string; version: number | 'latest' }) => {
            return await make.apps.listModulesWithCredentials(args.appName, args.version);
        },
    },
];
