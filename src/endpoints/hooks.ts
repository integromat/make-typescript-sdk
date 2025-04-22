import type { FetchFunction, JSONValue, Pagination } from '../types.js';

/**
 * Represents a Make webhook or mailhook.
 * Hooks notify you whenever a certain change occurs in the connected app or service,
 * such as sending an HTTP request or an email.
 */
export type Hook = {
    /** Unique identifier of the hook */
    id: number;
    /** Name of the hook */
    name: string;
    /** ID of the team that owns the hook */
    teamId: number;
    /** Unique identifier used in webhook URLs */
    udid: string;
    /** Type of hook (web, web-shared, or mail) */
    type: 'web' | 'web-shared' | 'mail';
    /** Name of the app this hook is for */
    packageName: string | null;
    /** Theme color for the hook in UI */
    theme: string;
    /** Whether the hook can be edited */
    editable: boolean;
    /** Current number of items in the hook's queue */
    queueCount: number;
    /** Maximum number of items allowed in the queue */
    queueLimit: number;
    /** Whether the hook is enabled */
    enabled: boolean;
    /** Whether the hook is no longer accessible */
    gone: boolean;
    /** The hook type name related to the app for which it was created */
    typeName: string;
    /** Additional data specific to the hook type */
    data: Record<string, JSONValue>;
    /** ID of the scenario associated with this hook, if any */
    scenarioId?: number;
    /** The webhook URL that receives callbacks */
    url?: string;
};

/**
 * Response format for listing hooks.
 */
type ListHooksResponse = {
    /** List of hooks matching the query */
    hooks: Hook[];
};

/**
 * Parameters for creating a new hook.
 */
export type CreateHookBody = {
    /** Name of the hook (max 128 characters) */
    name: string;
    /** ID of the team where the hook will be created */
    teamId: number;
    /** The hook type related to the app for which it will be created */
    typeName: string;
    /** Additional data specific to the hook type */
    data?: Record<string, JSONValue>;
};

/**
 * Response format for creating a hook.
 */
type CreateHookResponse = {
    /** The created hook */
    hook: Hook;
};

/**
 * Response format for renaming a hook.
 */
type RenameHookResponse = {
    /** The renamed hook */
    hook: Hook;
};

/**
 * Parameters for updating a hook.
 */
export type UpdateHookBody = {
    /** New data configuration for the hook */
    data?: Record<string, JSONValue>;
};

/**
 * Response format for updating a hook.
 */
type UpdateHookResponse = {
    /** Whether the hook was changed */
    changed: boolean;
};

/**
 * Response format for getting a hook.
 */
type GetHookResponse = {
    /** The requested hook */
    hook: Hook;
};

/**
 * Represents the status of a hook ping operation.
 */
export type HookPing = {
    /** The URL address of the hook */
    address: string;
    /** Whether the hook is attached to a scenario */
    attached: boolean;
    /** Whether the hook is in learning mode */
    learning: boolean;
    /** Whether the hook is unreachable/gone */
    gone: boolean;
};

/**
 * Response format for pinging a hook.
 */
type PingHookResponse = HookPing;

/**
 * Options for listing hooks.
 */
export type ListHooksOptions = {
    /** Filter hooks by their type name */
    typeName?: string;
    /** Filter hooks by whether they are assigned to a scenario */
    assigned?: boolean;
    /** View hooks in context of a specific scenario */
    viewForScenarioId?: number;
    /** Pagination options */
    pg?: Partial<Pagination<Hook>>;
};

/**
 * Class providing methods for working with Make hooks.
 * Hooks refer to the webhooks and mailhooks available in Make that notify you
 * whenever a certain change occurs in the connected app or service.
 */
export class Hooks {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Hooks instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all hooks for a team.
     * @param teamId The team ID to filter hooks by
     * @param options Optional parameters for filtering
     * @returns Promise with the list of hooks
     */
    async list(teamId: number, options?: ListHooksOptions): Promise<Hook[]> {
        return (
            await this.#fetch<ListHooksResponse>('/hooks', {
                query: {
                    teamId,
                    typeName: options?.typeName,
                    assigned: options?.assigned,
                    viewForScenarioId: options?.viewForScenarioId,
                    pg: options?.pg,
                },
            })
        ).hooks;
    }

    /**
     * Create a new hook.
     * @param body The hook configuration to create
     * @returns Promise with the created hook
     */
    async create(body: CreateHookBody): Promise<Hook> {
        return (
            await this.#fetch<CreateHookResponse>('/hooks', {
                method: 'POST',
                body: Object.assign({}, body.data, {
                    name: body.name,
                    teamId: body.teamId,
                    typeName: body.typeName,
                }),
            })
        ).hook;
    }

    /**
     * Get hook details.
     * @param hookId The hook ID to get details for
     * @returns Promise with the hook details
     */
    async get(hookId: number): Promise<Hook> {
        return (await this.#fetch<GetHookResponse>(`/hooks/${hookId}`)).hook;
    }

    /**
     * Rename a hook.
     * @param hookId The hook ID to rename
     * @param name The new name for the hook
     * @returns Promise with the updated hook
     */
    async rename(hookId: number, name: string): Promise<Hook> {
        return (
            await this.#fetch<RenameHookResponse>(`/hooks/${hookId}`, {
                method: 'PATCH',
                body: {
                    name,
                },
            })
        ).hook;
    }

    /**
     * Update a hook's configuration data.
     * @param hookId The hook ID to update
     * @param body The updated hook configuration
     * @returns Promise with a boolean indicating success
     */
    async update(hookId: number, body: UpdateHookBody): Promise<boolean> {
        return (
            await this.#fetch<UpdateHookResponse>(`/hooks/${hookId}/set-data`, {
                method: 'POST',
                body: body.data,
            })
        ).changed;
    }

    /**
     * Delete a hook.
     * @param hookId The hook ID to delete
     */
    async delete(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
    }

    /**
     * Ping a hook to check its status.
     * @param hookId The hook ID to ping
     * @returns Promise with the ping status
     */
    async ping(hookId: number): Promise<HookPing> {
        return await this.#fetch<PingHookResponse>(`/hooks/${hookId}/ping`);
    }

    /**
     * Enable a hook.
     * @param hookId The hook ID to enable
     */
    async enable(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/enable`, {
            method: 'POST',
        });
    }

    /**
     * Disable a hook.
     * @param hookId The hook ID to disable
     */
    async disable(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/disable`, {
            method: 'POST',
        });
    }

    /**
     * Start learning mode for a hook.
     * Learning mode helps analyze incoming data structure
     * @param hookId The hook ID to start learning mode for
     */
    async learnStart(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/learn-start`, {
            method: 'POST',
        });
    }

    /**
     * Stop learning mode for a hook.
     * @param hookId The hook ID to stop learning mode for
     */
    async learnStop(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/learn-stop`, {
            method: 'POST',
        });
    }
}
