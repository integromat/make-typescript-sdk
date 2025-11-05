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
 * Validation result for connection validation
 */
export type ConnectionValidationResult = {
    /** Whether the connection is valid */
    isValid: boolean;
    /** List of validation errors */
    errors: ValidationError[];
    /** List of validation warnings */
    warnings: ValidationWarning[];
    /** Overall validation score (0-100) */
    score: number;
    /** Recommendations for improvement */
    recommendations?: string[];
};

/**
 * Validation error details
 */
export type ValidationError = {
    /** Field that failed validation */
    field: string;
    /** Error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Error severity */
    severity: 'error' | 'warning';
    /** Suggestions to fix the error */
    suggestions?: string[];
};

/**
 * Validation warning details
 */
export type ValidationWarning = {
    /** Field that has warning */
    field: string;
    /** Warning code */
    code: string;
    /** Human-readable warning message */
    message: string;
    /** Impact level */
    impact: 'low' | 'medium' | 'high';
};

/**
 * Connection usage statistics
 */
export type ConnectionUsageStats = {
    /** Total number of requests made */
    totalRequests: number;
    /** Number of successful requests */
    successfulRequests: number;
    /** Number of failed requests */
    failedRequests: number;
    /** Average response time in milliseconds */
    averageResponseTime: number;
    /** Last time the connection was used */
    lastUsed?: string;
    /** Current error rate (0-1) */
    errorRate: number;
    /** Rate limit status if applicable */
    rateLimitStatus?: RateLimitStatus;
};

/**
 * Rate limit status information
 */
export type RateLimitStatus = {
    /** Remaining requests in current window */
    remaining: number;
    /** Total requests allowed in window */
    total: number;
    /** When the rate limit resets */
    resetTime: string;
    /** Whether currently rate limited */
    isLimited: boolean;
};

/**
 * Test result for connection testing
 */
export type ConnectionTestResult = {
    /** Whether the test was successful */
    success: boolean;
    /** Test duration in milliseconds */
    duration: number;
    /** Test result message */
    message?: string;
    /** Detailed test information */
    details?: TestDetails;
    /** Test execution logs */
    logs?: string[];
};

/**
 * Detailed test information
 */
export type TestDetails = {
    /** Endpoint that was tested */
    endpoint?: string;
    /** HTTP method used */
    method?: string;
    /** Request payload sent */
    requestPayload?: JSONValue;
    /** HTTP response status */
    responseStatus?: number;
    /** Response body received */
    responseBody?: JSONValue;
    /** Test assertions performed */
    assertions?: AssertionResult[];
};

/**
 * Test assertion result
 */
export type AssertionResult = {
    /** Assertion name */
    name: string;
    /** Whether assertion passed */
    passed: boolean;
    /** Expected value */
    expected?: JSONValue;
    /** Actual value received */
    actual?: JSONValue;
    /** Assertion message */
    message?: string;
};

/**
 * Body for cloning a connection
 */
export type CloneConnectionBody = {
    /** Target connection name */
    targetName: string;
    /** Target app name */
    targetApp: string;
    /** Optional new label */
    label?: string;
    /** Whether to include sensitive data */
    includeSensitiveData?: boolean;
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

type ConnectionValidationResponse = {
    validation: ConnectionValidationResult;
};

type ConnectionUsageStatsResponse = {
    stats: ConnectionUsageStats;
};

type ConnectionTestResponse = {
    test: ConnectionTestResult;
};

type CloneConnectionResponse = {
    connection: SDKConnection;
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

    /**
     * Validate connection configuration and credentials
     */
    async validateConnection(connectionName: string): Promise<ConnectionValidationResult> {
        const response = await this.#fetch<ConnectionValidationResponse>(
            `/sdk/apps/connections/${connectionName}/validate`,
            {
                method: 'POST',
            },
        );
        return response.validation;
    }

    /**
     * Clone connection to new name and app
     */
    async cloneConnection(sourceConnectionName: string, cloneData: CloneConnectionBody): Promise<SDKConnection> {
        const response = await this.#fetch<CloneConnectionResponse>(
            `/sdk/apps/connections/${sourceConnectionName}/clone`,
            {
                method: 'POST',
                body: cloneData,
            },
        );
        return response.connection;
    }

    /**
     * Get connection usage statistics and metrics
     */
    async getUsageStats(connectionName: string): Promise<ConnectionUsageStats> {
        const response = await this.#fetch<ConnectionUsageStatsResponse>(
            `/sdk/apps/connections/${connectionName}/stats`,
        );
        return response.stats;
    }

    /**
     * Test connection functionality and connectivity
     */
    async testConnection(connectionName: string, testData?: JSONValue): Promise<ConnectionTestResult> {
        const response = await this.#fetch<ConnectionTestResponse>(
            `/sdk/apps/connections/${connectionName}/test`,
            {
                method: 'POST',
                body: testData ? { testData } : undefined,
            },
        );
        return response.test;
    }
}
