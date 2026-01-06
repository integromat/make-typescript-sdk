# Make TypeScript SDK - AI Agents Guide

## Overview

This document provides detailed instructions for AI agents on how to extend the Make TypeScript SDK repository in a consistent and maintainable way. The SDK follows strict patterns and conventions that must be adhered to when adding new functionality.

## Repository Structure

```
make-sdk/
├── src/
│   ├── endpoints/            # API endpoint implementations
│   │   ├── *.ts              # Endpoints
│   │   └── *.mcp.ts          # MCP Tools
│   ├── index.ts              # Main entry point with all exports
│   ├── make.ts               # Core Make client class
│   ├── types.ts              # Common type definitions
│   ├── utils.ts              # Utility functions
│   └── version.ts            # Auto-generated version file
├── test/
│   ├── mocks/                # JSON mock files organized by endpoint
│   ├── *.spec.ts             # Unit tests
│   ├── *.integration.test.ts # Integration tests
│   └── test.utils.ts         # Test utilities
└── dist/                     # Compiled output (auto-generated)
```

## Core Patterns and Conventions

### 1. Endpoint Implementation Pattern

**File Location**: `src/endpoints/{endpoint-name}.ts`

Every endpoint follows this exact structure:

```typescript
import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Main entity type with comprehensive JSDoc
 */
export type EntityName = {
    /** Unique identifier */
    id: number;
    /** Entity name */
    name: string;
    /** Additional fields with detailed descriptions */
    // ... other fields
};

/**
 * Options for listing entities with generic column selection
 */
export type ListEntityNamesOptions<C extends keyof EntityName = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<EntityName>>;
    /** Additional filter options specific to this endpoint */
    // ... other options
};

/**
 * Options for getting a single entity
 */
export type GetEntityNameOptions<C extends keyof EntityName = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Body for creating a new entity
 */
export type CreateEntityNameBody = {
    /** Required fields for creation */
    name: string;
    // ... other required/optional fields
};

/**
 * Body for updating an entity
 */
export type UpdateEntityNameBody = {
    /** Fields that can be updated */
    name?: string;
    // ... other updatable fields
};

/**
 * Internal response types (not exported)
 */
type ListEntityNamesResponse<C extends keyof EntityName = never> = {
    entityNames: PickColumns<EntityName, C>[];
    pg: Pagination<EntityName>;
};

type GetEntityNameResponse<C extends keyof EntityName = never> = {
    entityName: PickColumns<EntityName, C>;
};

type CreateEntityNameResponse = {
    entityName: EntityName;
};

type UpdateEntityNameResponse = {
    entityName: EntityName;
};

/**
 * Class providing methods for working with entities
 */
export class EntityNames {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List entities with optional filtering and pagination
     */
    async list<C extends keyof EntityName = never>(
        options: ListEntityNamesOptions<C> = {},
    ): Promise<PickColumns<EntityName, C>[]> {
        const response = await this.#fetch<ListEntityNamesResponse<C>>('/entity-names', {
            query: options,
        });
        return response.entityNames;
    }

    /**
     * Get a single entity by ID
     */
    async get<C extends keyof EntityName = never>(
        id: number,
        options: GetEntityNameOptions<C> = {},
    ): Promise<PickColumns<EntityName, C>> {
        const response = await this.#fetch<GetEntityNameResponse<C>>(`/entity-names/${id}`, {
            query: options,
        });
        return response.entityName;
    }

    /**
     * Create a new entity
     */
    async create(body: CreateEntityNameBody): Promise<EntityName> {
        const response = await this.#fetch<CreateEntityNameResponse>('/entity-names', {
            method: 'POST',
            body,
        });
        return response.entityName;
    }

    /**
     * Update an existing entity
     */
    async update(id: number, body: UpdateEntityNameBody): Promise<EntityName> {
        const response = await this.#fetch<UpdateEntityNameResponse>(`/entity-names/${id}`, {
            method: 'PATCH',
            body,
        });
        return response.entityName;
    }

    /**
     * Delete an entity
     */
    async delete(id: number): Promise<void> {
        await this.#fetch(`/entity-names/${id}`, {
            method: 'DELETE',
        });
    }
}
```

### 2. Core Client Integration

**File**: `src/make.ts`

When adding a new endpoint, you must:

1. Import the endpoint class at the top
2. Add a public readonly property
3. Initialize it in the constructor
4. Add comprehensive JSDoc documentation

```typescript
import { EntityNames } from './endpoints/entity-names.js';

export class Make {
    // ... existing properties

    /**
     * Access to entity-related endpoints
     * Detailed description of what this endpoint manages
     */
    public readonly entityNames: EntityNames;

    constructor(token: string, zone: string, options = {}) {
        // ... existing initialization

        this.entityNames = new EntityNames(this.fetch.bind(this));
    }
}
```

