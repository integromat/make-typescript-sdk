import type { FetchFunction } from '../../types.js';
import { JSONStringifyIfNotString } from '../../utils.js';

/**
 * Module
 */
export type SDKModule = {
    /** The name of the module */
    name: string;
    /** The label of the module visible in the scenario builder */
    label: string;
    /** The description of the module */
    description: string;
    /** The type ID of the module */
    typeId: number;
    /** Whether the module is public */
    public: boolean;
    /** Whether the module is approved */
    approved: boolean;
    /** CRUD operation type if applicable */
    crud: string | null;
    /** Connection name if applicable */
    connection: string | null;
    /** Alternative connection name if applicable */
    altConnection: string | null;
    /** Webhook configuration if applicable */
    webhook: string | null;
};

/**
 * Module section data structure
 * Represents configuration for different module sections like api, epoch, parameters, etc.
 */
export type SDKModuleSection = string;

/**
 * Available module section types
 */
export type SDKModuleSectionType = 'api' | 'epoch' | 'parameters' | 'expect' | 'interface' | 'samples' | 'scope';

/**
 * Body for creating a new module
 */
export type CreateSDKModuleBody = {
    /** The name of the module */
    name: string;
    /** The type ID of the module */
    typeId: number;
    /** The label of the module visible in the scenario builder */
    label: string;
    /** The description of the module */
    description: string;
    /** Module initialization mode */
    moduleInitMode?: 'blank' | 'example' | 'module';
};

/**
 * Body for updating a module
 */
export type UpdateSDKModuleBody = {
    /** The label of the module visible in the scenario builder */
    label?: string;
    /** The description of the module */
    description?: string;
    /** Connection name */
    connection?: string;
};

/**
 * Internal response types (not exported)
 */
type ListSDKModulesResponse = {
    appModules: SDKModule[];
};

type GetSDKModuleResponse = {
    appModule: SDKModule;
};

type CreateSDKModuleResponse = {
    appModule: SDKModule;
};

type UpdateSDKModuleResponse = {
    appModule: SDKModule;
};

/**
 * Class providing methods for working with App Modules
 */
export class SDKModules {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List modules for the app with optional filtering
     */
    async list(appName: string, appVersion: number): Promise<SDKModule[]> {
        const response = await this.#fetch<ListSDKModulesResponse>(`/sdk/apps/${appName}/${appVersion}/modules`);
        return response.appModules;
    }

    /**
     * Get a single module by name
     */
    async get(appName: string, appVersion: number, moduleName: string): Promise<SDKModule> {
        const response = await this.#fetch<GetSDKModuleResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`,
        );
        return response.appModule;
    }

    /**
     * Create a new module
     */
    async create(appName: string, appVersion: number, body: CreateSDKModuleBody): Promise<SDKModule> {
        const response = await this.#fetch<CreateSDKModuleResponse>(`/sdk/apps/${appName}/${appVersion}/modules`, {
            method: 'POST',
            body,
        });
        return response.appModule;
    }

    /**
     * Update an existing module
     */
    async update(
        appName: string,
        appVersion: number,
        moduleName: string,
        body: UpdateSDKModuleBody,
    ): Promise<SDKModule> {
        const response = await this.#fetch<UpdateSDKModuleResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`,
            {
                method: 'PATCH',
                body,
            },
        );
        return response.appModule;
    }

    /**
     * Delete a module
     */
    async delete(appName: string, appVersion: number, moduleName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get a specific section of a module
     * Available sections: api, epoch, parameters, expect, interface, samples, scope
     */
    async getSection(
        appName: string,
        appVersion: number,
        moduleName: string,
        section: SDKModuleSectionType,
    ): Promise<SDKModuleSection> {
        const response = await this.#fetch<SDKModuleSection>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/${section}`,
        );
        return response;
    }

    /**
     * Set/update a specific section of a module
     * Available sections: api, epoch, parameters, expect, interface, samples, scope
     */
    async setSection(
        appName: string,
        appVersion: number,
        moduleName: string,
        section: SDKModuleSectionType,
        body: SDKModuleSection,
    ): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/jsonc',
            },
            body: JSONStringifyIfNotString(body),
        });
    }
}
