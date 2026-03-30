import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { Command } from 'commander';
import { deriveActionName, camelToKebab, coerceValue, buildCommands } from '../../src/cli/commands.js';
import { resolveAuth } from '../../src/cli/auth.js';
import { formatOutput } from '../../src/cli/output.js';
import type { MakeMCPTool } from '../../src/mcp.js';

describe('CLI: deriveActionName', () => {
    it('should derive simple action names', () => {
        expect(deriveActionName('scenarios_list', 'scenarios')).toBe('list');
        expect(deriveActionName('scenarios_get', 'scenarios')).toBe('get');
        expect(deriveActionName('scenarios_create', 'scenarios')).toBe('create');
        expect(deriveActionName('scenarios_delete', 'scenarios')).toBe('delete');
    });

    it('should derive multi-word action names', () => {
        expect(deriveActionName('scenarios_set-interface', 'scenarios')).toBe('set-interface');
        expect(deriveActionName('executions_get-detail', 'executions')).toBe('get-detail');
        expect(deriveActionName('executions_list-for-incomp-exec', 'executions')).toBe('list-for-incomp-exec');
    });

    it('should handle hyphenated categories', () => {
        expect(deriveActionName('data-stores_list', 'data-stores')).toBe('list');
        expect(deriveActionName('data-stores_get', 'data-stores')).toBe('get');
        expect(deriveActionName('data-store-records_list', 'data-store-records')).toBe('list');
        expect(deriveActionName('data-structures_create', 'data-structures')).toBe('create');
        expect(deriveActionName('incomplete-executions_list', 'incomplete-executions')).toBe('list');
    });

    it('should handle SDK dot-separated categories', () => {
        expect(deriveActionName('sdk-apps_list', 'sdk.apps')).toBe('list');
        expect(deriveActionName('sdk-apps_get', 'sdk.apps')).toBe('get');
        expect(deriveActionName('sdk-apps_get-section', 'sdk.apps')).toBe('get-section');
        expect(deriveActionName('sdk-apps_set-section', 'sdk.apps')).toBe('set-section');
        expect(deriveActionName('sdk-modules_list', 'sdk.modules')).toBe('list');
        expect(deriveActionName('sdk-rpcs_test', 'sdk.rpcs')).toBe('test');
        expect(deriveActionName('sdk-functions_get-code', 'sdk.functions')).toBe('get-code');
    });

    it('should handle credential-requests category', () => {
        expect(deriveActionName('credential-requests_list', 'credential-requests')).toBe('list');
        expect(deriveActionName('credential-requests_get', 'credential-requests')).toBe('get');
        expect(deriveActionName('credential-requests_delete', 'credential-requests')).toBe('delete');
        expect(deriveActionName('credential-requests_create', 'credential-requests')).toBe('create');
    });
});

describe('CLI: camelToKebab', () => {
    it('should convert camelCase to kebab-case', () => {
        expect(camelToKebab('teamId')).toBe('team-id');
        expect(camelToKebab('scenarioId')).toBe('scenario-id');
        expect(camelToKebab('dataStoreId')).toBe('data-store-id');
        expect(camelToKebab('makeProviderId')).toBe('make-provider-id');
    });

    it('should handle single words', () => {
        expect(camelToKebab('name')).toBe('name');
        expect(camelToKebab('status')).toBe('status');
    });
});

