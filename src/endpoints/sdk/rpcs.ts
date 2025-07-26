import type { FetchFunction, JSONValue } from '../../types.js';

/**
 * Remote Procedure Call (RPC) definition
 */
export type RPC = {
    /** The name of the RPC */
    name: string;
    /** The label of the RPC visible in the scenario builder */
    label: string;
    /** Connection name if applicable */
    connection: string | null;
    /** Alternative connection name if applicable */
    altConnection: string | null;
};

/**
 * RPC section data (api, parameters, etc.)
 */
export type RPCSection = Record<string, JSONValue>;

/**
 * RPC section type
 */
export type RPCSectionType = 'api' | 'parameters';

/**
 * Body for creating a new RPC
 */
export type CreateRPCBody = {
    /** The name of the RPC */
    name: string;
    /** The label of the RPC visible in the scenario builder */
    label: string;
};

/**
 * Body for updating an RPC
 */
export type UpdateRPCBody = {
    /** The label of the RPC visible in the scenario builder */
    label?: string;
    /** Connection name */
    connection?: string;
    /** Alternative connection name */
    altConnection?: string;
};

/**
 * Body for testing an RPC
 */
export type TestRPCBody = {
    /** Test data object */
    data: Record<string, JSONValue>;
    /** Schema definition array */
    schema: Array<{
        /** Parameter name */
        name: string;
        /** Parameter type */
        type: string;
        /** Whether parameter is required */
        required: boolean;
    }>;
};

/**
 * Body for setting RPC section data
 */
export type SetRPCSectionBody = RPCSection;

/**
 * Internal response types (not exported)
 */
type ListRPCsResponse = {
    appRpcs: RPC[];
};

type GetRPCResponse = {
    appRpc: RPC;
};

type CreateRPCResponse = {
    appRpc: Pick<RPC, 'name' | 'label'>;
};

type UpdateRPCResponse = {
    appRpc: RPC;
};

type DeleteRPCResponse = {
    appRpc: string;
};

type SetRPCSectionResponse = {
    change: Record<string, JSONValue>;
};

/**
 * Class providing methods for working with RPCs within Apps
 */
export class RPCs {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all RPCs for the app
     */
    async list(appName: string, appVersion: number): Promise<RPC[]> {
        const response = await this.#fetch<ListRPCsResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs`);
        return response.appRpcs || [];
    }

    /**
     * Get a single RPC by name
     */
    async get(appName: string, appVersion: number, rpcName: string): Promise<RPC> {
        const response = await this.#fetch<GetRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`);
        return response.appRpc;
    }

    /**
     * Create a new RPC
     */
    async create(appName: string, appVersion: number, body: CreateRPCBody): Promise<CreateRPCResponse['appRpc']> {
        const response = await this.#fetch<CreateRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs`, {
            method: 'POST',
            body,
        });
        return response.appRpc;
    }

    /**
     * Update an existing RPC
     */
    async update(appName: string, appVersion: number, rpcName: string, body: UpdateRPCBody): Promise<RPC> {
        const response = await this.#fetch<UpdateRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, {
            method: 'PATCH',
            body,
        });
        return response.appRpc;
    }

    /**
     * Delete an RPC
     */
    async delete(appName: string, appVersion: number, rpcName: string): Promise<void> {
        await this.#fetch<DeleteRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Test an RPC with provided data and schema
     */
    async test(appName: string, appVersion: number, rpcName: string, body: TestRPCBody): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, {
            method: 'POST',
            body,
        });
    }

    /**
     * Get RPC section data
     */
    async getSection(
        appName: string,
        appVersion: number,
        rpcName: string,
        section: RPCSectionType,
    ): Promise<RPCSection> {
        const response = await this.#fetch<RPCSection>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}/${section}`);
        return response;
    }

    /**
     * Set RPC section data
     */
    async setSection(
        appName: string,
        appVersion: number,
        rpcName: string,
        section: RPCSectionType,
        body: SetRPCSectionBody,
    ): Promise<Record<string, JSONValue>> {
        const response = await this.#fetch<SetRPCSectionResponse>(
            `/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}/${section}`,
            {
                method: 'PUT',
                body,
            },
        );
        return response.change || {};
    }
}
