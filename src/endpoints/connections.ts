import type { FetchFunction, JSONValue, Pagination, PickColumns } from '../types.js';

/**
 * Represents a connection in Make.
 * Connections link Make to external apps and services, allowing scenarios
 * to interact with them through APIs.
 */
export type Connection = {
    /** Unique identifier of the connection */
    id: number;
    /** User-defined name of the connection */
    name: string;
    /** The connection type name (internal identifier) */
    accountName: string;
    /** Human-readable label for the connection type */
    accountLabel: string;
    /** The app name this connection belongs to */
    packageName: string | null;
    /** Expiration date of the connection credentials, if applicable */
    expire: string | null;
    /** Additional metadata about the connection */
    metadata: Record<string, JSONValue> | null;
    /** ID of the team that owns the connection */
    teamId: number;
    /** Theme color for the connection in UI */
    theme: string;
    /** Whether the connection can be upgraded to a newer version */
    upgradeable: boolean;
    /** Number of OAuth scopes the connection has */
    scopesCnt: number;
    /** Whether the connection has specific scopes provided with the request */
    scoped: boolean;
    /** Authentication type used by the connection (basic, oauth) */
    accountType: string;
    /** Whether the connection can be edited */
    editable: boolean;
    /** Unique identifier of the user in the connected system */
    uid: number | null;
    /** External identifier of the connected system */
    connectedSystemId: string | null;
};

/**
 * Extended connection type that includes scope information.
 * Used when retrieving detailed connection information.
 */
export type ConnectionWithScopes = Connection & {
    /** OAuth scopes that the connection has access to */
    scopes: Array<{
        /** Identifier of the scope */
        id: string;
        /** Human-readable name of the scope */
        name?: string;
        /** Account/service the scope belongs to */
        account: string;
    }>;
};

/**
 * Options for listing connections.
 * @template C Keys of the Connection type to include in the response
 */
export type ListConnectionsOptions<C extends keyof Connection = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
    /** Filter connections by type */
    type?: string[];
    /** Team ID to filter connections by (can override the main parameter) */
    teamId?: number;
    /** Pagination options */
    pg?: Partial<Pagination<Connection>>;
};

/**
 * Options for retrieving a connection.
 * @template C Keys of the ConnectionWithScopes type to include in the response
 */
export type GetConnectionOptions<C extends keyof ConnectionWithScopes = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
};

/**
 * Options for renaming a connection.
 * @template C Keys of the Connection type to include in the response
 */
export type RenameConnectionOptions<C extends keyof Connection = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
};

/**
 * Parameters for creating a new connection.
 */
export type CreateConnectionBody = {
    /** Name for the connection */
    name: string;
    /** Type of the connection */
    accountName: string;
    /** OAuth scopes to request, if applicable */
    scopes?: string[];
    /** ID of the team where the connection will be created */
    teamId: number;
    /** Connection-specific configuration data */
    data?: Record<string, JSONValue>;
};

/**
 * Parameters for updating a connection.
 */
export type UpdateConnectionBody = {
    /** Connection-specific configuration data to update */
    data?: Record<string, JSONValue>;
};

/**
 * Response format for listing connections.
 */
type ListConnectionsResponse<C extends keyof Connection = never> = {
    /** List of connections matching the query */
    connections: PickColumns<Connection, C>[];
};

/**
 * Response format for getting a connection.
 */
type GetConnectionResponse<C extends keyof ConnectionWithScopes = never> = {
    /** The requested connection with scope information */
    connection: PickColumns<ConnectionWithScopes, C>;
};

/**
 * Response format for creating a connection.
 */
type CreateConnectionResponse = {
    /** The created connection */
    connection: Connection;
};

/**
 * Response format for updating a connection.
 */
type UpdateConnectionResponse = {
    /** Whether the connection was changed */
    changed: boolean;
};

/**
 * Response format for renaming a connection.
 */
type RenameConnectionResponse<C extends keyof Connection = never> = {
    /** The updated connection */
    connection: PickColumns<Connection, C>;
    /** The new name that was applied */
    newName: string;
};

/**
 * Response format for verifying a connection.
 */
type VerifyConnectionResponse = {
    /** Whether the connection was successfully verified */
    verified: boolean;
};

/**
 * Response format for updating connection scopes.
 */
type ScopedConnectionResponse = {
    /** Connection scope status information */
    connection: {
        /** Whether the connection is now scoped */
        scoped: boolean;
    };
};

/**
 * Response format for getting editable parameters.
 */
type EditableParametersResponse = {
    /** List of parameter names that can be edited */
    editableParameters: string[];
};