describe('CLI: coerceValue', () => {
    it('should coerce number values', () => {
        expect(coerceValue('123', { type: 'number' })).toBe(123);
        expect(coerceValue('3.14', { type: 'number' })).toBe(3.14);
    });

    it('should throw on invalid number', () => {
        expect(() => coerceValue('abc', { type: 'number' })).toThrow('Expected a number, got: abc');
    });

    it('should coerce boolean values', () => {
        expect(coerceValue('true', { type: 'boolean' })).toBe(true);
        expect(coerceValue('1', { type: 'boolean' })).toBe(true);
        expect(coerceValue('false', { type: 'boolean' })).toBe(false);
    });

    it('should coerce object values from JSON', () => {
        expect(coerceValue('{"key":"value"}', { type: 'object' })).toEqual({ key: 'value' });
    });

    it('should throw on invalid object JSON', () => {
        expect(() => coerceValue('{bad json}', { type: 'object' })).toThrow('Expected valid JSON, got: {bad json}');
    });

    it('should coerce array values from JSON', () => {
        expect(coerceValue('[1,2,3]', { type: 'array' })).toEqual([1, 2, 3]);
    });

    it('should throw on invalid array JSON', () => {
        expect(() => coerceValue('not-an-array', { type: 'array' })).toThrow('Expected valid JSON, got: not-an-array');
    });

    it('should pass through string values', () => {
        expect(coerceValue('hello', { type: 'string' })).toBe('hello');
    });

    it('should handle array type fields (e.g., ["string", "number"])', () => {
        // When type is an array, use the first element
        expect(coerceValue('hello', { type: ['string', 'number'] as unknown as 'string' })).toBe('hello');
    });
});

describe('CLI: resolveAuth', () => {
    beforeEach(() => {
        delete process.env.MAKE_API_KEY;
        delete process.env.MAKE_ZONE;
    });

    afterEach(() => {
        delete process.env.MAKE_API_KEY;
        delete process.env.MAKE_ZONE;
    });

    it('should resolve from flags', () => {
        const result = resolveAuth({ apiKey: 'test-key', zone: 'eu1.make.com' });
        expect(result).toEqual({ token: 'test-key', zone: 'eu1.make.com' });
    });

    it('should resolve from environment variables', () => {
        process.env.MAKE_API_KEY = 'env-key';
        process.env.MAKE_ZONE = 'eu2.make.com';
        const result = resolveAuth({});
        expect(result).toEqual({ token: 'env-key', zone: 'eu2.make.com' });
    });

    it('should prefer flags over env vars', () => {
        process.env.MAKE_API_KEY = 'env-key';
        process.env.MAKE_ZONE = 'eu2.make.com';
        const result = resolveAuth({ apiKey: 'flag-key', zone: 'eu1.make.com' });
        expect(result).toEqual({ token: 'flag-key', zone: 'eu1.make.com' });
    });

    it('should throw when API key is missing', () => {
        expect(() => resolveAuth({})).toThrow('API key is required');
    });

    it('should throw when zone is missing', () => {
        process.env.MAKE_API_KEY = 'test-key';
        expect(() => resolveAuth({})).toThrow('Zone is required');
    });
});