### 3. Export Integration

**File**: `src/index.ts`

Add all public types to the exports:

```typescript
export type {
    EntityName,
    EntityNames,
    ListEntityNamesOptions,
    GetEntityNameOptions,
    CreateEntityNameBody,
    UpdateEntityNameBody,
} from './endpoints/entity-names.js';
```

### 4. Testing Patterns

#### Unit Tests (`test/{endpoint-name}.spec.ts`)

```typescript
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/entity-names/list.json';
import * as getMock from './mocks/entity-names/get.json';
import * as createMock from './mocks/entity-names/create.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: EntityNames', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list entity names', async () => {
        mockFetch('GET https://make.local/api/v2/entity-names', listMock);

        const result = await make.entityNames.list();
        expect(result).toStrictEqual(listMock.entityNames);
    });

    it('Should create entity name', async () => {
        const body = { name: 'Test Entity', teamId: 1 };
        mockFetch('POST https://make.local/api/v2/entity-names', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.entityNames.create(body);
        expect(result).toStrictEqual(createMock.entityName);
    });

    it('Should get entity name by ID', async () => {
        mockFetch('GET https://make.local/api/v2/entity-names/1', getMock);

        const result = await make.entityNames.get(1);
        expect(result).toStrictEqual(getMock.entityName);
    });

    it('Should delete entity name by ID', async () => {
        mockFetch('DELETE https://make.local/api/v2/entity-names/1', getMock);

        const result = await make.entityNames.delete(1);
    });
});
```

#### Integration Tests (`test/{endpoint-name}.integration.test.ts`)

```typescript
import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: EntityNames', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let entityId: number;

    it('Should create an entity', async () => {
        const entity = await make.entityNames.create({
            name: `Test Entity ${Date.now()}`,
            teamId: MAKE_TEAM,
        });

        expect(entity).toBeDefined();
        expect(entity.id).toBeDefined();
        entityId = entity.id;
    });

    it('Should get the created entity', async () => {
        const entity = await make.entityNames.get(entityId);
        expect(entity.id).toBe(entityId);
    });

    it('Should list entities', async () => {
        const entities = await make.entityNames.list();
        expect(Array.isArray(entities)).toBe(true);
        expect(entities.some(e => e.id === entityId)).toBe(true);
    });
});
```

#### Mock Files (`test/mocks/{endpoint-name}/*.json`)

Create realistic mock data that matches the actual API responses:

```json
// test/mocks/entity-names/list.json
{
  "entityNames": [
    {
      "id": 1,
      "name": "Test Entity",
      "teamId": 1,
      "created": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pg": {
    "sortBy": "id",
    "sortDir": "asc",
    "offset": 0,
    "limit": 100
  }
}

// test/mocks/entity-names/get.json
{
  "entityName": {
    "id": 1,
    "name": "Test Entity",
    "teamId": 1,
    "created": "2024-01-01T00:00:00.000Z"
  }
}
```

## Naming Conventions

### Files and Classes

- **Endpoint files**: Use kebab-case (e.g., `data-stores.ts`, `incomplete-executions.ts`)
- **Class names**: Use PascalCase plural (e.g., `DataStores`, `IncompleteExecutions`)
- **Type names**: Use PascalCase singular for entities (e.g., `DataStore`, `IncompleteExecution`)

### Types

- **Main entity**: `EntityName` (singular, PascalCase)
- **Options types**: `ListEntityNamesOptions`, `GetEntityNameOptions`
- **Body types**: `CreateEntityNameBody`, `UpdateEntityNameBody`
- **Response types**: `ListEntityNamesResponse`, `GetEntityNameResponse` (internal, not exported)

### API Endpoints

- Follow REST conventions: `/entity-names`, `/entity-names/{id}`
- Use kebab-case for multi-word endpoints
- Use HTTP methods appropriately: GET (list/get), POST (create), PATCH (update), DELETE (delete)

## TypeScript Guidelines

### Type Safety

- Always use strict TypeScript types
- Leverage generic types for column selection: `<C extends keyof EntityName = never>`
- Use `PickColumns<T, K>` utility type for field selection (if supported by endpoint)
- Mark internal types as non-exported

### Documentation

- Every public type and method must have JSDoc comments
- Include parameter descriptions and return value information
- Document edge cases and error conditions
- Use `@internal` for methods not intended for public use

### Imports

- Always use `.js` extensions in imports (for ES module compatibility)
- Import only necessary types using `type` imports where possible
- Group imports: external packages, then internal modules

## Error Handling

- Use the `MakeError` class for API-specific errors
- Errors are automatically handled by the base `fetch` method
- Don't catch and re-throw errors unless adding context
- Let HTTP errors bubble up as `MakeError` instances