/**
 * Class providing methods for working with Make connections.
 * Connections link Make to external apps and services, allowing
 * scenarios to interact with them through APIs.
 */
export class Connections {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Connections instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List connections for a team.
     * @param teamId The team ID to list connections for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of connections
     */
    async list<C extends keyof Connection = never>(
        teamId: number,
        options?: ListConnectionsOptions<C>,
    ): Promise<PickColumns<Connection, C>[]> {
        return (
            await this.#fetch<ListConnectionsResponse<C>>('/connections', {
                query: {
                    teamId,
                    type: options?.type,
                    cols: options?.cols,
                },
            })
        ).connections;
    }

    /**
     * Get details of a specific connection.
     * @param connectionId The connection ID to get
     * @param options Optional parameters for filtering the returned fields
     * @returns Promise with the connection details including scope information
     */
    async get<C extends keyof ConnectionWithScopes = never>(
        connectionId: number,
        options?: GetConnectionOptions<C>,
    ): Promise<PickColumns<ConnectionWithScopes, C>> {
        return (
            await this.#fetch<GetConnectionResponse<C>>(`/connections/${connectionId}`, {
                query: {
                    cols: options?.cols,
                },
            })
        ).connection;
    }

    /**
     * Create a new connection.
     * @param body Parameters for the connection to create
     * @returns Promise with the created connection
     */
    async create(body: CreateConnectionBody): Promise<Pick<Connection, 'id' | 'name' | 'accountName' | 'accountType'>> {
        return (
            await this.#fetch<CreateConnectionResponse>('/connections', {
                method: 'POST',
                query: {
                    teamId: body.teamId,
                },
                body: Object.assign({}, body.data, {
                    /**
                     * We're fixing inconsistencies in the API by swapping some parameters, making
                     * the function interface more consistent with the rest of the API.
                     */
                    name: undefined,
                    accountName: body.name,
                    accountType: body.accountName,
                    teamId: undefined,
                }),
            })
        ).connection;
    }

    /**
     * Update a connection's configuration data.
     * @param connectionId The connection ID to update
     * @param body The connection parameters to update
     * @returns Promise with a boolean indicating success
     */
    async update(connectionId: number, body: UpdateConnectionBody): Promise<boolean> {
        return (
            await this.#fetch<UpdateConnectionResponse>(`/connections/${connectionId}/set-data`, {
                method: 'POST',
                body: body.data,
            })
        ).changed;
    }

    /**
     * Rename a connection.
     * @param connectionId The connection ID to rename
     * @param name The new name for the connection
     * @param options Optional parameters for filtering the returned fields
     * @returns Promise with the updated connection
     */
    async rename<C extends keyof Connection = never>(
        connectionId: number,
        name: string,
        options?: RenameConnectionOptions<C>,
    ): Promise<PickColumns<Connection, C>> {
        return (
            await this.#fetch<RenameConnectionResponse<C>>(`/connections/${connectionId}`, {
                method: 'PATCH',
                query: {
                    cols: options?.cols,
                },
                body: {
                    name,
                },
            })
        ).connection;
    }

    /**
     * Verify if a connection is working correctly.
     * Tests the connection credentials and configuration.
     * @param connectionId The connection ID to verify
     * @returns Promise with a boolean indicating if the connection is valid
     */
    async verify(connectionId: number): Promise<boolean> {
        return (
            await this.#fetch<VerifyConnectionResponse>(`/connections/${connectionId}/test`, {
                method: 'POST',
            })
        ).verified;
    }

    /**
     * Update the OAuth scopes for a connection.
     * @param connectionId The connection ID to update scopes for
     * @param scope Array of scope identifiers to set
     * @returns Promise with a boolean indicating if the connection is now scoped
     */
    async scoped(connectionId: number, scope: string[]): Promise<boolean> {
        return (
            await this.#fetch<ScopedConnectionResponse>(`/connections/${connectionId}/scoped`, {
                method: 'POST',
                body: {
                    scope,
                },
            })
        ).connection.scoped;
    }

    /**
     * List editable parameters for a connection.
     * @param connectionId The connection ID to get editable parameters for
     * @returns Promise with an array of parameter names that can be edited
     */
    async listEditableParameters(connectionId: number): Promise<string[]> {
        return (await this.#fetch<EditableParametersResponse>(`/connections/${connectionId}/editable-data-schema`))
            .editableParameters;
    }

    /**
     * Delete a connection.
     * @param connectionId The connection ID to delete
     */
    async delete(connectionId: number): Promise<void> {
        await this.#fetch(`/connections/${connectionId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
    }
}
