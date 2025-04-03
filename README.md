# Make TypeScript SDK

A TypeScript SDK for interacting with the Make API. This SDK provides a type-safe way to interact with Make's API endpoints for managing scenarios, teams, data stores, and more.

## Project Structure

```
make-sdk/
├── src/                       # Source code
│   ├── endpoints/             # API endpoint implementations
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

## Installation

```bash
npm install @makehq/sdk
```

## Basic Usage

```typescript
import { Make } from '@makehq/sdk';

// Initialize the Make client
const make = new Make('your-api-key', 'eu2.make.com');

// Example: Get user information
const user = await make.users.me();

// Example: List scenarios
const scenarios = await make.scenarios.list(/* Team ID */);

// Example: Work with data stores
const dataStore = await make.dataStores.get(/* DataStore ID */);
```

## Features

- Full TypeScript support with type definitions
- Support for majority of Make API endpoints
- Built-in error handling and response typing
- Comprehensive test coverage

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
