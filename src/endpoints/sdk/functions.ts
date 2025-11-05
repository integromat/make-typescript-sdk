import type { FetchFunction } from '../../types.js';

/**
 * SDK Function definition with name and args information
 */
export type SDKFunction = {
    /** The name of the function */
    name: string;
    /** The function arguments signature */
    args: string;
};

/**
 * Body for creating a new SDK function
 */
export type CreateSDKFunctionBody = {
    /** The name of the function */
    name: string;
};

/**
 * Change object for code operations
 */
export type SDKFunctionChange = Record<string, unknown>;

/**
 * Test result for function operations
 */
export type SDKFunctionTestResult = {
    /** Whether the test changed */
    changed: boolean;
};

/**
 * Internal response types (not exported)
 */
type ListSDKFunctionsResponse = {
    appFunctions: SDKFunction[];
};

type GetSDKFunctionResponse = {
    appFunction: Pick<SDKFunction, 'name'>;
};

type CreateSDKFunctionResponse = {
    appFunction: Pick<SDKFunction, 'name'>;
};

/**
 * Class providing methods for working with SDK App Functions
 */
export class SDKFunctions {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List functions for the app
     */
    async list(appName: string, appVersion: number): Promise<SDKFunction[]> {
        const response = await this.#fetch<ListSDKFunctionsResponse>(`/sdk/apps/${appName}/${appVersion}/functions`);
        return response.appFunctions;
    }

    /**
     * Get a single function by name
     */
    async get(appName: string, appVersion: number, functionName: string): Promise<Pick<SDKFunction, 'name'>> {
        const response = await this.#fetch<GetSDKFunctionResponse>(
            `/sdk/apps/${appName}/${appVersion}/functions/${functionName}`,
        );
        return response.appFunction;
    }

    /**
     * Create a new function
     */
    async create(appName: string, appVersion: number, body: CreateSDKFunctionBody): Promise<Pick<SDKFunction, 'name'>> {
        const response = await this.#fetch<CreateSDKFunctionResponse>(`/sdk/apps/${appName}/${appVersion}/functions`, {
            method: 'POST',
            body,
        });
        return response.appFunction;
    }

    /**
     * Delete a function
     */
    async delete(appName: string, appVersion: number, functionName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/functions/${functionName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get function code
     */
    async getCode(appName: string, appVersion: number, functionName: string): Promise<string> {
        const response = await this.#fetch<string>(
            `/sdk/apps/${appName}/${appVersion}/functions/${functionName}/code`,
            {
                headers: {
                    accept: 'text/plain',
                },
            },
        );
        return response;
    }

    /**
     * Set/update function code
     */
    async setCode(appName: string, appVersion: number, functionName: string, code: string): Promise<void> {
        await this.#fetch(`/sdk/apps/${appName}/${appVersion}/functions/${functionName}/code`, {
            method: 'PUT',
            body: code,
            headers: {
                'content-type': 'application/javascript',
            },
        });
    }

    /**
     * Get function test code
     */
    async getTest(appName: string, appVersion: number, functionName: string): Promise<string> {
        const response = await this.#fetch<string>(
            `/sdk/apps/${appName}/${appVersion}/functions/${functionName}/test`,
            {
                headers: {
                    accept: 'text/plain',
                },
            },
        );
        return response;
    }

    /**
     * Set/update function test code
     */
    async setTest(appName: string, appVersion: number, functionName: string, test: string): Promise<boolean> {
        const response = await this.#fetch<SDKFunctionTestResult>(
            `/sdk/apps/${appName}/${appVersion}/functions/${functionName}/test`,
            {
                method: 'PUT',
                body: test,
                headers: {
                    'content-type': 'application/javascript',
                },
            },
        );
        return response.changed;
    }

    /**
     * Test function execution with context
     */
    async testFunction(appName: string, appVersion: number, functionName: string, context?: any): Promise<any> {
        const response = await this.#fetch(`/sdk/apps/${appName}/${appVersion}/functions/${functionName}/execute`, {
            method: 'POST',
            body: context ? { context } : undefined,
        });
        return response;
    }

    /**
     * Validate function configuration and code
     */
    async validateFunction(appName: string, appVersion: number, functionName: string): Promise<any> {
        const response = await this.#fetch(`/sdk/apps/${appName}/${appVersion}/functions/${functionName}/validate`, {
            method: 'POST',
        });
        return response;
    }

    /**
     * Execute function with parameters
     */
    async executeFunction(appName: string, appVersion: number, functionName: string, params: any): Promise<any> {
        const response = await this.#fetch(`/sdk/apps/${appName}/${appVersion}/functions/${functionName}/run`, {
            method: 'POST',
            body: { params },
        });
        return response;
    }
}
