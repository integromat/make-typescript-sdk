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
import { buildUrl, createMakeError } from './utils.js';
import type { FetchOptions } from './types.js';
import { VERSION } from './version.js';
/**
 * The main Make SDK class that provides access to all Make API endpoints.
 */
export class Make {
    readonly #apiKey: string;
    /** The Make zone (e.g. eu1.make.com) */
    public readonly zone: string;
    /** The API version to use */
    public readonly version: number;
    /** The protocol to use (defaults to https) */
    public protocol: string;

    /** Access to user-related endpoints */
    public readonly users: Users;
    /** Access to scenario-related endpoints */
    public readonly scenarios: Scenarios;
    /** Access to blueprint-related endpoints */
    public readonly blueprints: Blueprints;
    /** Access to data store-related endpoints */
    public readonly dataStores: DataStores;
    /** Access to execution-related endpoints */
    public readonly executions: Executions;
    /** Access to data structure-related endpoints */
    public readonly dataStructures: DataStructures;
    /** Access to folder-related endpoints */
    public readonly folders: Folders;
    /** Access to webhook-related endpoints */
    public readonly hooks: Hooks;
    /** Access to team-related endpoints */
    public readonly teams: Teams;
    /** Access to incomplete execution-related endpoints */
    public readonly incompleteExecutions: IncompleteExecutions;
    /** Access to API key-related endpoints */
    public readonly keys: Keys;
    /** Access to connection-related endpoints */
    public readonly connections: Connections;
    /** Access to function-related endpoints */
    public readonly functions: Functions;

    /**
     * Create a new Make SDK instance
     * @param apiKey Your Make API key
     * @param zone The Make zone (e.g. eu1.make.com)
     * @param version API version to use (defaults to 2)
     */
    constructor(apiKey: string, zone: string, version = 2) {
        this.#apiKey = apiKey;
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
    }

    /**
     * Internal method to make API requests
     * @internal
     */
    public async fetch<T = unknown>(url: string, options?: FetchOptions): Promise<T> {
        options = Object.assign({}, options, {
            headers: Object.assign({}, options?.headers, {
                'user-agent': `MakeTypeScriptSDK/${VERSION}`,
                authorization: `Token ${this.#apiKey}`,
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
        return result;
    }
}
