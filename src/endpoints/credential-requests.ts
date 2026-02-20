import type { FetchFunction, PickColumns, JSONValue } from '../types.js';
import type { Pagination } from '../types.js';

/**
 * Credential Request entity
 */
export type CredentialRequest = {
    /** Unique identifier */
    id: string;
    /** Organization ID */
    organizationId: number;
    /** Team ID */
    teamId: number;
    /** User ID */
    userId: number;
    /** Name of the request */
    name: string;
    /** Description of the request */
    description?: string;
    /** External provider ID */
    externalProviderId?: string | null;
    /** Make provider ID */
    makeProviderId?: string | null;
    /** Creation timestamp */
    createdAt: string;
    /** Update timestamp */
    updatedAt: string;
    /** Expiration timestamp */
    expiresAt?: string;
    /** Status of the request */
    status: string;
    /** Should send email */
    shouldSendEmail: boolean;
    /** Email sent timestamp */
    emailSentAt?: string | null;
    /** App names associated with the request */
    appNames?: string[];
    /** Provider details */
    makeProvider?: {
        id: number;
        email: string;
        name: string;
    };
};

/**
 * Options for getting a credential request
 */
export type GetCredentialRequestOptions<C extends keyof CredentialRequest = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Options for listing credential requests with generic column selection
 */
export type ListCredentialRequestsOptions<C extends keyof CredentialRequest = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Filter by team ID */
    teamId?: number;
    /** Filter by user ID */
    userId?: number;
    /** Filter by Make provider ID */
    makeProviderId?: string | number;
    /** Filter by status */
    status?: string;
    /** Filter by name */
    name?: string;
    /** Pagination options */
    pg?: Partial<Pagination<CredentialRequest>>;
};

/**
 * Body for creating a new credential request
 */
export type CreateCredentialRequestBody = {
    /** Name of the request */
    name: string;
    /** Team ID */
    teamId: number;
    /** Description of the request */
    description?: string;
    /** Array of connections to include in the request */
    connections?: Record<string, JSONValue>[];
    /** Array of keys to include in the request */
    keys?: Record<string, JSONValue>[];
    /** Provider information */
    provider: Record<string, JSONValue>;
};

/**
 * Class providing methods for working with credential requests
 */
export class CredentialRequests {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List credential requests with optional filtering and pagination
     */
    async list<C extends keyof CredentialRequest = never>(
        options: ListCredentialRequestsOptions<C> = {},
    ): Promise<PickColumns<CredentialRequest, C>[]> {
        const response = await this.#fetch<{ requests: PickColumns<CredentialRequest, C>[] }>(
            '/credential-requests/requests',
            { query: options },
        );
        return response.requests;
    }

    /**
     * Create a new credential request
     */
    async create(body: CreateCredentialRequestBody): Promise<CredentialRequest> {
        const response = await this.#fetch<{ request: CredentialRequest }>('/credential-requests/requests', {
            method: 'POST',
            body: body as Record<string, JSONValue>,
        });
        return response.request;
    }

    /**
     * Get a credential request by ID
     */
    async get<C extends keyof CredentialRequest = never>(
        requestId: string,
        options: GetCredentialRequestOptions<C> = {},
    ): Promise<PickColumns<CredentialRequest, C>> {
        const response = await this.#fetch<{ request: PickColumns<CredentialRequest, C> }>(
            `/credential-requests/requests/${requestId}`,
            { query: options },
        );
        return response.request;
    }

    /**
     * Delete a credential request by ID
     */
    async delete(requestId: string): Promise<void> {
        await this.#fetch(`/credential-requests/requests/${requestId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get a credential detail by credential ID
     */
    async getCredential<C extends keyof Credential = never>(
        credentialId: string,
        options: { cols?: C[] | ['*'] } = {},
    ): Promise<PickColumns<Credential, C>> {
        const response = await this.#fetch<{ credential: PickColumns<Credential, C> }>(
            `/credential-requests/credentials/${credentialId}`,
            { query: options },
        );
        return response.credential;
    }

    /**
     * Decline a credential by ID
     */
    async declineCredential(credentialId: string, reason?: string): Promise<Credential> {
        const response = await this.#fetch<{ credential: Credential }>(
            `/credential-requests/credentials/${credentialId}/decline`,
            {
                method: 'POST',
                body: reason ? { reason } : undefined,
            },
        );
        return response.credential;
    }

    /**
     * Delete a credential from the remote platform and reset its state to pending
     */
    async deleteRemoteCredential(credentialId: string): Promise<Credential> {
        const response = await this.#fetch<{ credential: Credential }>(
            `/credential-requests/credentials/${credentialId}/delete-remote`,
            { method: 'POST' },
        );
        return response.credential;
    }
}

/**
 * Credential entity (for credentials within a request)
 */
export type Credential = {
    /** Unique identifier */
    id: string;
    /** Request ID */
    requestId: string;
    /** Component */
    component: string;
    /** Type (e.g., oauth) */
    type: string;
    /** Name */
    name: string;
    /** Label */
    label: string;
    /** Description */
    description?: string;
    /** Scope */
    scope?: string[];
    /** Remote ID */
    remoteId?: string | null;
    /** Remote scope */
    remoteScope?: string[];
    /** Token ID */
    tokenId?: string | null;
    /** Created at */
    createdAt: string;
    /** Updated at */
    updatedAt: string;
    /** State (e.g., pending, authorized, declined) */
    state: string;
    /** Decline reason */
    declineReason?: string | null;
    /** App name */
    appName?: string;
    /** App modules */
    appModules?: string[];
    /** App version */
    appVersion?: string;
};
