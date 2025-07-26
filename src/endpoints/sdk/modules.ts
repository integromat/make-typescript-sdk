import type { FetchFunction, JSONValue } from '../../types.js';

/**
 * Module
 */
export type Module = {
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
export type ModuleSection = Record<string, JSONValue>;

/**
 * Available module section types
 */
export type ModuleSectionType = 'api' | 'epoch' | 'parameters' | 'expect' | 'interface' | 'samples' | 'scope';

/**
 * Body for creating a new module
 */
export type CreateModuleBody = {
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
export type UpdateModuleBody = {
    /** The label of the module visible in the scenario builder */
    label?: string;
    /** The description of the module */
    description?: string;
    /** Connection name */
    connection?: string;
};

/**
 * Body for setting a module section
 */
export type SetModuleSectionBody = ModuleSection;

/**
 * Internal response types (not exported)
 */
type ListModulesResponse = {
    appModules: Module[];
};

type GetModuleResponse = {
    appModule: Module;
};

type CreateModuleResponse = {
    appModule: Module;
};

type UpdateModuleResponse = {
    appModule: Module;
};

type DeleteModuleResponse = {
    appModule: string;
};

/**
 * Class providing methods for working with App Modules
 */
export class Modules {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List modules for the app with optional filtering
     */
    async list(appName: string, appVersion: number): Promise<Module[]> {
        const response = await this.#fetch<ListModulesResponse>(`/sdk/apps/${appName}/${appVersion}/modules`);
        return response.appModules;
    }

    /**
     * Get a single module by name
     */
    async get(appName: string, appVersion: number, moduleName: string): Promise<Module> {
        const response = await this.#fetch<GetModuleResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`,
        );
        return response.appModule;
    }

    /**
     * Create a new module
     */
    async create(appName: string, appVersion: number, body: CreateModuleBody): Promise<Module> {
        const response = await this.#fetch<CreateModuleResponse>(`/sdk/apps/${appName}/${appVersion}/modules`, {
            method: 'POST',
            body,
        });
        return response.appModule;
    }

    /**
     * Update an existing module
     */
    async update(appName: string, appVersion: number, moduleName: string, body: UpdateModuleBody): Promise<Module> {
        const response = await this.#fetch<UpdateModuleResponse>(
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
        await this.#fetch<DeleteModuleResponse>(`/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`, {
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
        section: ModuleSectionType,
    ): Promise<ModuleSection> {
        const response = await this.#fetch<ModuleSection>(
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
        section: ModuleSectionType,
        body: SetModuleSectionBody,
    ): Promise<ModuleSection> {
        const response = await this.#fetch<ModuleSection>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/${section}`,
            {
                method: 'PUT',
                body,
            },
        );
        return response;
    }
}
