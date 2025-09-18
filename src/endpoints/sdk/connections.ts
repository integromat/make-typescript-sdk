import type { FetchFunction, JSONValue } from '../../types.js';
import { JSONStringifyIfNotString } from '../../utils.js';

/**
 * SDK Connection
 */
export type SDKConnection = {
    /** The name of the connection */
    name: string;
    /** The label of the connection visible in the scenario builder */
    label: string;
    /** The type of the connection */
    type: string;
};

/**
 * SDK Connection section data
 */
export type SDKConnectionSection = string;

/**
 * SDK Connection section type
 */
export type SDKConnectionSectionType = 'api' | 'parameters' | 'scopes' | 'scope' | 'install' | 'installSpec';

/**
 * SDK Connection common configuration
 */
export type SDKConnectionCommon = Record<string, JSONValue>;

/**
 * Body for creating a new connection
 */
export type CreateSDKConnectionBody = {
    /** The type of the connection */
    type: string;
    /** The label of the connection visible in the scenario builder */
    label: string;
};

/**
 * Body for updating a connection
 */
export type UpdateSDKConnectionBody = {
    /** The label of the connection visible in the scenario builder */
    label?: string;
};

/**
 * Internal response types (not exported)
 */
type ListSDKConnectionsResponse = {
    appConnections: SDKConnection[];
};

type GetSDKConnectionResponse = {
    appConnection: SDKConnection;
};

type CreateSDKConnectionResponse = {
    appConnection: SDKConnection;
};

type UpdateSDKConnectionResponse = {
    appConnection: SDKConnection;
};

type SetSDKConnectionCommonResponse = {
    changed: boolean;
};

/**
 * Class providing methods for working with SDK App Connections
 */
export class SDKConnections {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List connections for a specific app
     */
    async list(appName: string): Promise<SDKConnection[]> {
        const response = await this.#fetch<ListSDKConnectionsResponse>(`/sdk/apps/${appName}/connections`);
        return response.appConnections || [];
    }

    /**
     * Get a single connection by name
     */
    async get(connectionName: string): Promise<SDKConnection> {
        const response = await this.#fetch<GetSDKConnectionResponse>(`/sdk/apps/connections/${connectionName}`);
        return response.appConnection;
    }

    /**
     * Create a new connection for a specific app
     */
    async create(appName: string, body: CreateSDKConnectionBody): Promise<SDKConnection> {
        const response = await this.#fetch<CreateSDKConnectionResponse>(`/sdk/apps/${appName}/connections`, {
            method: 'POST',
            body,
        });
        return response.appConnection;
    }

    /**
     * Update an existing connection
     */
    async update(connectionName: string, body: UpdateSDKConnectionBody): Promise<SDKConnection> {
        const response = await this.#fetch<UpdateSDKConnectionResponse>(`/sdk/apps/connections/${connectionName}`, {
            method: 'PATCH',
            body,
        });
        return response.appConnection;
    }

    /**
     * Delete a connection
     */
    async delete(connectionName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/connections/${connectionName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get a specific section of a connection
     */
    async getSection(connectionName: string, section: SDKConnectionSectionType): Promise<SDKConnectionSection> {
        const response = await this.#fetch<SDKConnectionSection>(`/sdk/apps/connections/${connectionName}/${section}`);
        return response;
    }

    /**
     * Set a specific section of a connection
     */
    async setSection(
        connectionName: string,
        section: SDKConnectionSectionType,
        body: SDKConnectionSection,
    ): Promise<void> {
        await this.#fetch(`/sdk/apps/connections/${connectionName}/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/jsonc',
            },
            body: JSONStringifyIfNotString(body),
        });
    }

    /**
     * Get common configuration for a connection
     */
    async getCommon(connectionName: string): Promise<SDKConnectionCommon> {
        const response = await this.#fetch<SDKConnectionCommon>(`/sdk/apps/connections/${connectionName}/common`);
        return response;
    }

    /**
     * Set common configuration for a connection
     */
    async setCommon(connectionName: string, body: SDKConnectionCommon): Promise<boolean> {
        const response = await this.#fetch<SetSDKConnectionCommonResponse>(
            `/sdk/apps/connections/${connectionName}/common`,
            {
                method: 'PUT',
                body,
            },
        );
        return response.changed;
    }
}
