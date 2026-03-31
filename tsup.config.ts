import { defineConfig } from 'tsup';

export default defineConfig([
    {
        entryPoints: ['src/index.ts', 'src/mcp.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        outDir: 'dist',
        clean: true,
    },
    {
        entryPoints: ['src/cli.ts'],
        format: ['esm'],
        dts: false,
        outDir: 'dist',
        clean: false,
        banner: {
            js: '#!/usr/bin/env node\n',
        },
    },
]);
