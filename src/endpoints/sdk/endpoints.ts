import type { FetchFunction } from '../../types.js';
import { JSONStringifyIfNotString } from '../../utils.js';

/**
 * MCP-inspired behavior hints for an Endpoint. Only these keys are persisted; unknown keys are stripped.
 */
export type SDKEndpointAnnotations = {
    /** If true, the Endpoint does not modify its environment. */
    readOnlyHint?: boolean;
    /** If true, the Endpoint may perform destructive updates; if false, updates are only additive. */
    destructiveHint?: boolean;
    /** If true, repeated calls with the same arguments have no additional effect. */
    idempotentHint?: boolean;
    /** If true, the Endpoint may interact with an "open world" of external entities. */
    openWorldHint?: boolean;
};

/**
 * Endpoint
 */
export type SDKEndpoint = {
    /** The name of the Endpoint */
    name: string;
    /** The label of the Endpoint */
    label: string;
    /** The description of the Endpoint */
    description: string | null;
    /** Context for how to use the Endpoint */
    context: string | null;
    /** MCP-inspired behavior hints */
    annotations: SDKEndpointAnnotations;
    /** Connection names attached to the Endpoint */
    attachedAccounts: string[];
    /** Whether the Endpoint is public */
    public: boolean;
    /** Whether the Endpoint is approved */
    approved: boolean;
    /** Whether the Endpoint is deprecated */
    deprecated: boolean;
    /** Whether the Endpoint is archived */
    archived: boolean;
    /** The endpoint schema version */
    schemaVersion: number;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
};

/**
 * Endpoint section data (api, scope, inputParameters, outputParameters)
 */
export type SDKEndpointSection = string;

/**
 * Endpoint section type
 */
export type SDKEndpointSectionType = 'api' | 'scope' | 'inputParameters' | 'outputParameters';

/**
 * Body for creating a new Endpoint
 */
export type CreateSDKEndpointBody = {
    /** The name of the Endpoint */
    name: string;
    /** The label of the Endpoint */
    label: string;
    /** The description of the Endpoint */
    description?: string;
    /** Connection names to attach to the Endpoint */
    attachedAccounts?: string[];
};

/**
 * Body for updating an Endpoint's metadata
 */
export type UpdateSDKEndpointBody = {
    /** The label of the Endpoint */
    label?: string;
    /** The description of the Endpoint */
    description?: string;
    /** Context for how to use the Endpoint */
    context?: string;
    /** MCP-inspired behavior hints */
    annotations?: SDKEndpointAnnotations;
    /** Connection names attached to the Endpoint (replaces the existing list) */
    attachedAccounts?: string[];
};

/**
 * Internal response types (not exported)
 */
type ListSDKEndpointsResponse = {
    appEndpoints: SDKEndpoint[];
};

type GetSDKEndpointResponse = {
    appEndpoint: SDKEndpoint;
};

/**
 * Class providing methods for working with App Endpoints
 */
export class SDKEndpoints {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all Endpoints for the app
     */
    async list(appName: string, appVersion: number): Promise<SDKEndpoint[]> {
        const response = await this.#fetch<ListSDKEndpointsResponse>(`/sdk/apps/${appName}/${appVersion}/endpoints`);
        return response.appEndpoints || [];
    }

    /**
     * Get a single Endpoint by name
     */
    async get(appName: string, appVersion: number, endpointName: string): Promise<SDKEndpoint> {
        const response = await this.#fetch<GetSDKEndpointResponse>(
            `/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}`,
        );
        return response.appEndpoint;
    }

    /**
     * Create a new Endpoint
     */
    async create(appName: string, appVersion: number, body: CreateSDKEndpointBody): Promise<SDKEndpoint> {
        const response = await this.#fetch<GetSDKEndpointResponse>(`/sdk/apps/${appName}/${appVersion}/endpoints`, {
            method: 'POST',
            body,
        });
        return response.appEndpoint;
    }

    /**
     * Update an existing Endpoint's metadata
     */
    async update(
        appName: string,
        appVersion: number,
        endpointName: string,
        body: UpdateSDKEndpointBody,
    ): Promise<SDKEndpoint> {
        const response = await this.#fetch<GetSDKEndpointResponse>(
            `/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}`,
            {
                method: 'PATCH',
                body,
            },
        );
        return response.appEndpoint;
    }

    /**
     * Delete an Endpoint
     */
    async delete(appName: string, appVersion: number, endpointName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get a specific section of an Endpoint
     * Available sections: api, scope, inputParameters, outputParameters
     */
    async getSection(
        appName: string,
        appVersion: number,
        endpointName: string,
        section: SDKEndpointSectionType,
    ): Promise<SDKEndpointSection> {
        const response = await this.#fetch<SDKEndpointSection>(
            `/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/${section}`,
        );
        return response;
    }

    /**
     * Set/update a specific section of an Endpoint
     * Available sections: api, scope, inputParameters, outputParameters
     */
    async setSection(
        appName: string,
        appVersion: number,
        endpointName: string,
        section: SDKEndpointSectionType,
        body: SDKEndpointSection,
    ): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/jsonc',
            },
            body: JSONStringifyIfNotString(body),
        });
    }

    /**
     * Make an Endpoint public.
     */
    async makePublic(appName: string, appVersion: number, endpointName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/public`, { method: 'POST' });
    }

    /**
     * Make an Endpoint private.
     */
    async makePrivate(appName: string, appVersion: number, endpointName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/endpoints/${endpointName}/private`, { method: 'POST' });
    }
}