## Column Selection Pattern

Many endpoints support column selection to optimize responses:

```typescript
// Full object
const entity = await make.entities.get(1);

// Only specific fields
const entity = await make.entities.get(1, { cols: ['id', 'name'] });

// TypeScript correctly infers the return type
```

Implementation:

- Use generic type constraints: `<C extends keyof EntityName = never>`
- Apply `PickColumns<EntityName, C>` to return types
- Pass `cols` in query parameters

## Special Patterns

### Nested Resources

For endpoints that manage nested resources (e.g., data store records):

```typescript
export class DataStores {
    // Main CRUD operations...

    /**
     * Access to data store record operations
     */
    records(dataStoreId: number): DataStoreRecords {
        return new DataStoreRecords(this.#fetch, dataStoreId);
    }
}
```

### Optional Parameters

- Use optional properties with `?` for optional fields
- Use `Partial<T>` for update operations where all fields are optional
- Provide sensible defaults in implementation

### Pagination

- Always include pagination support for list operations
- Use the shared `Pagination<T>` type
- Default to reasonable limits (typically 100 items)

## Build and Development

### Scripts

- `npm run build` - Build the distribution files
- `npm test` - Run unit tests
- `npm run test:integration` - Run integration tests (requires `.env` setup)
- `npm run lint` - Run TypeScript and ESLint checks
- `npm run format` - Format code with Prettier

### Environment Setup

Integration tests require a `.env` file:

```
MAKE_API_KEY="your-api-key"
MAKE_ZONE="your-zone.make.com"
MAKE_TEAM="your-team-id"
MAKE_ORGANIZATION="your-org-id"
```

## Quality Checklist

Before completing any endpoint addition:

- [ ] Endpoint class follows the exact pattern
- [ ] All types are properly documented with JSDoc
- [ ] Core client integration is complete
- [ ] All public types are exported in `index.ts`
- [ ] Unit tests cover all public methods
- [ ] Integration tests cover basic CRUD operations
- [ ] Mock files contain realistic data
- [ ] TypeScript compilation passes without errors
- [ ] ESLint and Prettier checks pass
- [ ] Column selection is properly implemented
- [ ] Error handling follows the established pattern

## Common Mistakes to Avoid

1. **Forgetting .js extensions** in imports - Required for ES modules
2. **Not using generic types** for column selection
3. **Exporting internal response types** - Keep them internal
4. **Inconsistent naming** - Follow the established patterns exactly
5. **Missing JSDoc** - All public APIs must be documented
6. **Not testing column selection** - Essential feature that must work
7. **Hardcoding API versions** - Use the configurable version
8. **Not handling pagination** - Most list endpoints should support it
9. **Incorrect HTTP methods** - Follow REST conventions
10. **Missing integration with main client** - Must be accessible through `Make` class

## Advanced Patterns

### Custom Query Parameters

For endpoints with special filtering or search capabilities:

```typescript
export type ListEntityNamesOptions<C extends keyof EntityName = never> = {
    cols?: C[] | ['*'];
    pg?: Partial<Pagination<EntityName>>;
    /** Search entities by name */
    search?: string;
    /** Filter by team ID */
    teamId?: number;
    /** Filter by creation date */
    createdAfter?: string;
};
```

## MCP (Model Context Protocol) Integration

The Make TypeScript SDK supports MCP tool integration to provide AI agents with access to all SDK functionality. This section covers the patterns and conventions for creating MCP tool definitions.

### MCP File Structure

**File Location**: `src/endpoints/{endpoint-name}.mcp.ts` or `src/endpoints/sdk/{endpoint-name}.mcp.ts`

```typescript
import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';

export const tools = [
    {
        name: 'endpoint_action',
        title: 'Human Readable Title',
        description: 'Detailed description of what this tool does',
        category: 'endpoint.category',
        inputSchema: {
            type: 'object',
            properties: {
                // Parameter definitions
            },
            required: ['requiredParam1', 'requiredParam2'],
        },
        execute: async (make: Make, args: ParameterType) => {
            return await make.endpoint.method(args);
        },
    },
    // ... more tools
];
```

### Import Patterns

**Always use type imports** for MCP files since they only reference types:

```typescript
// ✅ Correct - Type imports only
import type { Make } from '../../make.js';
import type { JSONValue } from '../../types.js';

// ❌ Incorrect - Runtime imports not needed
import { Make } from '../../make.js';
import { JSONValue } from '../../types.js';
```

### Tool Definition Structure

Each tool must follow this exact structure:

