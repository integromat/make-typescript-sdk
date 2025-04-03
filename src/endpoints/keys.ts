import type { FetchFunction, JSONValue, PickColumns } from '../types.js';
import type { DataStructureField } from './data-structures.js';

/**
 * Represents a key in Make.
 * Keys are used to store sensitive information securely and can be used
 * in apps without exposing the actual values.
 */
export type Key = {
    /** Unique identifier of the key */
    id: number;
    /** Name of the key */
    name: string;
    /** Type of the key (e.g., 'api_key', 'oauth') */
    typeName?: string;
    /** ID of the team that owns the key */
    teamId?: number;
    /** The app this key belongs to, if any */
    packageName?: string | null;
    /** Theme color for the key in UI */
    theme?: string;
};

/**
 * Represents a key type in Make.
 * Key types define the structure and validation rules for different kinds of keys.
 */
export type KeyType = {
    /** Internal name/identifier of the key type */
    name: string;
    /** Human-readable label for the key type */
    label: string;
    /** Category of the key type */
    type: string;
    /** Parameter specifications for configuring this key type */
    parameters: DataStructureField[];
    /** Author of the key type */
    author: string;
    /** Version of the key type */
    version: string;
    /** Theme color for the key type in UI */
    theme: string;
    /** Icon for the key type in UI */
    icon: string;
};

/**
 * Options for listing keys.
 * @template C Keys of the Key type to include in the response
 */
export type ListKeysOptions<C extends keyof Key = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
    /** Team ID to filter keys by (can override the main parameter) */
    teamId?: number;
    /** Filter keys by type */
    typeName?: string;
};

/**
 * Parameters for creating a new key.
 */
export type CreateKeyBody = {
    /** Name for the new key */
    name: string;
    /** ID of the team where the key will be created */
    teamId: number;
    /** Type of the key to create */
    typeName: string;
    /** Key-specific configuration parameters */
    parameters: Record<string, JSONValue>;
};

/**
 * Parameters for updating a key.
 */
export type UpdateKeyBody = {
    /** New name for the key */
    name?: string;
    /** Updated key-specific configuration parameters */
    parameters?: Record<string, JSONValue>;
};

/**
 * Response format for listing keys.
 */
type ListKeysResponse<C extends keyof Key = never> = {
    /** List of keys matching the query */
    keys: PickColumns<Key, C>[];
};

/**
 * Options for retrieving a key.
 */
export type GetKeyOptions<C extends keyof Key = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
};

/**
 * Response format for getting a key.
 */
type GetKeyResponse<C extends keyof Key = never> = {
    /** The requested key */
    key: PickColumns<Key, C>;
};

/**
 * Response format for creating a key.
 */
type CreateKeyResponse = {
    /** The created key */
    key: Key;
};

/**
 * Response format for updating a key.
 */
type UpdateKeyResponse = {
    /** The updated key */
    key: Key;
};

/**
 * Response format for listing key types.
 */
type ListKeyTypesResponse = {
    /** List of available key types */
    keysTypes: KeyType[];
};

/**
 * Class providing methods for working with Make keys.
 * Keys allow secure storage of sensitive information like API keys,
 * passwords, and tokens that can be used in apps without exposing
 * the actual values.
 */
export class Keys {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Keys instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List keys for a team.
     * @param teamId The team ID to list keys for
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
     * Get details of a specific key.
     * @param keyId The key ID to retrieve
     * @param options Optional parameters for filtering the returned fields
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
     * Create a new key.
     * @param body The key data including name, teamId, typeName and parameters
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
     * Update an existing key.
     * @param keyId The key ID to update
     * @param body The key properties to update
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
     * Delete a key.
     * @param keyId The key ID to delete
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
     * List all available key types.
     * @returns Promise with the list of key types
     */
    async types(): Promise<KeyType[]> {
        return (await this.#fetch<ListKeyTypesResponse>('/keys/types')).keysTypes;
    }
}
