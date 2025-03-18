import type { FetchFunction, JSONValue, PickColumns } from '../types.js';
import type { DataStructureField } from './data-structures.js';

export type Key = {
    id: number;
    name: string;
    typeName?: string;
    teamId?: number;
    packageName?: string | null;
    theme?: string;
};

export type KeyType = {
    name: string;
    label: string;
    type: string;
    parameters: DataStructureField[];
    author: string;
    version: string;
    theme: string;
    icon: string;
};

export type ListKeysOptions<C extends keyof Key = never> = {
    cols?: C[];
    teamId?: number;
    typeName?: string;
};

export type CreateKeyBody = {
    name: string;
    teamId: number;
    typeName: string;
    parameters: Record<string, JSONValue>;
};

export type UpdateKeyBody = {
    name?: string;
    parameters?: Record<string, JSONValue>;
};

type ListKeysResponse<C extends keyof Key = never> = {
    keys: PickColumns<Key, C>[];
};

export type GetKeyOptions<C extends keyof Key = never> = {
    cols?: C[];
};

type GetKeyResponse<C extends keyof Key = never> = {
    key: PickColumns<Key, C>;
};

type CreateKeyResponse = {
    key: Key;
};

type UpdateKeyResponse = {
    key: Key;
};

type ListKeyTypesResponse = {
    keysTypes: KeyType[];
};

export class Keys {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List keys
     * @param teamId The team ID
     * @param options Optional parameters for filtering
     * @returns Promise with the list of keys
     */
    async list<C extends keyof Key = never>(
        teamId: number,
        options?: ListKeysOptions<C>,
    ): Promise<PickColumns<Key, C>[]> {
        return (
            await this.#fetch<ListKeysResponse<C>>('/keys', {
                query: {
                    teamId,
                    cols: options?.cols,
                    typeName: options?.typeName,
                },
            })
        ).keys;
    }

    /**
     * Get a key
     * @param keyId The key ID
     * @returns Promise with the key details
     */
    async get<C extends keyof Key = never>(keyId: number, options?: GetKeyOptions<C>): Promise<PickColumns<Key, C>> {
        return (
            await this.#fetch<GetKeyResponse<C>>(`/keys/${keyId}`, {
                query: {
                    cols: options?.cols,
                },
            })
        ).key;
    }

    /**
     * Create a new key
     * @param body The key data including name, teamId, typeName and optional parameters
     * @returns Promise with the created key
     */
    async create(body: CreateKeyBody): Promise<Key> {
        return (
            await this.#fetch<CreateKeyResponse>('/keys', {
                method: 'POST',
                body,
            })
        ).key;
    }

    /**
     * Update a key
     * @param keyId The key ID
     * @param body The key data to update
     * @returns Promise with the updated key
     */
    async update(keyId: number, body: UpdateKeyBody): Promise<Key> {
        return (
            await this.#fetch<UpdateKeyResponse>(`/keys/${keyId}`, {
                method: 'PATCH',
                body,
            })
        ).key;
    }

    /**
     * Delete a key
     * @param keyId The key ID
     * @returns Promise that resolves when the key is deleted
     */
    async delete(keyId: number): Promise<void> {
        await this.#fetch(`/keys/${keyId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
    }

    /**
     * List key types
     * @returns Promise with the list of key types
     */
    async types(): Promise<KeyType[]> {
        return (await this.#fetch<ListKeyTypesResponse>('/keys/types')).keysTypes;
    }
}