```typescript
{
    name: string,           // Unique identifier following naming convention
    title: string,          // Human-readable title for display
    description: string,    // Detailed description of functionality
    category: string,       // Category for organization (endpoint.subCategory)
    inputSchema: object,    // JSON Schema defining input parameters
    execute: function,      // Async function that executes the SDK method
}
```

### Naming Conventions

#### Tool Names

Follow the pattern: `{endpoint}_{action}` or `sdk_{endpoint}_{action}`

```typescript
// Standard endpoints
'teams_list';
'teams_get';
'teams_create';

// SDK endpoints
'sdk_apps_list';
'sdk_apps_get_section';
'sdk_functions_set_code';
```

#### Categories

Use dot notation for hierarchical organization:

```typescript
// Standard endpoints
'teams';
'scenarios';
'data-stores';

// SDK endpoints
'sdk.apps';
'sdk.connections';
'sdk.functions';
```

### Input Schema Patterns

The input schema is defined as a JSON Schema and is derived from the endpoint’s type definitions.

```typescript
inputSchema: {
    type: 'object',
    properties: {
        id: { type: 'number', description: 'The unique identifier' },
        name: { type: 'string', description: 'The name of the entity' },
        active: { type: 'boolean', description: 'Whether the entity is active' },
    },
    required: ['id'],
}
```

### Execute Function Patterns

```typescript
// List
execute: async (make: Make, args: { teamId?: number }) => {
    return await make.scenarios.list(args.teamId);
};

// Get
execute: async (make: Make, args: { id: number }) => {
    return await make.scenarios.get(args.id);
};

// Create
execute: async (make: Make, args: CreateScenarioBody) => {
    return await make.scenarios.create(args);
};

// Update
execute: async (make: Make, args: { id: number } & UpdateScenarioBody) => {
    const { id, ...body } = args;
    return await make.scenarios.update(id, body);
};

// Delete
execute: async (make: Make, args: { id: number }) => {
    return await make.scenarios.delete(args.id);
};
```

### Type Safety

#### Generic Handling

For endpoints with complex generic types, simplify for MCP:

```typescript
// Instead of complex generics, use basic object types
body: { type: 'object', description: 'The section data to set' }
```

### Complete Example: SDK Functions

```typescript
import type { Make } from '../../make.js';

export const tools = [
    {
        name: 'sdk_functions_list',
        title: 'List SDK functions',
        description: 'List functions for the app',
        category: 'sdk.functions',
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
            },
            required: ['appName', 'appVersion'],
        },
        execute: async (make: Make, args: { appName: string; appVersion: number }) => {
            return await make.sdk.functions.list(args.appName, args.appVersion);
        },
    },
    {
        name: 'sdk_functions_set_code',
        title: 'Set SDK function code',
        description: 'Set/update function code',
        category: 'sdk.functions',
        inputSchema: {
            type: 'object',
            properties: {
                appName: { type: 'string', description: 'The name of the app' },
                appVersion: { type: 'number', description: 'The version of the app' },
                functionName: { type: 'string', description: 'The name of the function' },
                code: { type: 'string', description: 'The function code' },
            },
            required: ['appName', 'appVersion', 'functionName', 'code'],
        },
        execute: async (
            make: Make,
            args: {
                appName: string;
                appVersion: number;
                functionName: string;
                code: string;
            },
        ) => {
            return await make.sdk.functions.setCode(args.appName, args.appVersion, args.functionName, args.code);
        },
    },
];
```

### MCP Integration Checklist

Before completing MCP tool definitions:

- [ ] File uses `.mcp.ts` extension
- [ ] Uses `type` imports only (no runtime imports)
- [ ] All tools follow the exact naming convention
- [ ] Categories are properly hierarchical
- [ ] Input schemas accurately reflect SDK method signatures
- [ ] Required parameters are correctly marked
- [ ] Execute functions properly extract and pass parameters
- [ ] TypeScript types match the actual SDK method signatures
- [ ] Descriptions are clear and helpful
- [ ] All public SDK methods are covered

### Common MCP Mistakes to Avoid

1. **Using runtime imports** - Always use `type` imports only
2. **Incorrect parameter extraction** - Ensure body parameters are properly separated
3. **Missing required parameters** - Mark all truly required parameters in schema
4. **Inconsistent naming** - Follow the established `{endpoint}_{action}` pattern
5. **Wrong categories** - Use dot notation for proper hierarchical organization
6. **Missing descriptions** - Every parameter and tool needs clear documentation
7. **Type mismatches** - Ensure TypeScript types match actual SDK signatures
8. **Incomplete coverage** - All public methods should have corresponding MCP tools

This MCP integration ensures that AI agents can access the full Make SDK functionality through a standardized protocol interface while maintaining type safety and clear documentation.

This guide ensures consistent, maintainable, and well-tested extensions to the Make TypeScript SDK.
