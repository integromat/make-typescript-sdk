import type { FetchFunction } from '../types.js';

/**
 * Status of an on-prem bridge agent.
 */
export type OnPremAgentStatus = 'ACTIVE' | 'STOPPED' | 'NOT_RESPONDING' | 'REGISTERED';

/**
 * Represents a Make on-prem bridge agent.
 */
export type OnPremAgent = {
    /** Unique identifier of the agent */
    id: string;
    /** Tenant identifier in the agency service */
    tenantId: string;
    /** User-defined name of the agent */
    name: string;
    /** Client secret for agent authentication (sensitive; may only be shown at creation) */
    clientSecret?: string;
    /** Current operational status */
    status: OnPremAgentStatus;
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
export type CreateOnPremAgentBody = {
    /** Display name for the new agent */
    name: string;
};

/**
 * Parameters for updating an on-prem agent.
 */
export type UpdateOnPremAgentBody = {
    /** New name for the agent */
    name?: string;
};

/**
 * Field definition returned for connected-system configuration on an agent app.
 */
export type OnPremAgentAppConfigField = {
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
export type OnPremAgentAppConfigInput = {
    /** Top-level field name (typically `inputs` for a collection) */
    name: string;
    /** Human-readable label */
    label: string;
    /** Field type (e.g. `collection`) */
    type: string;
    /** Nested field definitions when `type` is `collection` */
    spec?: OnPremAgentAppConfigField[];
};

type ListOnPremAgentsResponse = {
    agents: OnPremAgent[];
};

type GetOnPremAgentResponse = {
    agent: OnPremAgent;
};

type CreateOnPremAgentResponse = {
    agent: OnPremAgent;
};

type UpdateOnPremAgentResponse = {
    agent: OnPremAgent;
};

type DeleteOnPremAgentResponse = {
    agent: string;
};

type GetOnPremAgentAppConfigResponse = {
    inputs: OnPremAgentAppConfigInput[];
};

/**
 * Class providing methods for Make on-prem bridge agents.
 * These agents run on customer infrastructure and connect to Make via the agency service.
 */
export class OnPremAgents {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List on-prem agents for an organization.
     * @param organizationId The organization ID
     */
    async list(organizationId: number): Promise<OnPremAgent[]> {
        return (
            await this.#fetch<ListOnPremAgentsResponse>('/agents', {
                query: { organizationId },
            })
        ).agents;
    }

    /**
     * Get details of a specific on-prem agent.
     * @param organizationId The organization ID
     * @param agentId The agent UUID
     */
    async get(organizationId: number, agentId: string): Promise<OnPremAgent> {
        return (
            await this.#fetch<GetOnPremAgentResponse>(`/agents/${agentId}`, {
                query: { organizationId },
            })
        ).agent;
    }

    /**
     * Register a new on-prem agent. The server assigns `id` and `clientSecret`.
     * @param organizationId The organization ID
     * @param body Agent registration parameters (`name` only)
     */
    async create(organizationId: number, body: CreateOnPremAgentBody): Promise<OnPremAgent> {
        return (
            await this.#fetch<CreateOnPremAgentResponse>('/agent/register', {
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
    async update(organizationId: number, agentId: string, body: UpdateOnPremAgentBody): Promise<OnPremAgent> {
        return (
            await this.#fetch<UpdateOnPremAgentResponse>(`/agents/${agentId}`, {
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
            await this.#fetch<DeleteOnPremAgentResponse>(`/agents/${agentId}`, {
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
    ): Promise<OnPremAgentAppConfigInput[]> {
        return (
            await this.#fetch<GetOnPremAgentAppConfigResponse>(
                `/agents/${agentId}/apps/${appName}/config`,
                {
                    query: { organizationId },
                },
            )
        ).inputs;
    }
}
