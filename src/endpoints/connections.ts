import type { FetchFunction, JSONValue, PickColumns } from '../types.js';

export type Connection = {
    /** The connection ID */
    id: number;
    /** The connection name */
    name: string;
    /** The connection type name */
    accountName: string;
    /** The connection type label */
    accountLabel: string;
    /** The connection app name */
    packageName: string | null;
    /** The connection expire date */
    expire: string | null;
    /** The connection metadata */
    metadata: Record<string, JSONValue> | null;
    /** The team ID */
    teamId: number;
    /** The connection theme */
    theme: string;
    /** Whether the connection is upgradeable */
    upgradeable: boolean;
    /** The number of scopes (only for OAuth connections) */
    scopesCnt: number;
    /** Whether the connection is scoped (only for OAuth connections) */
    scoped: boolean;
    /** The connection authorization type (`basic`, `oauth`) */
    accountType: string;
    /** Whether the connection is editable */
    editable: boolean;
    /** The connection UID */
    uid: number | null;
    /** The connected system ID */
    connectedSystemId: string | null;
};

export type ConnectionWithScopes = Connection & {
    scopes: Array<{
        id: string;
        name?: string;
        account: string;
    }>;
};

export type ListConnectionsOptions<C extends keyof Connection = never> = {
    cols?: C[];
    type?: string[];
    teamId?: number;
};

export type GetConnectionOptions<C extends keyof ConnectionWithScopes = never> = {
    cols?: C[];
};

export type RenameConnectionOptions<C extends keyof Connection = never> = {
    cols?: C[];
};

export type CreateConnectionBody = {
    name: string;
    accountName: string;
    scopes?: string[];
    teamId: number;
    data?: Record<string, JSONValue>;
};

export type UpdateConnectionBody = {
    data?: Record<string, JSONValue>;
};

type ListConnectionsResponse<C extends keyof Connection = never> = {
    connections: PickColumns<Connection, C>[];
};

type GetConnectionResponse<C extends keyof ConnectionWithScopes = never> = {
    connection: PickColumns<ConnectionWithScopes, C>;
};

type CreateConnectionResponse = {
    connection: Connection;
};

type UpdateConnectionResponse = {
    changed: boolean;
};

type RenameConnectionResponse<C extends keyof Connection = never> = {
    connection: PickColumns<Connection, C>;
    newName: string;
};

type VerifyConnectionResponse = {
    verified: boolean;
};

type ScopedConnectionResponse = {
    connection: {
        scoped: boolean;
    };
};

type EditableParametersResponse = {
    editableParameters: string[];
};

export class Connections {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List connections
     * @param teamId The team ID
     * @param options Optional parameters for filtering
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
     * Get a connection
     * @param connectionId The connection ID
     * @param options Optional parameters
     * @returns Promise with the connection details
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
     * Create a new connection
     * @param body The connection data including name, teamId, accountName, accountType, and optional parameters
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
                     * We're fixing inconsitencies in the API by swapping some parameters, making
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
     * Update a connection
     * @param connectionId The connection ID
     * @param body The connection parameters to update
     * @returns Promise indicating if the connection was updated
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
     * Rename a connection
     * @param connectionId The connection ID
     * @param name The new name for the connection
     * @param options Optional parameters
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
     * Verify a connection
     * @param connectionId The connection ID
     * @returns Promise indicating if the connection was verified
     */
    async verify(connectionId: number): Promise<boolean> {
        return (
            await this.#fetch<VerifyConnectionResponse>(`/connections/${connectionId}/test`, {
                method: 'POST',
            })
        ).verified;
    }

    /**
     * Get the scoped status of a connection
     * @param connectionId The connection ID
     * @param scope The list of scopes to check
     * @returns Promise with the scoped status
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
     * List editable parameters for a connection
     * @param connectionId The connection ID
     * @returns Promise with the list of editable parameters
     */
    async listEditableParameters(connectionId: number): Promise<string[]> {
        return (await this.#fetch<EditableParametersResponse>(`/connections/${connectionId}/editable-data-schema`))
            .editableParameters;
    }

    /**
     * Delete a connection
     * @param connectionId The connection ID
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
