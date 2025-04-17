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
import { buildUrl, createMakeError, isAPIKey } from './utils.js';
import type { FetchOptions } from './types.js';
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
     * Create a new Make SDK instance
     * @param token Your Make API key or OAuth2 access token
     * @param zone The Make zone (e.g. eu1.make.com)
     * @param version API version to use (defaults to 2)
     */
    constructor(token: string, zone: string, version = 2) {
        this.#token = token;
        this.zone = zone;
        this.version = version;
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
        options = Object.assign({}, options, {
            headers: Object.assign({}, options?.headers, {
                'user-agent': `MakeTypeScriptSDK/${VERSION}`,
                authorization: `${isAPIKey(this.#token) ? 'Token' : 'Bearer'} ${this.#token}`,
            }),
        });

        if (url.charAt(0) === '/') {
            if (url.charAt(1) === '/') {
                url = `${this.protocol}:${url}`;
            } else {
                url = `${this.protocol}://${this.zone}/api/v${this.version}${url}`;
            }
        }

        if (options?.body && typeof options.body !== 'string') {
            options.body = JSON.stringify(options.body);
            options.headers = Object.assign(options!.headers!, {
                'content-type': 'application/json',
            });
        }

        if (options?.query) {
            url = buildUrl(url, options.query);
        }

        const res = await fetch(url, {
            headers: options?.headers,
            body: options?.body as string,
            method: options?.method,
        });
        if (res.status >= 400) {
            throw await createMakeError(res);
        }

        const contentType = res.headers.get('content-type');
        const result = contentType?.includes('application/json') ? await res.json() : await res.text();
        return result as T;
    }
}
