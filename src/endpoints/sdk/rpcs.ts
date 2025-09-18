import type { FetchFunction, JSONValue } from '../../types.js';
import { JSONStringifyIfNotString } from '../../utils.js';

/**
 * Remote Procedure Call (RPC) definition
 */
export type SDKRPC = {
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
export type SDKRPCSection = string;

/**
 * RPC section type
 */
export type SDKRPCSectionType = 'api' | 'parameters';

/**
 * Body for creating a new RPC
 */
export type CreateSDKRPCBody = {
    /** The name of the RPC */
    name: string;
    /** The label of the RPC visible in the scenario builder */
    label: string;
};

/**
 * Body for updating an RPC
 */
export type UpdateSDKRPCBody = {
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
export type TestSDKRPCBody = {
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
 * Internal response types (not exported)
 */
type ListSDKRPCsResponse = {
    appRpcs: SDKRPC[];
};

type GetSDKRPCResponse = {
    appRpc: SDKRPC;
};

type CreateSDKRPCResponse = {
    appRpc: Pick<SDKRPC, 'name' | 'label'>;
};

type UpdateSDKRPCResponse = {
    appRpc: SDKRPC;
};

type DeleteSDKRPCResponse = {
    appRpc: string;
};

/**
 * Class providing methods for working with RPCs within Apps
 */
export class SDKRPCs {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all RPCs for the app
     */
    async list(appName: string, appVersion: number): Promise<SDKRPC[]> {
        const response = await this.#fetch<ListSDKRPCsResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs`);
        return response.appRpcs || [];
    }

    /**
     * Get a single RPC by name
     */
    async get(appName: string, appVersion: number, rpcName: string): Promise<SDKRPC> {
        const response = await this.#fetch<GetSDKRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`);
        return response.appRpc;
    }

    /**
     * Create a new RPC
     */
    async create(appName: string, appVersion: number, body: CreateSDKRPCBody): Promise<CreateSDKRPCResponse['appRpc']> {
        const response = await this.#fetch<CreateSDKRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs`, {
            method: 'POST',
            body,
        });
        return response.appRpc;
    }

    /**
     * Update an existing RPC
     */
    async update(appName: string, appVersion: number, rpcName: string, body: UpdateSDKRPCBody): Promise<SDKRPC> {
        const response = await this.#fetch<UpdateSDKRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, {
            method: 'PATCH',
            body,
        });
        return response.appRpc;
    }

    /**
     * Delete an RPC
     */
    async delete(appName: string, appVersion: number, rpcName: string): Promise<void> {
        await this.#fetch<DeleteSDKRPCResponse>(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Test an RPC with provided data and schema
     * @returns The test result
     */
    async test(appName: string, appVersion: number, rpcName: string, body: TestSDKRPCBody): Promise<unknown> {
        return await this.#fetch(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, {
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
        section: SDKRPCSectionType,
    ): Promise<SDKRPCSection> {
        const response = await this.#fetch<SDKRPCSection>(
            `/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}/${section}`,
        );
        return response;
    }

    /**
     * Set RPC section data
     */
    async setSection(
        appName: string,
        appVersion: number,
        rpcName: string,
        section: SDKRPCSectionType,
        body: SDKRPCSection,
    ): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/jsonc',
            },
            body: JSONStringifyIfNotString(body),
        });
    }
}
