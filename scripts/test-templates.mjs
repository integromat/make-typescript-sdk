#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

import { Make } from '../dist/index.js';

if (!process.env.MAKE_API_KEY) {
    console.error('Please provide MAKE_API_KEY environment variable.');
    process.exit(1);
}
if (!process.env.MAKE_ZONE) {
    console.error('Please provide MAKE_ZONE environment variable.');
    process.exit(1);
}

const searchTerm = process.argv[2] || 'webhook';

const make = new Make(process.env.MAKE_API_KEY, process.env.MAKE_ZONE);

console.log(`\n=== Searching public templates for "${searchTerm}" ===\n`);
const templates = await make.templates.listPublic({ name: searchTerm });

console.log(`Found ${templates.length} template(s):`);
templates.slice(0, 5).forEach(t => {
    console.log(`  [${t.id}] ${t.name} — apps: ${t.usedApps.join(', ')} — usage: ${t.usage}`);
});

if (templates.length === 0) {
    console.log('No templates found. Try a different search term.');
    process.exit(0);
}

const first = templates[0];
console.log(`\n=== Fetching blueprint for template [${first.id}] "${first.name}" (url: ${first.url}) ===\n`);
const blueprint = await make.templates.getPublicBlueprint(first.url);

console.log('Language:', blueprint.language);
console.log('Scheduling:', JSON.stringify(blueprint.scheduling));
console.log('Controller name:', blueprint.controller?.name);
console.log('Blueprint flow (modules):');
const flow = blueprint.blueprint?.flow || [];
flow.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step.module} (id ${step.id})`);
});
console.log(`\nFull blueprint size: ${JSON.stringify(blueprint).length} bytes`);
