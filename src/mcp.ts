import { tools as SDKAppsTools } from './endpoints/sdk/apps.mcp.js';
import { tools as SDKConnectionsTools } from './endpoints/sdk/connections.mcp.js';
import { tools as SDKFunctionsTools } from './endpoints/sdk/functions.mcp.js';
import { tools as SDKModulesTools } from './endpoints/sdk/modules.mcp.js';
import { tools as SDKRPCsTools } from './endpoints/sdk/rpcs.mcp.js';
import { tools as SDKWebhooksTools } from './endpoints/sdk/webhooks.mcp.js';

import { tools as ScenariosTools } from './endpoints/scenarios.mcp.js';
import { tools as ConnectionsTools } from './endpoints/connections.mcp.js';
import { tools as DataStoresTools } from './endpoints/data-stores.mcp.js';
import { tools as DataStoreRecordsTools } from './endpoints/data-store-records.mcp.js';
import { tools as BlueprintsTools } from './endpoints/blueprints.mcp.js';
import { tools as TeamsTools } from './endpoints/teams.mcp.js';
import { tools as OrganizationsTools } from './endpoints/organizations.mcp.js';
import { tools as UsersTools } from './endpoints/users.mcp.js';
import { tools as FunctionsTools } from './endpoints/functions.mcp.js';
import { tools as ExecutionsTools } from './endpoints/executions.mcp.js';
import { tools as HooksTools } from './endpoints/hooks.mcp.js';
import { tools as KeysTools } from './endpoints/keys.mcp.js';
import { tools as FoldersTools } from './endpoints/folders.mcp.js';
import { tools as IncompleteExecutionsTools } from './endpoints/incomplete-executions.mcp.js';
import { tools as DataStructuresTools } from './endpoints/data-structures.mcp.js';
import { tools as EnumsTools } from './endpoints/enums.mcp.js';

export const MakeMCPTools = [
    // SDK Tools
    ...SDKAppsTools,
    ...SDKConnectionsTools,
    ...SDKFunctionsTools,
    ...SDKModulesTools,
    ...SDKRPCsTools,
    ...SDKWebhooksTools,

    // Core Endpoint Tools
    ...ScenariosTools,
    ...ConnectionsTools,
    ...DataStoresTools,
    ...DataStoreRecordsTools,
    ...BlueprintsTools,
    ...TeamsTools,
    ...OrganizationsTools,
    ...UsersTools,
    ...FunctionsTools,
    ...ExecutionsTools,
    ...HooksTools,
    ...KeysTools,
    ...FoldersTools,
    ...IncompleteExecutionsTools,
    ...DataStructuresTools,
    ...EnumsTools,
];
