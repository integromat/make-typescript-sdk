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
 * Module types available in Make
 */
export type ModuleType = 'trigger' | 'action' | 'search' | 'instant_trigger' | 'responder' | 'universal';

/**
 * Body for cloning a module
 */
export type CloneModuleBody = {
    /** Target module name */
    targetName: string;
    /** Optional new label */
    label?: string;
    /** Optional new description */
    description?: string;
    /** Whether to copy connection settings */
    copyConnection?: boolean;
};

/**
 * Module test result
 */
export type ModuleTestResult = {
    /** Whether the test was successful */
    success: boolean;
    /** Test duration in milliseconds */
    duration: number;
    /** Test result message */
    message?: string;
    /** Module ID that was tested */
    moduleId: string;
    /** Module type */
    moduleType: string;
    /** Input validation result */
    inputValidation?: ModuleValidationResult;
    /** Output validation result */
    outputValidation?: ModuleValidationResult;
    /** Performance metrics */
    performanceMetrics?: PerformanceMetrics;
    /** Test execution logs */
    logs?: string[];
};

/**
 * Module validation result
 */
export type ModuleValidationResult = {
    /** Whether validation passed */
    isValid: boolean;
    /** Validation errors */
    errors: ValidationError[];
    /** Validation warnings */
    warnings: ValidationWarning[];
    /** Validation score (0-100) */
    score: number;
};

/**
 * Performance metrics for module execution
 */
export type PerformanceMetrics = {
    /** Response time in milliseconds */
    responseTime: number;
    /** Memory usage in MB */
    memoryUsage: number;
    /** CPU usage percentage */
    cpuUsage: number;
    /** Number of network calls made */
    networkCalls: number;
    /** Cache hits if applicable */
    cacheHits?: number;
    /** Cache misses if applicable */
    cacheMisses?: number;
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

type CloneModuleResponse = {
    module: SDKModule;
};

type ModuleTestResponse = {
    test: ModuleTestResult;
};

type ChangeModuleTypeResponse = {
    module: SDKModule;
};

type SetVisibilityResponse = {
    module: SDKModule;
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

    /**
     * Clone module to new name within the same app version
     */
    async cloneModule(
        appName: string,
        appVersion: number,
        sourceModuleName: string,
        cloneData: CloneModuleBody,
    ): Promise<SDKModule> {
        const response = await this.#fetch<CloneModuleResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${sourceModuleName}/clone`,
            {
                method: 'POST',
                body: cloneData,
            },
        );
        return response.module;
    }

    /**
     * Change module type (trigger, action, search, etc.)
     */
    async changeModuleType(
        appName: string,
        appVersion: number,
        moduleName: string,
        newType: ModuleType,
    ): Promise<SDKModule> {
        const response = await this.#fetch<ChangeModuleTypeResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/type`,
            {
                method: 'PUT',
                body: { type: newType },
            },
        );
        return response.module;
    }

    /**
     * Set module visibility (public/private)
     */
    async setModuleVisibility(
        appName: string,
        appVersion: number,
        moduleName: string,
        isPublic: boolean,
    ): Promise<SDKModule> {
        const response = await this.#fetch<SetVisibilityResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/visibility`,
            {
                method: 'PUT',
                body: { public: isPublic },
            },
        );
        return response.module;
    }

    /**
     * Test module functionality with optional test data
     */
    async testModule(
        appName: string,
        appVersion: number,
        moduleName: string,
        testData?: any,
    ): Promise<ModuleTestResult> {
        const response = await this.#fetch<ModuleTestResponse>(
            `/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/test`,
            {
                method: 'POST',
                body: testData ? { testData } : undefined,
            },
        );
        return response.test;
    }
}