describe('CLI: buildCommands', () => {
    const makeTool = (overrides: Partial<MakeMCPTool> = {}): MakeMCPTool => ({
        name: 'scenarios_list',
        title: 'List scenarios',
        description: 'List all scenarios',
        category: 'scenarios',
        inputSchema: { type: 'object', properties: {}, required: [] },
        execute: async () => [],
        ...overrides,
    });

    it('should create a category subcommand for each tool', () => {
        const program = new Command();
        buildCommands(program, [makeTool()]);

        const cat = program.commands.find((c) => c.name() === 'scenarios');
        expect(cat).toBeDefined();
        expect(cat?.commands.find((c) => c.name() === 'list')).toBeDefined();
    });

    it('should set command description from tool description', () => {
        const program = new Command();
        buildCommands(program, [makeTool({ description: 'Fetch all scenarios' })]);

        const cmd = program.commands.find((c) => c.name() === 'scenarios')?.commands.find((c) => c.name() === 'list');
        expect(cmd?.description()).toBe('Fetch all scenarios');
    });

    it('should use category name for category command description', () => {
        const program = new Command();
        buildCommands(program, [makeTool()]);

        const cat = program.commands.find((c) => c.name() === 'scenarios');
        expect(cat?.description()).toBe('scenarios commands');
    });

    it('should nest sdk tools under sdk/<subcategory>', () => {
        const program = new Command();
        buildCommands(program, [
            makeTool({ name: 'sdk-apps_list', title: 'List apps', description: 'List apps', category: 'sdk.apps' }),
        ]);

        const sdk = program.commands.find((c) => c.name() === 'sdk');
        expect(sdk).toBeDefined();
        const apps = sdk?.commands.find((c) => c.name() === 'apps');
        expect(apps).toBeDefined();
        expect(apps?.commands.find((c) => c.name() === 'list')).toBeDefined();
    });

    it('should register required options with <value> syntax', () => {
        const program = new Command();
        buildCommands(program, [
            makeTool({
                inputSchema: {
                    type: 'object',
                    properties: { teamId: { type: 'number', description: 'Team ID' } },
                    required: ['teamId'],
                },
            }),
        ]);

        const opt = program.commands
            .find((c) => c.name() === 'scenarios')
            ?.commands.find((c) => c.name() === 'list')
            ?.options.find((o) => o.long === '--team-id');
        expect(opt).toBeDefined();
        expect(opt?.required).toBe(true);
    });

    it('should register optional options with [value] syntax', () => {
        const program = new Command();
        buildCommands(program, [
            makeTool({
                inputSchema: {
                    type: 'object',
                    properties: { name: { type: 'string', description: 'Name filter' } },
                    required: [],
                },
            }),
        ]);

        const opt = program.commands
            .find((c) => c.name() === 'scenarios')
            ?.commands.find((c) => c.name() === 'list')
            ?.options.find((o) => o.long === '--name');
        expect(opt).toBeDefined();
        expect(opt?.required).toBe(false);
    });

    it('should register optional boolean as bare flag', () => {
        const program = new Command();
        buildCommands(program, [
            makeTool({
                inputSchema: {
                    type: 'object',
                    properties: { active: { type: 'boolean', description: 'Active flag' } },
                    required: [],
                },
            }),
        ]);

        const opt = program.commands
            .find((c) => c.name() === 'scenarios')
            ?.commands.find((c) => c.name() === 'list')
            ?.options.find((o) => o.long === '--active');
        expect(opt).toBeDefined();
        // bare boolean flag: not required, no optional argument
        expect(opt?.required).toBe(false);
        expect(opt?.optional).toBe(false);
    });

    it('should share a single category command across multiple tools', () => {
        const program = new Command();
        buildCommands(program, [
            makeTool({ name: 'scenarios_list', description: 'List scenarios' }),
            makeTool({ name: 'scenarios_get', description: 'Get scenario' }),
        ]);

        const scenarioCmds = program.commands.filter((c) => c.name() === 'scenarios');
        expect(scenarioCmds).toHaveLength(1);
        expect(scenarioCmds[0]?.commands).toHaveLength(2);
    });
});

describe('CLI: formatOutput', () => {
    it('should pretty-print JSON by default', () => {
        const data = { key: 'value', num: 42 };
        expect(formatOutput(data, 'json')).toBe(JSON.stringify(data, null, 2));
    });

    it('should output compact JSON', () => {
        const data = { key: 'value', num: 42 };
        expect(formatOutput(data, 'compact')).toBe(JSON.stringify(data));
    });

    it('should pass through strings', () => {
        expect(formatOutput('hello world', 'json')).toBe('hello world');
    });

    it('should render table with header and rows', () => {
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];
        const out = formatOutput(data, 'table');
        expect(out).toMatch(/id.*name/);
        expect(out).toMatch(/Alice/);
        expect(out).toMatch(/Bob/);
    });

    it('should truncate values exceeding max column width', () => {
        const longValue = 'x'.repeat(100);
        const out = formatOutput([{ field: longValue }], 'table');
        expect(out).not.toContain(longValue);
        expect(out).toContain('…');
    });

    it('should return (empty) for empty arrays', () => {
        expect(formatOutput([], 'table')).toBe('(empty)');
    });
});
