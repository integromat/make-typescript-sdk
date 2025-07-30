import { describe, expect, it } from '@jest/globals';
import { MakeMCPTools } from '../src/mcp.js';

describe('MCP Tools', () => {
    it('Should export MakeMCPTools array', () => {
        expect(MakeMCPTools).toBeDefined();
        expect(Array.isArray(MakeMCPTools)).toBe(true);
        expect(MakeMCPTools.length).toBeGreaterThan(0);
    });

    it('Should have a reasonable number of tools', () => {
        // With all the endpoints, we should have a significant number of tools
        expect(MakeMCPTools.length).toBeGreaterThan(50);
        expect(MakeMCPTools.length).toBeLessThan(500); // Sanity check
    });

    it('Should have tools with required properties', () => {
        MakeMCPTools.forEach(tool => {
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

            // Scope is optional, but if present should be a string
            if (tool.scope !== undefined) {
                expect(typeof tool.scope).toBe('string');
                expect(tool.scope.length).toBeGreaterThan(0);
            }
        });
    });

    it('Should have unique tool names', () => {
        const names = MakeMCPTools.map(tool => tool.name);
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

            fail(`Duplicate tool names found: ${duplicates.join(', ')}`);
        }
    });

    it('Should have tools from SDK endpoints', () => {
        const sdkTools = MakeMCPTools.filter(tool => tool.category.startsWith('sdk.'));
        expect(sdkTools.length).toBeGreaterThan(0);

        // Check for expected SDK categories
        const sdkCategories = [...new Set(sdkTools.map(tool => tool.category))];
        expect(sdkCategories).toContain('sdk.apps');
        expect(sdkCategories).toContain('sdk.connections');
        expect(sdkCategories).toContain('sdk.functions');
        expect(sdkCategories).toContain('sdk.modules');
        expect(sdkCategories).toContain('sdk.rpcs');
        expect(sdkCategories).toContain('sdk.webhooks');
    });

    it('Should have tools from core endpoints', () => {
        const coreTools = MakeMCPTools.filter(tool => !tool.category.startsWith('sdk.'));
        expect(coreTools.length).toBeGreaterThan(0);

        // Check for some expected core categories
        const coreCategories = [...new Set(coreTools.map(tool => tool.category))];
        expect(coreCategories).toContain('scenarios');
        expect(coreCategories).toContain('connections');
        expect(coreCategories).toContain('teams');
        expect(coreCategories).toContain('data-stores');
    });

    it('Should have proper naming conventions', () => {
        MakeMCPTools.forEach(tool => {
            // Tool names should follow the pattern: {endpoint}_{action} or sdk_{endpoint}_{action}
            const namePattern = /^(sdk_)?[a-z_-]+_[a-z_-]+$/;
            expect(tool.name).toMatch(namePattern);

            // Categories should use dot notation for hierarchy
            const categoryPattern = /^[a-z][a-z.-]*[a-z]$/;
            expect(tool.category).toMatch(categoryPattern);

            // SDK categories should start with "sdk."
            if (tool.name.startsWith('sdk_')) {
                expect(tool.category).toMatch(/^sdk\./);
            }
        });
    });

    it('Should have valid scope patterns when scope is defined', () => {
        const toolsWithScope = MakeMCPTools.filter(tool => tool.scope !== undefined);
        expect(toolsWithScope.length).toBeGreaterThan(0);

        toolsWithScope.forEach(tool => {
            // Scopes should follow the pattern: {resource}:{permission}
            const scopePattern = /^[a-z-]+:(read|write)$/;
            expect(tool.scope).toMatch(scopePattern);
        });
    });

    it('Should have consistent execute function signatures', () => {
        MakeMCPTools.forEach(tool => {
            // Execute function should take Make instance as first parameter
            expect(tool.execute.length).toBeGreaterThanOrEqual(1);
            expect(tool.execute.length).toBeLessThanOrEqual(2);

            // Function should be async
            expect(tool.execute.constructor.name).toBe('AsyncFunction');
        });
    });
});
