import { Scenarios } from './endpoints/scenarios.js';
import { Users } from './endpoints/users.js';
import { DataStores } from './endpoints/data-stores.js';
import { Blueprints } from './endpoints/blueprints.js';
import { Executions } from './endpoints/executions.js';
import { DataStructures } from './endpoints/data-structures.js';
import { Folders } from './endpoints/folders.js';
import { Hooks } from './endpoints/hooks.js';
import { Teams } from './endpoints/teams.js';
import { IncompleteExecutions } from './endpoints/incomplete-executions.js';
import { Keys } from './endpoints/keys.js';
import { Connections } from './endpoints/connections.js';
import { Functions } from './endpoints/functions.js';
import { Organizations } from './endpoints/organizations.js';
import { Enums } from './endpoints/enums.js';
import { SDKApps } from './endpoints/sdk/apps.js';
import { SDKModules } from './endpoints/sdk/modules.js';
import { SDKConnections } from './endpoints/sdk/connections.js';
import { SDKFunctions } from './endpoints/sdk/functions.js';
import { SDKRPCs } from './endpoints/sdk/rpcs.js';
import { SDKWebhooks } from './endpoints/sdk/webhooks.js';
import { buildUrl, createMakeError, isAPIKey, MakeError } from './utils.js';
import type { FetchOptions, JSONValue, QueryValue } from './types.js';
import { VERSION } from './version.js';

/**
 * The main Make SDK class that provides access to all Make API endpoints.
 * Acts as the entry point for interacting with the Make API.
 */
export class Make {
    readonly #token: string;

    /**
     * The Make zone (e.g. eu1.make.com)
     * Identifies the region of the Make servers to connect to
     */
    public readonly zone: string;

    /**
     * Request Headers
     * Can be used to set custom headers for all requests
     */
    private readonly headers: Record<string, string>;

    /**
     * The API version to use
     * Default is version 2 of the Make API
     */
    public readonly version: number;

    /**
     * The protocol to use (defaults to https)
     * Can be changed to http for testing in local environments
     */
    public protocol: string;

    /**
     * Access to user-related endpoints
     * Provides methods to get current user information
     */
    public readonly users: Users;

    /**
     * Access to scenario-related endpoints
     * Scenarios allow you to create and run automation tasks
     */
    public readonly scenarios: Scenarios;

    /**
     * Access to blueprint-related endpoints
     * Blueprints define the structure and workflow of scenarios
     */
    public readonly blueprints: Blueprints;

    /**
     * Access to data store-related endpoints
     * Data stores allow you to store and retrieve data within Make
     */
    public readonly dataStores: DataStores;

    /**
     * Access to execution-related endpoints
     * Executions represent the running instances of scenarios
     */
    public readonly executions: Executions;

    /**
     * Access to data structure-related endpoints
     * Data structures define the structure of data being used in Make
     */
    public readonly dataStructures: DataStructures;

    /**
     * Access to folder-related endpoints
     * Folders help organize scenarios
     */
    public readonly folders: Folders;

    /**
     * Access to webhook-related endpoints
     * Hooks (webhooks and mailhooks) notify you when certain changes occur in connected apps or services
     */
    public readonly hooks: Hooks;

    /**
     * Access to team-related endpoints
     * Teams control access to Make scenarios, connections, data stores, and other resources
     */
    public readonly teams: Teams;

    /**
     * Access to incomplete execution-related endpoints
     * Incomplete executions are scenario runs that didn't complete successfully
     */
    public readonly incompleteExecutions: IncompleteExecutions;

    /**
     * Access to key-related endpoints
     * Keys store secrets that can be used in apps
     */
    public readonly keys: Keys;

    /**
     * Access to connection-related endpoints
     * Connections link Make to external apps and services
     */
    public readonly connections: Connections;

    /**
     * Access to function-related endpoints
     * Functions are custom code snippets that can be used in scenarios
     */
    public readonly functions: Functions;

    /**
     * Access to organization-related endpoints
     * Organizations are top-level entities that contain teams and manage overall account settings
     */
    public readonly organizations: Organizations;

    /**
     * Access to enum-related endpoints
     * Enums provide access to standardized lists like countries, regions, and timezones
     */
    public readonly enums: Enums;

    /**
     * Access to SDK-related endpoints
     */
    public readonly sdk: {
        /**
         * Access to App-related endpoints
         * Apps allow you to create and manage custom applications for Make
         */
        readonly apps: SDKApps;
        /**
         * Access to Module-related endpoints
         * Modules are the building blocks of apps
         */
        readonly modules: SDKModules;
        /**
         * Access to Connection-related endpoints
         * Connections manage authentication and authorization for apps
         */
        readonly connections: SDKConnections;
        /**
         * Access to Function-related endpoints
         * Functions are reusable code blocks within apps
         */
        readonly functions: SDKFunctions;
        /**
         * Access to RPC-related endpoints
         * RPCs are the building blocks of apps
         */
        readonly rpcs: SDKRPCs;
        /**
         * Access to Webhook-related endpoints
         * Webhooks are used to listen for external events in apps
         */
        readonly webhooks: SDKWebhooks;
    };

