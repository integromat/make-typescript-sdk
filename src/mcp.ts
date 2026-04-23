import { MakeTools, type MakeTool } from './tools.js';

export type { JSONSchema } from './tools.js';

/**
 * Interface for MCP (Model Context Protocol) tools.
 *
 * @deprecated Use `MakeTool` from `@makehq/sdk/tools` instead. `MakeTool` is the
 * canonical, harness-agnostic shape used by both the MCP server and the Make
 * CLI. This alias is kept for backward compatibility.
 */
export type MakeMCPTool = MakeTool;

/**
 * Aggregated list of tools exposed to MCP consumers.
 *
 * @deprecated Use `MakeTools` from `@makehq/sdk/tools` instead. The underlying
 * definitions are identical; this alias is kept for backward compatibility.
 */
export const MakeMCPTools: MakeTool[] = MakeTools;
