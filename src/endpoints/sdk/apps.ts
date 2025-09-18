import type { FetchFunction, PickColumns, JSONValue } from '../../types.js';
import { JSONStringifyIfNotString } from '../../utils.js';

/**
 * App
 */
export type SDKApp = {
    /** The name of the app visible in the URL */
    name: string;
    /** The label of the app visible in the scenario builder */
    label: string;
    /** The description of the app */
    description: string;
    /** The version of the app */
    version: number;
    /** Whether the app is in beta */
    beta: boolean;
    /** The color of the app logo */
    theme: string;
    /** The language of the app */
    language: string;
    /** Whether the app is public */
    public: boolean;
    /** Whether the app is approved */
    approved: boolean;
    /** Whether the app is global */
    global: boolean;
    /** Countries where the app is available */
    countries: string[] | null;
    /** When the app was created */
    created: string;
    /** The manifest version */
    manifestVersion: number;
    /** Stack of changes made to the app */
    changes?: unknown[];
};

/**
 * App section data structure
 * Represents configuration for different app sections like base, groups, install, installSpec
 */
export type SDKAppSection = string;

/**
 * Available app section types
 */
export type SDKAppSectionType = 'base' | 'groups' | 'install' | 'installSpec';

/**
 * App common data structure
 * Contains sensitive information like API keys or secrets shared across all modules
 */
export type SDKAppCommon = Record<string, JSONValue>;

/**
 * Options for listing apps with generic column selection
 */
export type ListSDKAppsOptions<C extends keyof SDKApp = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
    /** If set to true, returns all apps available to all users */
    all?: boolean;
};

/**
 * Options for getting a single app with generic column selection
 */
export type GetSDKAppsOptions<C extends keyof SDKApp = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
};

/**
 * Body for creating a new app
 */
export type CreateSDKAppBody = {
    /** The name of the app visible in the URL */
    name: string;
    /** The label of the app visible in the scenario builder */
    label: string;
    /** The description of the app */
    description?: string;
    /** The color of the app logo */
    theme?: string;
    /** The language of the app */
    language?: string;
    /** Countries where the app is available */
    countries?: string[];
    /** Whether the app is private */
    private?: boolean;
    /** Audience setting for the app */
    audience: string;
};

/**
 * Body for updating an app
 */
export type UpdateSDKAppBody = {
    /** The label of the app visible in the scenario builder */
    label?: string;
    /** The description of the app */
    description?: string;
    /** The color of the app logo */
    theme?: string;
    /** The language of the app */
    language?: string;
    /** Countries where the app is available */
    countries?: string[];
    /** Audience setting */
    audience?: string;
};

/**
 * Response for set operations
 */
type SetSDKAppResponse = {
    /** Whether the operation changed data */
    changed: boolean;
};

/**
 * Internal response types (not exported)
 */
type ListSDKAppsResponse<C extends keyof SDKApp = never> = {
    apps: PickColumns<SDKApp, C>[];
};

type GetSDKAppResponse<C extends keyof SDKApp = never> = {
    app: PickColumns<SDKApp, C>;
};

type CreateSDKAppResponse = {
    app: Pick<SDKApp, 'name' | 'label' | 'description' | 'version' | 'theme' | 'public' | 'approved'>;
};

type UpdateSDKAppResponse = {
    app: Pick<SDKApp, 'name' | 'label' | 'description' | 'version' | 'theme' | 'public' | 'approved'>;
};

/**
 * Class providing methods for working with Apps
 */
export class SDKApps {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List apps with optional filtering
     */
    async list<C extends keyof SDKApp = never>(options: ListSDKAppsOptions<C> = {}): Promise<PickColumns<SDKApp, C>[]> {
        const response = await this.#fetch<ListSDKAppsResponse<C>>('/sdk/apps', {
            query: options,
        });
        return response.apps;
    }

    /**
     * Get a single app by name and version
     */
    async get<C extends keyof SDKApp = never>(
        name: string,
        version: number,
        options: GetSDKAppsOptions<C> = {},
    ): Promise<PickColumns<SDKApp, C>> {
        const response = await this.#fetch<GetSDKAppResponse<C>>(`/sdk/apps/${name}/${version}`, {
            query: options,
        });
        return response.app;
    }

    /**
     * Create a new app
     */
    async create(body: CreateSDKAppBody): Promise<CreateSDKAppResponse['app']> {
        const response = await this.#fetch<CreateSDKAppResponse>('/sdk/apps', {
            method: 'POST',
            body,
        });
        return response.app;
    }

    /**
     * Update an existing app
     */
    async update(name: string, version: number, body: UpdateSDKAppBody): Promise<UpdateSDKAppResponse['app']> {
        const response = await this.#fetch<UpdateSDKAppResponse>(`/sdk/apps/${name}/${version}`, {
            method: 'PATCH',
            body,
        });
        return response.app;
    }

    /**
     * Delete an app
     */
    async delete(name: string, version: number): Promise<void> {
        await this.#fetch(`/sdk/apps/${name}/${version}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get a specific section of an app
     * Available sections: base, groups, install, installSpec
     */
    async getSection(name: string, version: number, section: SDKAppSectionType): Promise<SDKAppSection> {
        const response = await this.#fetch<SDKAppSection>(`/sdk/apps/${name}/${version}/${section}`);
        return response;
    }

    /**
     * Set/update a specific section of an app
     * Available sections: base, groups, install, installSpec
     */
    async setSection(name: string, version: number, section: SDKAppSectionType, body: SDKAppSection): Promise<void> {
        await this.#fetch(`/sdk/apps/${name}/${version}/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/jsonc',
            },
            body: JSONStringifyIfNotString(body),
        });
    }

    /**
     * Get app documentation (readme)
     */
    async getDocs(name: string, version: number): Promise<string> {
        const response = await this.#fetch<string>(`/sdk/apps/${name}/${version}/readme`);
        return response;
    }

    /**
     * Set app documentation (readme)
     */
    async setDocs(name: string, version: number, docs: string): Promise<boolean> {
        const response = await this.#fetch<SetSDKAppResponse>(`/sdk/apps/${name}/${version}/readme`, {
            method: 'PUT',
            body: docs,
            headers: {
                'Content-Type': 'text/markdown',
            },
        });
        return response.changed;
    }

    /**
     * Get app common data (client credentials and shared configuration)
     */
    async getCommon(name: string, version: number): Promise<SDKAppCommon> {
        const response = await this.#fetch<SDKAppCommon>(`/sdk/apps/${name}/${version}/common`);
        return response;
    }

    /**
     * Set app common data (client credentials and shared configuration)
     */
    async setCommon(name: string, version: number, common: SDKAppCommon): Promise<boolean> {
        const response = await this.#fetch<SetSDKAppResponse>(`/sdk/apps/${name}/${version}/common`, {
            method: 'PUT',
            body: common,
        });
        return response.changed;
    }
}
