import type { Command } from 'commander';
import type { MakeMCPTool, JSONSchema } from '../mcp.js';
import type { JSONValue } from '../types.js';
import { Make } from '../make.js';
import { MakeError } from '../utils.js';
import { resolveAuth } from './auth.js';
import { formatOutput, type OutputFormat } from './output.js';

/**
 * Derives the CLI action name from an MCP tool name and its category.
 *
 * Tool names follow the pattern `{category}_{action}` where dots in the category
 * are replaced with hyphens (e.g., 'sdk.apps' → 'sdk-apps').
 *
 * Examples:
 *   ('scenarios_list', 'scenarios') → 'list'
 *   ('data-stores_list', 'data-stores') → 'list'
 *   ('sdk-apps_get-section', 'sdk.apps') → 'get-section'
 *   ('credential-requests_list', 'credential-requests') → 'list'
 */
export function deriveActionName(toolName: string, category: string): string {
    const prefix = category.replace(/\./g, '-') + '_';
    return toolName.slice(prefix.length).replace(/_/g, '-');
}

/**
 * Converts a camelCase string to kebab-case.
 */
export function camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Converts a kebab-case string to camelCase.
 */
function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Coerces a CLI string value to the type specified by the JSON Schema.
 */
export function coerceValue(value: string, schema: JSONSchema): JSONValue {
    const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

    switch (type) {
        case 'number': {
            const num = Number(value);
            if (isNaN(num)) throw new Error(`Expected a number, got: ${value}`);
            return num;
        }
        case 'boolean':
            return value === 'true' || value === '1';
        case 'object':
        case 'array':
            try {
                return JSON.parse(value) as JSONValue;
            } catch {
                throw new Error(`Expected valid JSON, got: ${value}`);
            }
        default:
            return value;
    }
}

/**
 * Gets or creates a subcommand on a parent command.
 */
function getOrCreateSubcommand(parent: Command, name: string, description: string): Command {
    const existing = parent.commands.find((cmd) => cmd.name() === name);
    if (existing) return existing;
    return parent.command(name).description(description);
}

/**
 * Registers an MCP tool as a CLI command on a parent Commander command.
 */
function registerToolAsCommand(parent: Command, tool: MakeMCPTool, category: string): void {
    const actionName = deriveActionName(tool.name, category);
    const cmd = parent.command(actionName).description(tool.description);

    const properties = tool.inputSchema.properties ?? {};
    const required = new Set(tool.inputSchema.required ?? []);

    for (const [propName, schema] of Object.entries(properties)) {
        const flagName = camelToKebab(propName);
        const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
        const isRequired = required.has(propName);

        const isBooleanFlag = type === 'boolean' && !isRequired;
        const flag = isRequired ? `--${flagName} <value>` : isBooleanFlag ? `--${flagName}` : `--${flagName} [value]`;

        const option = cmd.createOption(flag, schema.description ?? '');

        if (isRequired) {
            option.makeOptionMandatory(true);
        }
        if (schema.enum) {
            option.choices(schema.enum.map(String));
        }

        if (schema.default !== undefined) {
            option.default(schema.default);
        }

        cmd.addOption(option);
    }

    cmd.action(async (localOptions: Record<string, string>) => {
        const globalOptions = cmd.optsWithGlobals();
        const { token, zone } = resolveAuth({
            apiKey: globalOptions.apiKey,
            zone: globalOptions.zone,
        });

        const make = new Make(token, zone);
        const args: Record<string, JSONValue> = {};

        for (const [key, value] of Object.entries(localOptions)) {
            if (value === undefined) continue;
            const camelKey = kebabToCamel(key);
            const schema = properties[camelKey];
            if (schema) {
                args[camelKey] = coerceValue(String(value), schema);
            } else {
                args[camelKey] = value;
            }
        }

        try {
            const result = await tool.execute(make, args);
            const format = (globalOptions.output as OutputFormat) ?? 'json';
            process.stdout.write(formatOutput(result, format) + '\n');
        } catch (error) {
            if (error instanceof MakeError) {
                process.stderr.write(`Error [${error.statusCode}]: ${error.message}\n`);
                process.exit(2);
            } else if (error instanceof Error) {
                process.stderr.write(`Error: ${error.message}\n`);
                process.exit(1);
            }
        }
    });
}

/**
 * Builds all CLI commands from MCP tool definitions.
 * Groups tools by category and creates nested subcommands.
 */
export function buildCommands(program: Command, tools: MakeMCPTool[]): void {
    const categories = new Map<string, MakeMCPTool[]>();

    for (const tool of tools) {
        const group = categories.get(tool.category) ?? [];
        group.push(tool);
        categories.set(tool.category, group);
    }

    for (const [category, categoryTools] of categories) {
        if (category.startsWith('sdk.')) {
            const sdkCommand = getOrCreateSubcommand(program, 'sdk', 'Custom app development commands');
            const subcategory = category.slice(4);
            const subCommand = getOrCreateSubcommand(sdkCommand, subcategory, `SDK ${subcategory} commands`);
            for (const tool of categoryTools) {
                registerToolAsCommand(subCommand, tool, category);
            }
        } else {
            const categoryCommand = getOrCreateSubcommand(program, category, `${category} commands`);
            for (const tool of categoryTools) {
                registerToolAsCommand(categoryCommand, tool, category);
            }
        }
    }
}
