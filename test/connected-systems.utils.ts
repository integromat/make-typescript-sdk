import type { OnPremAgentAppConfigInput } from '../src/endpoints/on-prem-agents.js';

export function parseInputs(raw: string | undefined, envName: string): Record<string, string> {
    if (!raw) {
        return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`${envName} must be a JSON object`);
    }
    return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [key, String(value)]),
    );
}

export function inputFieldNamesFromAppConfig(config: OnPremAgentAppConfigInput[]): {
    required: string[];
    all: string[];
} {
    const spec = config.find(input => input.name === 'inputs')?.spec ?? [];

    return {
        required: spec.filter(field => field.required).map(field => field.name),
        all: spec.map(field => field.name),
    };
}

export function assertInputsMatchAppConfig(
    config: OnPremAgentAppConfigInput[],
    inputs: Record<string, string>,
    envName: string,
    appName: string,
): void {
    const { required, all } = inputFieldNamesFromAppConfig(config);
    const provided = Object.keys(inputs);
    const missing = required.filter(name => !provided.includes(name));
    const unknown = provided.filter(name => !all.includes(name));

    if (missing.length > 0 || unknown.length > 0) {
        const parts: string[] = [`${envName} does not match getAppConfig for ${appName} on this agent.`];
        if (missing.length > 0) {
            parts.push(`Missing required keys: ${missing.join(', ')}.`);
        }
        if (unknown.length > 0) {
            parts.push(`Unknown keys (not in form spec): ${unknown.join(', ')}.`);
        }
        parts.push(`Expected field names: ${all.join(', ') || '(none)'}.`);
        throw new Error(parts.join(' '));
    }
}
