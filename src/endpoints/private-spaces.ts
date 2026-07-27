import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a private space in Make.
 * A private space is a per-user personal workspace inside an organization where
 * scenarios and related entities (including connections) stay visible only to the
 * owner. Private spaces cannot be created or deleted through the API — they are
 * provisioned automatically based on the organization's private-spaces settings.
 */
export type PrivateSpace = {
    /** Unique identifier of the private space */
    id: number;
    /** Name of the private space */
    name: string;
    /** ID of the organization this private space belongs to */
    organizationId: number;
    /** Whether Make global AI agents are enabled for the space */
    globalAgentsEnabled?: boolean;
    /** Type of the underlying team; always `personal` for private spaces */
    type?: 'personal';
    /** Name of the space owner */
    privateSpaceOwnerName?: string;
    /** Email of the space owner */
    privateSpaceOwnerEmail?: string;
    /** User ID of the space owner */
    privateSpaceOwnerId?: number;
    /** Maximum operations limit; null means unlimited */
    operationsLimit?: number | null;
    /** Maximum data transfer limit in bytes; derived from the operations limit */
    transferLimit?: string | null;
    /** Number of operations consumed in the current period */
    consumedOperations?: number | null;
    /** Amount of data transfer consumed in the current period, in bytes */
    consumedTransfer?: string | null;
    /** Whether the space is paused due to exceeded limits */
    isPaused?: boolean | null;
    /** Number of centicredits consumed in the current period */
    consumedCenticredits?: number | null;
    /** Total operations since the last reset; only selectable via `cols` on `get()` */
    operations?: string;
    /** Total data transfer since the last reset, in bytes; only selectable via `cols` on `get()` */
    transfer?: string;
    /** Total centicredits since the last reset; only selectable via `cols` on `get()` */
    centicredits?: string;
    /** Whether the space is deleted; returned by `update()` */
    deleted?: boolean;
    /** External identifier of the space; returned by `update()` */
    externalId?: string | null;
};

/**
 * Options for listing private spaces.
 * @template C Keys of the PrivateSpace type to include in the response
 */
export type ListPrivateSpacesOptions<C extends keyof PrivateSpace = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options (the API supports sorting by `name` only) */
    pg?: Partial<Pagination<PrivateSpace>>;
    /** Filter spaces by their external ID */
    externalId?: string;
};

/**
 * Options for retrieving a private space.
 * @template C Keys of the PrivateSpace type to include in the response
 */
export type GetPrivateSpaceOptions<C extends keyof PrivateSpace = never> = {
    /**
     * Specific columns/fields to include in the response. In addition to the list
     * columns, `get()` supports the usage totals `operations`, `transfer` and
     * `centicredits` (computed from analytics storage; the API responds with 503
     * when that storage is unavailable).
     */
    cols?: C[] | ['*'];
};

/**
 * Body for updating a private space.
 */
export type UpdatePrivateSpaceBody = {
    /**
     * Maximum operations limit (minimum 0). Set to `null` to remove the limit
     * (unlimited); omit to leave unchanged. The transfer limit is derived from
     * this value by the API.
     */
    operationsLimit?: number | null;
};

/**
 * Options for updating a private space.
 */
export type UpdatePrivateSpaceOptions = {
    /**
     * Confirmation of the update. Required (the API fails with IM004 otherwise)
     * when the new operations limit is below the space's current consumption;
     * confirming pauses the space.
     */
    confirmed?: boolean;
};

/**
 * Response format for listing private spaces.
 */
type ListPrivateSpacesResponse<C extends keyof PrivateSpace = never> = {
    /** List of private spaces matching the query */
    privateSpaces: PickColumns<PrivateSpace, C>[];
    /** Pagination information */
    pg: Pagination<PrivateSpace>;
};

/**
 * Response format for getting a private space.
 */
type GetPrivateSpaceResponse<C extends keyof PrivateSpace = never> = {
    /** The requested private space */
    privateSpace: PickColumns<PrivateSpace, C>;
};

/**
 * Response format for updating a private space.
 */
type UpdatePrivateSpaceResponse = {
    /** The updated private space */
    privateSpace: PrivateSpace;
};

/**
 * Class providing methods for working with Make private spaces.
 * Requires the organization's private-spaces feature to be enabled; the API
 * responds with error IM903 when it is not.
 */
export class PrivateSpaces {
    readonly #fetch: FetchFunction;

    /**
     * Create a new PrivateSpaces instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List private spaces of an organization.
     * Requires the `personal team manage` organization permission.
     * @param organizationId The organization ID to list private spaces for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of private spaces
     *
     * @example
     * ```typescript
     * const spaces = await make.privateSpaces.list(123);
     * ```
     */
    async list<C extends keyof PrivateSpace = never>(
        organizationId: number,
        options?: ListPrivateSpacesOptions<C>,
    ): Promise<PickColumns<PrivateSpace, C>[]> {
        return (
            await this.#fetch<ListPrivateSpacesResponse<C>>('/private-spaces', {
                query: {
                    organizationId,
                    externalId: options?.externalId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).privateSpaces;
    }

    /**
     * Get details of a specific private space.
     * Requires the `personal team own view` organization permission; callers who are
     * not members of the space receive a 404 even when the space exists.
     * @param privateSpaceId The private space ID to get
     * @param options Optional parameters for filtering returned fields
     * @returns Promise with the private space information
     *
     * @example
     * ```typescript
     * const space = await make.privateSpaces.get(101);
     * ```
     */
    async get<C extends keyof PrivateSpace = never>(
        privateSpaceId: number,
        options?: GetPrivateSpaceOptions<C>,
    ): Promise<PickColumns<PrivateSpace, C>> {
        return (
            await this.#fetch<GetPrivateSpaceResponse<C>>(`/private-spaces/${privateSpaceId}`, {
                query: {
                    cols: options?.cols,
                },
            })
        ).privateSpace;
    }

    /**
     * Update a private space.
     * Requires the `personal team manage` organization permission.
     * @param privateSpaceId The private space ID to update
     * @param body The fields to update
     * @param options Optional update options
     * @returns Promise with the updated private space
     *
     * @example
     * ```typescript
     * // Remove the operations limit
     * const space = await make.privateSpaces.update(101, { operationsLimit: null });
     * ```
     */
    async update(
        privateSpaceId: number,
        body: UpdatePrivateSpaceBody,
        options?: UpdatePrivateSpaceOptions,
    ): Promise<PrivateSpace> {
        return (
            await this.#fetch<UpdatePrivateSpaceResponse>(`/private-spaces/${privateSpaceId}`, {
                method: 'PATCH',
                query: {
                    confirmed: options?.confirmed,
                },
                body,
            })
        ).privateSpace;
    }
}
