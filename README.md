# Make TypeScript SDK

A TypeScript SDK for interacting with the Make API. This SDK provides a type-safe way to interact with [Make's API](https://developers.make.com/api-documentation) endpoints for managing scenarios, teams, data stores, and more.

## Installation

Via NPM (Node.js)

```bash
npm install @makehq/sdk
```

Via JSR (Deno)

```bash
deno add jsr:@make/sdk
```

## Basic Usage

```typescript
import { Make } from '@makehq/sdk';

// Initialize the Make client
const make = new Make('your-api-key', 'eu2.make.com');

// Initialize with retry configuration (optional)
const makeWithRetry = new Make('your-api-key', 'eu2.make.com', {
    retryOptions: {
        retryOnRateLimit: true, // Enable retries for rate limits
        maxRetries: 3,         // Default: 3
    }
});

// Example: Get user information
const user = await make.users.me();

// Example: List scenarios
const scenarios = await make.scenarios.list(/* Team ID */);

// Example: Work with data stores
const dataStore = await make.dataStores.get(/* DataStore ID */);
```

## Platform Endpoints

- **Enums** - Standardized lists (countries, regions, timezones)
- **Blueprit** - Blueprint management
- **Connections** - External service connections and authentication
- **Data Stores** - Data storage within Make
- **Data Store Records** - Individual records within data stores
- **Data Structures** - Data schemas and formats
- **Executions** - Scenario execution history
- **Folders** - Scenario categorization
- **Functions** - Custom JavaScript functions for scenarios
- **Hooks** - Webhooks and mailhooks for external integrations
- **Incomplete Executions** - Failed or incomplete scenario runs
- **Keys** - API keys and secrets
- **Organizations** - Top-level account and billing management
- **Scenarios** - Scenario management
- **Teams** - Team management and collaboration
- **Users** - Current user information and authentication

## Custom Apps Development Endpoints

- **SDK Apps** - Create and manage custom Make applications
- **SDK Modules** - Building blocks for custom apps
- **SDK Connections** - Authentication for custom apps
- **SDK Functions** - Reusable code blocks within custom apps
- **SDK RPCs** - Remote procedure calls for custom apps
- **SDK Webhooks** - Webhook handling for custom apps

## Features

- Full TypeScript support with type definitions
- Support for majority of Make API endpoints
- Built-in error handling and response typing
- Comprehensive test coverage
- Model Context Protocol (MCP) support

## MCP Server Support

This SDK includes full support for the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), allowing AI agents to interact with the Make API through standardized tools. All SDK endpoints are automatically exposed as MCP tools.

### Integrating with MCP Server (experimental)

```ts
import { Make } from '@makehq/sdk';
import { MakeMCPTools } from '@makehq/sdk/mcp';

// Initialize the Make client
const make = new Make('your-api-key', 'eu2.make.com');

// List tools
const tools = MakeMCPTools.map(tool => {
    return {
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
    };
});

// Execute tool
const tool = MakeMCPTools.find(tool => tool.name === 'scenarios_list');

try {
    await tool.execute(make, { teamId: 1 });
} catch (error) {
    // Handle error
}
```

See full example in the `scripts/run-mcp-server.mjs` file.

### Tool Structure

Each tool is described as demonstrated in the following example:

```ts
{
    name: 'scenarios_list',
    title: 'List scenarios',
    description: 'List all scenarios for a team',
    category: 'scenarios',
    scope: 'scenarios:read',
    inputSchema: {
        type: 'object',
        properties: {
            teamId: { type: 'number', description: 'The team ID to filter scenarios by' },
        },
        required: ['teamId'],
    },
    execute: async (make: Make, args: { teamId: number }) => {
        return await make.scenarios.list(args.teamId);
    },
}
```

### Tool Categories

All tools are organized into the following categories:

- `connections`
- `data-stores`
- `data-store-records`
- `data-structures`
- `enums`
- `executions`
- `folders`
- `functions`
- `hooks`
- `incomplete-executions`
- `keys`
- `organizations`
- `scenarios`
- `teams`
- `users`
- `sdk.apps`
- `sdk.connections`
- `sdk.functions`
- `sdk.modules`
- `sdk.rpcs`
- `sdk.webhooks`

### Tool Scopes

You can learn more about scopes in [our documentation](https://developers.make.com/api-documentation/authentication/api-scopes-overview#standard-user-scopes-for-all-users-of-make-platforms).

## Project Structure

```
make-sdk/
├── src/                       # Source code
│   ├── endpoints/             # API endpoint implementations
│   │   ├── *.ts               # Endpoints
│   │   └── *.mcp.ts           # MCP Tools
│   ├── index.ts               # Main entry point
│   ├── make.ts                # Core Make client
│   ├── types.ts               # Common type definitions
│   └── utils.ts               # Utility functions
├── test/                      # Test files
│   ├── mocks/                 # Test mocks
│   ├── *.spec.ts              # Unit tests
│   ├── *.integration.test.ts  # Integration tests
│   └── test.utils.ts          # Test utilities
├── dist/                      # Compiled output
└── docs/                      # Documentation
```

## Testing

The project includes both unit tests and integration tests. To run the tests:

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
# Make sure to set up your .env file first
npm run test:integration
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
MAKE_API_KEY="<your-api-key>"
MAKE_ZONE="<zone>"
MAKE_TEAM="<team-id>"
MAKE_ORGANIZATION="<organization-id>"
```

Please provide zone without `https://` prefix (e.g. `eu2.make.com`).

## Building

To build the project:

```bash
npm run build        # Builds both ESM and CJS versions
```

## Documentation

API documentation can be generated using:

```bash
npm run build:docs
```
