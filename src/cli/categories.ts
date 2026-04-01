/**
 * Optional help group headings for top-level command categories.
 * Commands without an entry appear under the default "Commands:" heading.
 */
export const CATEGORY_GROUPS: Record<string, string> = {
    connections: 'Credentials:',
    'credential-requests': 'Credentials:',
    keys: 'Credentials:',
    scenarios: 'Scenarios:',
    executions: 'Scenarios:',
    'incomplete-executions': 'Scenarios:',
    folders: 'Scenarios:',
    functions: 'Scenarios:',
    hooks: 'Scenarios:',
    'data-structures': 'Scenarios:',
    'data-stores': 'Data Stores:',
    'data-store-records': 'Data Stores:',
    teams: 'Account Management:',
    organizations: 'Account Management:',
    users: 'Account Management:',
    enums: 'Others:',
    // SDK categories
    'sdk-apps': 'Custom App Development:',
    'sdk-connections': 'Custom App Development:',
    'sdk-functions': 'Custom App Development:',
    'sdk-modules': 'Custom App Development:',
    'sdk-rpcs': 'Custom App Development:',
    'sdk-webhooks': 'Custom App Development:',
};

export const CATEGORY_TITLES: Record<string, string> = {
    // Top-level categories
    connections: 'Connections',
    'credential-requests': 'Credential Requests',
    'data-store-records': 'Data Store Records',
    'data-stores': 'Data Stores',
    'data-structures': 'Data Structures',
    enums: 'Shared Enumerations',
    executions: 'Scenario Executions',
    folders: 'Scenario Folders',
    functions: 'Custom Functions',
    hooks: 'Webhooks',
    'incomplete-executions': 'Incomplete Executions',
    keys: 'Keys',
    organizations: 'Organizations',
    scenarios: 'Scenarios',
    teams: 'Teams',
    users: 'Users',
    // SDK categories
    'sdk-apps': 'App Definitions',
    'sdk-connections': 'App Connections',
    'sdk-functions': 'App Functions',
    'sdk-modules': 'App Modules',
    'sdk-rpcs': 'App Remote Procedures',
    'sdk-webhooks': 'App Webhooks',
};