    /**
     * Create a new Make SDK instance
     * @param token Your Make API key or OAuth2 access token
     * @param zone The Make zone (e.g. eu1.make.com)
     * @param options Optional configuration
     * @param options.version API version to use (defaults to 2)
     * @param options.headers Custom headers to include in all requests
     */
    constructor(token: string, zone: string, options: { version?: number; headers?: Record<string, string> } = {}) {
        this.#token = token;
        this.zone = zone;
        this.version = options.version ?? 2;
        this.headers = options.headers ?? {};
        this.protocol = 'https';

        this.users = new Users(this.fetch.bind(this));
        this.scenarios = new Scenarios(this.fetch.bind(this));
        this.blueprints = new Blueprints(this.fetch.bind(this));
        this.dataStores = new DataStores(this.fetch.bind(this));
        this.executions = new Executions(this.fetch.bind(this));
        this.dataStructures = new DataStructures(this.fetch.bind(this));
        this.folders = new Folders(this.fetch.bind(this));
        this.hooks = new Hooks(this.fetch.bind(this));
        this.teams = new Teams(this.fetch.bind(this));
        this.incompleteExecutions = new IncompleteExecutions(this.fetch.bind(this));
        this.keys = new Keys(this.fetch.bind(this));
        this.connections = new Connections(this.fetch.bind(this));
        this.functions = new Functions(this.fetch.bind(this));
        this.organizations = new Organizations(this.fetch.bind(this));
        this.enums = new Enums(this.fetch.bind(this));
        this.sdk = {
            apps: new SDKApps(this.fetch.bind(this)),
            modules: new SDKModules(this.fetch.bind(this)),
            connections: new SDKConnections(this.fetch.bind(this)),
            functions: new SDKFunctions(this.fetch.bind(this)),
            rpcs: new SDKRPCs(this.fetch.bind(this)),
            webhooks: new SDKWebhooks(this.fetch.bind(this)),
        };
    }

    /**
     * Make API requests with authentication
     *
     * Handles URL construction, authentication, and error handling for all API calls.
     * This method is used internally by all endpoint classes.
     *
     * @template T The expected response type
     * @param url The endpoint URL (relative or absolute)
     * @param options Request options (method, headers, body, query parameters)
     * @returns Promise resolving to the parsed response data
     * @throws {MakeError} If the API returns an error response
     * @internal
     */
    public async fetch<T = unknown>(url: string, options?: FetchOptions): Promise<T> {
        const headers = this.prepareHeaders(options?.headers);
        const body = this.prepareBody(options?.body, headers);
        url = this.prepareURL(url, options?.query);

        const res = await this.handleRequest(url, {
            headers,
            body,
            method: options?.method,
        });
        if (res.status >= 400) {
            throw await this.handleError(res);
        }

        return this.handleResponse<T>(res);
    }

    /**
     * Prepare the request body for API calls
     *
     * @param body The request body - can be an object, string, or undefined
     * @param headers The headers object to potentially modify the content-type
     * @returns The body serialized as a string
     * @protected
     */
    protected prepareBody(
        body: Record<string, JSONValue> | Array<JSONValue> | string | undefined,
        headers: Record<string, string>,
    ): string {
        if (body && typeof body !== 'string') {
            headers['content-type'] = 'application/json';
            return JSON.stringify(body);
        }
        return body as string;
    }

    /**
     * Prepare headers for API requests
     *
     * @param headers Request-specific headers to prepare
     * @returns Headers object ready for the request
     * @protected
     */
    protected prepareHeaders(headers?: Record<string, string>): Record<string, string> {
        return {
            'user-agent': `MakeTypeScriptSDK/${VERSION}`,
            ...this.headers,
            authorization: `${isAPIKey(this.#token) ? 'Token' : 'Bearer'} ${this.#token}`,
            ...headers,
        };
    }

    /**
     * Prepare the full URL for API requests
     *
     * @param url The URL - can be relative or absolute
     * @param query Query parameters to append
     * @returns The complete URL ready for the request
     * @protected
     */
    protected prepareURL(url: string, query?: Record<string, QueryValue>): string {
        if (url.charAt(0) === '/') {
            if (url.charAt(1) === '/') {
                url = `${this.protocol}:${url}`;
            } else {
                url = `${this.protocol}://${this.zone}/api/v${this.version}${url}`;
            }
        }
        return this.prepareQuery(url, query);
    }

    /**
     * Add query parameters to a URL
     *
     * @param url The base URL
     * @param query Query parameters to append
     * @returns The URL with query parameters appended
     * @protected
     */
    protected prepareQuery(url: string, query?: Record<string, QueryValue>): string {
        if (!query) return url;
        return buildUrl(url, query);
    }

    /**
     * Execute the HTTP request
     *
     * Makes the actual fetch request with the provided URL and options.
     * This method can be overridden in subclasses for custom request handling.
     *
     * @param url The complete URL to request
     * @param options Fetch options including headers, body, and method
     * @returns Promise resolving to the Response object
     * @protected
     */
    protected async handleRequest(url: string, options?: RequestInit): Promise<Response> {
        return fetch(url, options);
    }

    /**
     * Handle API error responses
     *
     * Converts error responses into MakeError instances with proper error details.
     * This method processes the response body to extract error information.
     *
     * @param response The error response from the API
     * @returns Promise resolving to a MakeError instance
     * @protected
     */
    protected async handleError(response: Response): Promise<MakeError> {
        return await createMakeError(response);
    }

    /**
     * Handle successful API responses
     *
     * Parses the response based on content-type header.
     * JSON responses are parsed as objects, other responses as text.
     *
     * @template T The expected response type
     * @param response The successful response from the API
     * @returns Promise resolving to the parsed response data
     * @protected
     */
    protected async handleResponse<T>(response: Response): Promise<T> {
        const contentType: string = response.headers.get('content-type');
        const isJsonType: boolean = contentType === 'application/json' || contentType?.startsWith('application/json;') //prevent application/jsonc to be parsed as json

        const result = isJsonType ? await response.json() : await response.text();
        return result as T;
    }
}
