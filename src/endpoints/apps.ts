import type { FetchFunction } from '../types.js';

/**
 * Represents a module with its credential requirements for an app.
 */
export type AppModule = {
    /** Unique identifier for the module credential configuration */
    id: string;
    /** The technical name of the module */
    name: string;
    /** Human-readable display name of the module */
    label: string;
    /** The credential type required by the module (e.g., account:slack2) */
    type: string;
    /** List of OAuth scopes required by this module */
    scope: string[];
    /** Indicates whether this module is a hook-based trigger */
    hook: boolean;
};

/**
 * Response format for listing app modules with credentials.
 */
type ListAppModulesWithCredentialsResponse = {
    appModules: AppModule[];
};

/**
 * Class providing methods for working with Make apps (IMT).
 */
export class Apps {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all modules with credential requirements for a specific app and version.
     * @param appName The name of the app. For custom/SDK apps, use the `app#` prefix.
     * @param version The major version of the app, or 'latest' for the most recent version.
     * @returns Promise with the list of app modules and their credential requirements
     */
    async listModulesWithCredentials(appName: string, version: number | 'latest'): Promise<AppModule[]> {
        const encodedName = encodeURIComponent(appName);
        const response = await this.#fetch<ListAppModulesWithCredentialsResponse>(
            `/imt/apps/${encodedName}/${version}/modules-with-credentials`,
        );
        return response.appModules;
    }
}
