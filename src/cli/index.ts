import { Command, Option } from 'commander';
import { MakeMCPTools } from '../mcp.js';
import { VERSION } from '../version.js';
import { buildCommands } from './commands.js';

export function run(argv: string[]): void {
    const program = new Command();

    program
        .name('make-cli')
        .description('Make CLI - Interact with the Make automation platform')
        .version(VERSION)
        .option('--api-key <key>', 'Make API key (or set MAKE_API_KEY)')
        .option('--zone <zone>', 'Make zone, e.g. eu1.make.com (or set MAKE_ZONE)')
        .addOption(new Option('--output <format>', 'Output format').choices(['json', 'compact', 'table']).default('json'));

    buildCommands(program, MakeMCPTools);

    program.parseAsync(argv).catch((err) => {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
    });
}
