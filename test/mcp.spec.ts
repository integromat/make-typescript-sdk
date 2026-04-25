import { describe, expect, it } from '@jest/globals';
import { MakeTools } from '../src/tools.js';

describe('MCP Tools', () => {
    it('Should export MakeTools array', () => {
        expect(MakeTools).toBeDefined();
        expect(Array.isArray(MakeTools)).toBe(true);
        expect(MakeTools.length).toBeGreaterThan(0);
    });

    it('Should have a reasonable number of tools', () => {
        // With all the endpoints, we should have a significant number of tools
        expect(MakeTools.length).toBeGreaterThan(50);
        expect(MakeTools.length).toBeLessThan(500); // Sanity check
    });

    it('Should have tools with required properties', () => {
        MakeTools.forEach(tool => {
            // Test required properties exist
            expect(tool).toHaveProperty('name');
            expect(tool).toHaveProperty('title');
            expect(tool).toHaveProperty('description');
            expect(tool).toHaveProperty('category');
            expect(tool).toHaveProperty('inputSchema');
            expect(tool).toHaveProperty('execute');

            // Test property types
            expect(typeof tool.name).toBe('string');
            expect(typeof tool.title).toBe('string');
            expect(typeof tool.description).toBe('string');
            expect(typeof tool.category).toBe('string');
            expect(typeof tool.inputSchema).toBe('object');
            expect(typeof tool.execute).toBe('function');

            // Test that required string properties are not empty
            expect(tool.name.length).toBeGreaterThan(0);
            expect(tool.title.length).toBeGreaterThan(0);
            expect(tool.description.length).toBeGreaterThan(0);
            expect(tool.category.length).toBeGreaterThan(0);
        });

        // Scope is optional, but if present should be a non-empty string
        MakeTools.filter(tool => tool.scope !== undefined).forEach(tool => {
            expect(typeof tool.scope).toBe('string');
            expect(tool.scope!.length).toBeGreaterThan(0);
        });
    });

    it('Should have unique tool names', () => {
        const names = MakeTools.map(tool => tool.name);
        const uniqueNames = new Set(names);

        expect(uniqueNames.size).toBe(names.length);

        // If there are duplicates, find and report them
        if (uniqueNames.size !== names.length) {
            const duplicates: string[] = [];
            const seen = new Set<string>();

            names.forEach(name => {
                if (seen.has(name) && !duplicates.includes(name)) {
                    duplicates.push(name);
                }
                seen.add(name);
            });

            throw new Error(`Duplicate tool names found: ${duplicates.join(', ')}`);
        }
    });

    it('Should have tools from SDK endpoints', () => {
        const sdkTools = MakeTools.filter(tool => tool.category.startsWith('sdk-'));
        expect(sdkTools.length).toBeGreaterThan(0);

        // Check for expected SDK categories
        const sdkCategories = [...new Set(sdkTools.map(tool => tool.category))];
        expect(sdkCategories).toContain('sdk-apps');
        expect(sdkCategories).toContain('sdk-connections');
        expect(sdkCategories).toContain('sdk-functions');
        expect(sdkCategories).toContain('sdk-modules');
        expect(sdkCategories).toContain('sdk-rpcs');
        expect(sdkCategories).toContain('sdk-webhooks');
    });

    it('Should have tools from core endpoints', () => {
        const coreTools = MakeTools.filter(tool => !tool.category.startsWith('sdk-'));
        expect(coreTools.length).toBeGreaterThan(0);

        // Check for some expected core categories
        const coreCategories = [...new Set(coreTools.map(tool => tool.category))];
        expect(coreCategories).toContain('scenarios');
        expect(coreCategories).toContain('connections');
        expect(coreCategories).toContain('teams');
        expect(coreCategories).toContain('data-stores');
    });

    it('Should have proper naming conventions', () => {
        MakeTools.forEach(tool => {
            // Tool names should follow the pattern: {endpoint}_{action} or sdk_{endpoint}_{action}
            const namePattern = /^(sdk_)?[a-z_-]+_[a-z_-]+$/;
            expect(tool.name).toMatch(namePattern);

            // Categories should use dot notation for hierarchy
            const categoryPattern = /^[a-z][a-z.-]*[a-z]$/;
            expect(tool.category).toMatch(categoryPattern);
        });

        // SDK categories should start with "sdk."
        MakeTools.filter(tool => tool.name.startsWith('sdk_')).forEach(tool => {
            expect(tool.category).toMatch(/^sdk\./);
        });
    });

    it('Should have valid scope patterns when scope is defined', () => {
        const toolsWithScope = MakeTools.filter(tool => tool.scope !== undefined);
        expect(toolsWithScope.length).toBeGreaterThan(0);

        toolsWithScope.forEach(tool => {
            // Scopes should follow the pattern: {resource}:{permission}
            const scopePattern = /^[a-z-]+:(read|write|run|use)$/;
            expect(tool.scope).toMatch(scopePattern);
        });
    });

    it('Should have consistent execute function signatures', () => {
        MakeTools.forEach(tool => {
            // Execute function should take Make instance as first parameter
            expect(tool.execute.length).toBeGreaterThanOrEqual(1);
            expect(tool.execute.length).toBeLessThanOrEqual(2);

            // Function should be async
            expect(tool.execute.constructor.name).toBe('AsyncFunction');
        });
    });

    it('Should have resourceId pointing to an existing inputSchema property when set', () => {
        const toolsWithResourceId = MakeTools.filter(tool => tool.resourceId !== undefined);
        expect(toolsWithResourceId.length).toBeGreaterThan(0);

        toolsWithResourceId.forEach(tool => {
            expect(typeof tool.resourceId).toBe('string');
            expect(tool.resourceId!.length).toBeGreaterThan(0);

            const properties = tool.inputSchema.properties ?? {};
            expect(properties).toHaveProperty(tool.resourceId!);
        });
    });

    it('Should have scopeId pointing to an existing inputSchema property when set', () => {
        const toolsWithScopeId = MakeTools.filter(tool => tool.scopeId !== undefined);
        expect(toolsWithScopeId.length).toBeGreaterThan(0);

        toolsWithScopeId.forEach(tool => {
            expect(typeof tool.scopeId).toBe('string');
            expect(tool.scopeId!.length).toBeGreaterThan(0);

            const properties = tool.inputSchema.properties ?? {};
            expect(properties).toHaveProperty(tool.scopeId!);
        });
    });

    it('Should mirror scopeId and the deprecated identifier alias on every tool', () => {
        MakeTools.forEach(tool => {
            // Backward-compatibility invariant: when both are set they MUST agree;
            // tools that set one MUST set the other (undefined counts as "set to undefined").
            expect(tool.scopeId).toBe(tool.identifier);
        });
    });

    it('Should have scopeId/resourceId set for key single-resource actions', () => {
        const getByName = (name: string) => MakeTools.find(tool => tool.name === name);

        const executionsGet = getByName('executions_get');
        expect(executionsGet).toBeDefined();
        expect(executionsGet?.scopeId).toBe('scenarioId');
        expect(executionsGet?.identifier).toBe('scenarioId');
        expect(executionsGet?.resourceId).toBe('executionId');

        const executionsGetDetail = getByName('executions_get-detail');
        expect(executionsGetDetail).toBeDefined();
        expect(executionsGetDetail?.scopeId).toBe('scenarioId');
        expect(executionsGetDetail?.identifier).toBe('scenarioId');
        expect(executionsGetDetail?.resourceId).toBe('executionId');

        const credentialRequestsGet = getByName('credential-requests_get');
        expect(credentialRequestsGet).toBeDefined();
        expect(credentialRequestsGet?.scopeId).toBe('requestId');
        expect(credentialRequestsGet?.resourceId).toBe('requestId');
    });

    it('Should leave resourceId undefined for collection-level and composite-key tools', () => {
        const collectionSuffixes = ['_list', '_create'];
        const collectionTools = MakeTools.filter(tool => collectionSuffixes.some(suffix => tool.name.endsWith(suffix)));
        expect(collectionTools.length).toBeGreaterThan(0);

        collectionTools.forEach(tool => {
            expect(tool.resourceId).toBeUndefined();
        });

        // sdk-* tools are keyed by composite names (app name + version, etc.)
        // and should not declare a single primary resourceId.
        const sdkTools = MakeTools.filter(tool => tool.category.startsWith('sdk-'));
        expect(sdkTools.length).toBeGreaterThan(0);
        sdkTools.forEach(tool => {
            expect(tool.resourceId).toBeUndefined();
        });
    });
});
