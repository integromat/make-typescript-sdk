import type { FetchFunction, JSONValue } from '../types.js';

export type Hook = {
    id: number;
    name: string;
    teamId: number;
    udid: string;
    type: 'web' | 'web-shared' | 'mail';
    packageName: string | null;
    theme: string;
    editable: boolean;
    queueCount: number;
    queueLimit: number;
    enabled: boolean;
    gone: boolean;
    typeName: string;
    data: Record<string, JSONValue>;
    scenarioId?: number;
    url?: string;
};

type ListHooksResponse = {
    hooks: Hook[];
};

export type CreateHookBody = {
    name: string;
    teamId: number;
    typeName: string;
    data?: Record<string, JSONValue>;
};

type CreateHookResponse = {
    hook: Hook;
};

type RenameHookResponse = {
    hook: Hook;
};

export type UpdateHookBody = {
    data?: Record<string, JSONValue>;
};

type UpdateHookResponse = {
    changed: boolean;
};

type GetHookResponse = {
    hook: Hook;
};

export type HookPing = {
    address: string;
    attached: boolean;
    learning: boolean;
    gone: boolean;
};

type PingHookResponse = HookPing;

export type ListHooksOptions = {
    typeName?: string;
    assigned?: boolean;
    viewForScenarioId?: number;
};

export class Hooks {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all hooks for a team
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
                },
            })
        ).hooks;
    }

    /**
     * Create a new hook
     * @param body The hook data to create
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
     * Get hook details
     * @param hookId The hook ID to get details for
     * @returns Promise with the hook details
     */
    async get(hookId: number): Promise<Hook> {
        return (await this.#fetch<GetHookResponse>(`/hooks/${hookId}`)).hook;
    }

    /**
     * Update a hook
     * @param hookId The hook ID to update
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
     * Update a hook
     * @param hookId The hook ID to update
     * @param body The hook data to update
     * @returns Promise with the updated hook
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
     * Delete a hook
     * @param hookId The hook ID to delete
     * @returns Promise with void
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
     * Ping a hook
     * @param hookId The hook ID to ping
     * @returns Promise with the ping response
     */
    async ping(hookId: number): Promise<HookPing> {
        return await this.#fetch<PingHookResponse>(`/hooks/${hookId}/ping`);
    }

    /**
     * Enable a hook
     * @param hookId The hook ID to enable
     * @returns Promise with void
     */
    async enable(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/enable`, {
            method: 'POST',
        });
    }

    /**
     * Disable a hook
     * @param hookId The hook ID to disable
     * @returns Promise with void
     */
    async disable(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/disable`, {
            method: 'POST',
        });
    }

    /**
     * Start learning mode for a hook
     * @param hookId The hook ID to start learning for
     * @returns Promise with void
     */
    async learnStart(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/learn-start`, {
            method: 'POST',
        });
    }

    /**
     * Stop learning mode for a hook
     * @param hookId The hook ID to stop learning for
     * @returns Promise with void
     */
    async learnStop(hookId: number): Promise<void> {
        await this.#fetch(`/hooks/${hookId}/learn-stop`, {
            method: 'POST',
        });
    }
}
