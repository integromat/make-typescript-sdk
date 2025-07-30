#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: `${import.meta.dirname}/../.env` });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Make } from '../dist/index.js';
import { MakeMCPTools } from '../dist/mcp.js';

const server = new Server(
    {
        name: 'Make',
        version: '0.1.0',
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

if (!process.env.MAKE_API_KEY) {
    console.error('Please provide MAKE_API_KEY environment variable.');
    process.exit(1);
}
if (!process.env.MAKE_ZONE) {
    console.error('Please provide MAKE_ZONE environment variable.');
    process.exit(1);
}

const make = new Make(process.env.MAKE_API_KEY, process.env.MAKE_ZONE);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: MakeMCPTools.map(tool => {
            return {
                name: tool.name,
                title: tool.title,
                description: tool.description,
                inputSchema: tool.inputSchema,
            };
        }),
    };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
    const tool = MakeMCPTools.find(tool => tool.name === request.params.name);
    if (!tool) {
        throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const result = await tool.execute(make, request.params.arguments);
    return {
        content: [
            {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
        ],
    };
});

const transport = new StdioServerTransport();
await server.connect(transport);
