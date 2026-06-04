import type { FetchFunction, JSONValue } from '../types.js';

/**
 * A single valued input on a connected system.
 */
export type ConnectedSystemInput = {
    /** Input field name */
    name: string;
    /** Input value */
    value: string;
};

/**
 * Represents a connected system (on-prem bridge connection to an external app).
 */
export type ConnectedSystem = {
    /** Unique identifier of the connected system */
    id: string;
    /** User-defined name */
    name: string;
    /** ID of the on-prem agent hosting this connection */
    agentId: string;
    /** Connected-system app slug */
    appName: string;
    /** Agent version at time of connection */
    agentVersion?: string;
    /** Configured inputs */
    inputs?: ConnectedSystemInput[];
};

/**
 * Parameters for creating a connected system.
 * `inputs` is a keyed object matching the app's dynamic form (see `Agents.getAppConfig`).
 */
export type CreateConnectedSystemBody = {
    /** Display name for the connected system */
    name: string;
    /** On-prem agent UUID that will host the connection */
    agentId: string;
    /** App slug from `Enums.connectedSystemApps()` */
    appName: string;
    /** App-specific configuration values keyed by field name */
    inputs: Record<string, JSONValue>;
};

/**
 * Parameters for updating a connected system.
 */
export type UpdateConnectedSystemBody = {
    /** New display name */
    name?: string;
    /** Move to a different agent */
    agentId?: string;
    /** Change the app (uncommon after creation) */
    appName?: string;
    /** Updated configuration values keyed by field name */
    inputs?: Record<string, JSONValue>;
};

type ListConnectedSystemsResponse = {
    connectedSystems: ConnectedSystem[];
};

type GetConnectedSystemResponse = {
    connectedSystem: ConnectedSystem;
};

type CreateConnectedSystemResponse = {
    connectedSystem: ConnectedSystem;
};

type UpdateConnectedSystemResponse = {
    connectedSystem: ConnectedSystem;
};

type DeleteConnectedSystemResponse = {
    connectedSystem: string;
};

/**
 * Class providing methods for Make on-prem connected systems.
 */
export class ConnectedSystems {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List connected systems for an on-prem agent.
     * @param organizationId The organization ID
     * @param agentId The on-prem agent UUID
     */
    async list(organizationId: number, agentId: string): Promise<ConnectedSystem[]> {
        return (
            await this.#fetch<ListConnectedSystemsResponse>('/connected-systems', {
                query: { organizationId, agentId },
            })
        ).connectedSystems;
    }

    /**
     * Get details of a connected system.
     * @param organizationId The organization ID
     * @param connectedSystemId The connected system UUID
     */
    async get(organizationId: number, connectedSystemId: string): Promise<ConnectedSystem> {
        return (
            await this.#fetch<GetConnectedSystemResponse>(`/connected-systems/${connectedSystemId}`, {
                query: { organizationId },
            })
        ).connectedSystem;
    }

    /**
     * Create a connected system on an on-prem agent.
     * @param organizationId The organization ID
     * @param body Creation parameters including app-specific `inputs`
     */
    async create(organizationId: number, body: CreateConnectedSystemBody): Promise<ConnectedSystem> {
        return (
            await this.#fetch<CreateConnectedSystemResponse>('/connected-systems', {
                method: 'POST',
                query: { organizationId },
                body,
            })
        ).connectedSystem;
    }

    /**
     * Update a connected system.
     * @param organizationId The organization ID
     * @param connectedSystemId The connected system UUID
     * @param body Fields to update
     */
    async update(
        organizationId: number,
        connectedSystemId: string,
        body: UpdateConnectedSystemBody,
    ): Promise<ConnectedSystem> {
        return (
            await this.#fetch<UpdateConnectedSystemResponse>(`/connected-systems/${connectedSystemId}`, {
                method: 'PATCH',
                query: { organizationId },
                body,
            })
        ).connectedSystem;
    }

    /**
     * Delete a connected system.
     * @param organizationId The organization ID
     * @param connectedSystemId The connected system UUID
     * @returns The deleted connected system ID
     */
    async delete(organizationId: number, connectedSystemId: string): Promise<string> {
        return (
            await this.#fetch<DeleteConnectedSystemResponse>(`/connected-systems/${connectedSystemId}`, {
                method: 'DELETE',
                query: { organizationId },
            })
        ).connectedSystem;
    }
}
