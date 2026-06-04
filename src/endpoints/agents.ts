import type { FetchFunction } from '../types.js';

/**
 * Status of an on-prem bridge agent.
 */
export type AgentStatus = 'ACTIVE' | 'STOPPED' | 'NOT_RESPONDING' | 'REGISTERED';

/**
 * Represents a Make on-prem bridge agent (not Make AI `/v1/agents`).
 */
export type Agent = {
    /** Unique identifier of the agent */
    id: string;
    /** Tenant identifier in the agency service */
    tenantId: string;
    /** User-defined name of the agent */
    name: string;
    /** Client secret for agent authentication (sensitive; may only be shown at creation) */
    clientSecret?: string;
    /** Current operational status */
    status: AgentStatus;
    /** Whether the agent has been alerted */
    alerted: boolean;
    /** Whether the agent is currently connected */
    connected: boolean;
    /** Installed agent version */
    version?: string;
    /** When the agent was created */
    createdDate?: string;
    /** Last successful connection timestamp */
    lastConnectionDate?: string;
    /** Number of connected systems using this agent */
    systemConnectionsCount?: number;
};

/**
 * Parameters for registering a new on-prem agent.
 */
export type CreateAgentBody = {
    /** Display name for the new agent */
    name: string;
};

/**
 * Parameters for updating an on-prem agent.
 */
export type UpdateAgentBody = {
    /** New name for the agent */
    name?: string;
};

/**
 * Field definition returned for connected-system configuration on an agent app.
 */
export type AgentAppConfigField = {
    /** Field identifier used in `inputs` when creating a connected system */
    name: string;
    /** Human-readable label */
    label: string;
    /** Help text, if any */
    help?: string | null;
    /** Whether the field is required */
    required?: boolean;
};

/**
 * Forman-style input descriptor for an agent app's connected-system form.
 */
export type AgentAppConfigInput = {
    /** Top-level field name (typically `inputs` for a collection) */
    name: string;
    /** Human-readable label */
    label: string;
    /** Field type (e.g. `collection`) */
    type: string;
    /** Nested field definitions when `type` is `collection` */
    spec?: AgentAppConfigField[];
};

type ListAgentsResponse = {
    agents: Agent[];
};

type GetAgentResponse = {
    agent: Agent;
};

type CreateAgentResponse = {
    agent: Agent;
};

type UpdateAgentResponse = {
    agent: Agent;
};

type DeleteAgentResponse = {
    agent: string;
};

type GetAgentAppConfigResponse = {
    inputs: AgentAppConfigInput[];
};

/**
 * Class providing methods for Make on-prem bridge agents.
 * These agents run on customer infrastructure and connect to Make via the agency service.
 */
export class Agents {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List on-prem agents for an organization.
     * @param organizationId The organization ID
     */
    async list(organizationId: number): Promise<Agent[]> {
        return (
            await this.#fetch<ListAgentsResponse>('/agents', {
                query: { organizationId },
            })
        ).agents;
    }

    /**
     * Get details of a specific on-prem agent.
     * @param organizationId The organization ID
     * @param agentId The agent UUID
     */
    async get(organizationId: number, agentId: string): Promise<Agent> {
        return (
            await this.#fetch<GetAgentResponse>(`/agents/${agentId}`, {
                query: { organizationId },
            })
        ).agent;
    }

    /**
     * Register a new on-prem agent. The server assigns `id` and `clientSecret`.
     * @param organizationId The organization ID
     * @param body Agent registration parameters (`name` only)
     */
    async create(organizationId: number, body: CreateAgentBody): Promise<Agent> {
        return (
            await this.#fetch<CreateAgentResponse>('/agent/register', {
                method: 'POST',
                query: { organizationId },
                body,
            })
        ).agent;
    }

    /**
     * Update an on-prem agent (currently supports renaming via `name`).
     * @param organizationId The organization ID
     * @param agentId The agent UUID
     * @param body Fields to update
     */
    async update(organizationId: number, agentId: string, body: UpdateAgentBody): Promise<Agent> {
        return (
            await this.#fetch<UpdateAgentResponse>(`/agents/${agentId}`, {
                method: 'PATCH',
                query: { organizationId },
                body,
            })
        ).agent;
    }

    /**
     * Delete an on-prem agent.
     * @param organizationId The organization ID
     * @param agentId The agent UUID
     * @returns The deleted agent ID
     */
    async delete(organizationId: number, agentId: string): Promise<string> {
        return (
            await this.#fetch<DeleteAgentResponse>(`/agents/${agentId}`, {
                method: 'DELETE',
                query: { organizationId },
            })
        ).agent;
    }

    /**
     * Get dynamic input field definitions for creating a connected system on an agent app.
     * @param organizationId The organization ID
     * @param agentId The agent UUID
     * @param appName Connected-system app slug (e.g. `http`, `sap-agent`)
     */
    async getAppConfig(
        organizationId: number,
        agentId: string,
        appName: string,
    ): Promise<AgentAppConfigInput[]> {
        return (
            await this.#fetch<GetAgentAppConfigResponse>(
                `/agents/${agentId}/apps/${appName}/config`,
                {
                    query: { organizationId },
                },
            )
        ).inputs;
    }
}
