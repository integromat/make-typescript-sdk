import type { FetchFunction, PickColumns, JSONValue, Pagination } from '../types.js';

/**
 * User entity for credential request details
 */
export type CredentialRequestUser = {
    /** User ID */
    id: number;
    /** User email */
    email: string;
    /** User name */
    name: string;
};

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
 * Detailed credential request with associated data
 */
export type CredentialRequestDetail = CredentialRequest & {
    /** Make provider information */
    makeProvider: CredentialRequestUser | null;
    /** User information */
    user: CredentialRequestUser | null;
    /** Associated credentials */
    credentials: Credential[];
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
 * Represents an app/module selection to derive credentials from.
 */
export type CredentialSelection = {
    /** Name of the application to request credentials for */
    appName: string;
    /** Array of module IDs to include. Use ["*"] to select all modules with credentials. */
    appModules: string[];
    /** Version of the application. Defaults to the latest available version if not provided. */
    appVersion?: number;
    /** Optional name override for the credential when created in the platform */
    nameOverride?: string;
    /** Description for this credential to be displayed in the Request view */
    description?: string;
};

/**
 * Body for creating a credential action
 */
export type CreateCredentialActionBody = {
    /** Name of the Request which will be displayed to the End Users who open it */
    name?: string;
    /** Description of the Request which will be displayed to the End Users who open it */
    description?: string;
    /** ID of the Team to which the credentials will belong */
    teamId: number;
    /** Array of app/module selections to derive credentials from */
    credentials: CredentialSelection[];
};

/**
 * Prefill values for a connection or key
 */
export type CredentialPrefill = {
    /** Hard prefill values that the user cannot change */
    hard?: Record<string, string | number | boolean>;
    /** Soft prefill values that the user can change */
    soft?: Record<string, string | number | boolean>;
};

/**
 * Connection selection for create-by-credentials action
 */
export type ConnectionSelection = {
    /** Type of the Connection to be included in the Request */
    type: string;
    /** Description of the particular Connection to be displayed in the Request view */
    description?: string;
    /** Array of Scopes that the Connection should ask for */
    scope?: string[];
    /** Prefill values for the connection */
    prefill?: CredentialPrefill;
    /** Optional name override for the credential when created in the platform */
    nameOverride?: string;
};

/**
 * Key selection for create-by-credentials action
 */
export type KeySelection = {
    /** Type of the Key to be included in the Request */
    type: string;
    /** Description of the particular Key to be displayed in the Request view */
    description?: string;
    /** Prefill values for the key */
    prefill?: CredentialPrefill;
    /** Optional name override for the credential when created in the platform */
    nameOverride?: string;
};

/**
 * Body for creating a credential request by connection/key types
 */
export type CreateByCredentialsBody = {
    /** Human-readable name for the credential request */
    name?: string;
    /** Instructions or context for the end-user */
    description?: string;
    /** The numeric ID of the Make team where the connections/keys will be created once authorized */
    teamId: number;
    /** Array of OAuth or basic-auth connections to request */
    connections?: ConnectionSelection[];
    /** Array of API keys to request */
    keys?: KeySelection[];
};

/**
 * Body for extending an existing connection's OAuth scopes
 */
export type ExtendConnectionBody = {
    /** The numeric ID of an existing Make connection whose OAuth scopes need to be expanded */
    connectionId: number;
    /** One or more new OAuth scope strings to add to the connection */
    scopes: string[];
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
     * List credential requests for a given team, with optional additional filtering and pagination.
     *
     * @param teamId - The team to list credential requests for.
     * @param options - Optional filters (user, provider, status, name) and pagination.
     */
    async list<C extends keyof CredentialRequest = never>(
        teamId: number,
        options?: ListCredentialRequestsOptions<C>,
    ): Promise<PickColumns<CredentialRequest, C>[]>;

    /**
     * @deprecated Pass `teamId` as the first argument: `list(teamId, options?)`.
     */
    async list<C extends keyof CredentialRequest = never>(
        options: ListCredentialRequestsOptions<C> & { teamId: number },
    ): Promise<PickColumns<CredentialRequest, C>[]>;

    async list<C extends keyof CredentialRequest = never>(
        teamIdOrOptions: number | (ListCredentialRequestsOptions<C> & { teamId: number }),
        options?: ListCredentialRequestsOptions<C>,
    ): Promise<PickColumns<CredentialRequest, C>[]> {
        let teamId: number;
        if (typeof teamIdOrOptions === 'number') {
            teamId = teamIdOrOptions;
            options ??= {} as ListCredentialRequestsOptions<C>;
        } else {
            ({ teamId, ...options } = teamIdOrOptions as { teamId: number } & ListCredentialRequestsOptions<C>);
        }

        const response = await this.#fetch<{ requests: PickColumns<CredentialRequest, C>[] }>(
            '/credential-requests/requests',
            { query: { ...options, teamId } },
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
     * Get full detail of a credential request including associated credentials
     */
    async getDetail(requestId: string): Promise<CredentialRequestDetail> {
        const response = await this.#fetch<{ requestDetail: CredentialRequestDetail }>(
            `/credential-requests/requests/${requestId}/detail`,
        );
        return response.requestDetail;
    }

    /**
     * Delete a credential request and all associated credentials (connections and keys) by ID
     * @param requestId - The ID of the credential request to delete
     */
    async delete(requestId: string): Promise<void> {
        await this.#fetch(`/credential-requests/requests/${requestId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
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
     * Delete a credential and reset its state to pending
     */
    async deleteCredential(credentialId: string): Promise<Credential> {
        const response = await this.#fetch<{ credential: Credential }>(
            `/credential-requests/credentials/${credentialId}/delete-remote`,
            { method: 'POST' },
        );
        return response.credential;
    }

    /**
     * Create a new action for credential creation (connection or key)
     */
    async createAction(body: CreateCredentialActionBody): Promise<{ request: CredentialRequest; publicUri: string }> {
        return await this.#fetch<{ request: CredentialRequest; publicUri: string }>(
            '/credential-requests/actions/create',
            {
                method: 'POST',
                body,
            },
        );
    }

    /**
     * Create a credential request by connection/key types.
     * Use this when you know the exact connection or key types needed.
     */
    async createByCredentials(
        body: CreateByCredentialsBody,
    ): Promise<{ request: CredentialRequest; credentials: Credential[]; publicUri: string }> {
        return await this.#fetch<{ request: CredentialRequest; credentials: Credential[]; publicUri: string }>(
            '/credential-requests/actions/create-by-credentials',
            {
                method: 'POST',
                body,
            },
        );
    }

    /**
     * Extend an existing connection's OAuth scopes.
     * Creates a credential request that the end-user must authorize to grant additional scopes.
     */
    async extendConnection(body: ExtendConnectionBody): Promise<{ request: CredentialRequest; publicUri: string }> {
        return await this.#fetch<{ request: CredentialRequest; publicUri: string }>(
            '/credential-requests/actions/extend',
            {
                method: 'POST',
                body,
            },
        );
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
    /** Optional name override for the credential */
    nameOverride?: string;
};
