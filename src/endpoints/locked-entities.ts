import type { FetchFunction, PickColumns } from '../types.js';

/**
 * Who can see a connection or key: the whole team (`team`), or only the members of its access list (`locked`).
 * Where the locked connections feature is off for the organization, everything is `team`.
 */
export type EntityVisibility = 'team' | 'locked';

/**
 * Permission on a locked connection or key. `entity use` allows using it in scenarios and viewing its
 * configuration; `entity manage` additionally allows editing it and managing its access list.
 */
export type LockedEntityPermission = 'entity use' | 'entity manage';

/**
 * The caller's own access to a locked connection or key.
 */
export type EntityAcl = {
    /** The caller's permissions on the entity; empty when the caller may neither use nor manage it */
    permissions: LockedEntityPermission[];
    /** Whether nobody on the access list holds `entity manage`, so the team's delete permission can remove it */
    isOrphaned: boolean;
};

/**
 * A connection or key right after its visibility was changed.
 * @template V The visibility the entity has now
 */
export type EntityVisibilityChange<V extends EntityVisibility = EntityVisibility> = {
    /** ID of the connection or key */
    id: number;
    /** The visibility the entity has now */
    visibility: V;
};

/**
 * A column of a connection or key that `cols` can request. `acl` is not one: the API derives it.
 * @template T The connection or key type
 */
export type EntityColumn<T> = Exclude<keyof T, 'acl'>;

/**
 * A connection or key from a list, picked by `cols`. The API derives `acl` from `id` and `visibility`, so a
 * picked row carries it only when `cols` includes both.
 * @template T The connection or key type
 * @template C The requested columns
 */
export type PickEntityColumns<T extends { acl?: EntityAcl }, C extends EntityColumn<T>> = PickColumns<T, C> &
    ('id' | 'visibility' extends C ? Pick<T, 'acl'> : unknown);

/**
 * A member of a locked connection's or key's access list.
 */
export type LockedEntityAclMember = {
    /** ID of the member; for a `user` member, the user ID */
    id: number;
    /** The kind of member; always `user` today */
    membershipType: 'user' | 'group';
    /** Display name of the member, falling back to the email address, and to `Unknown user` when neither is known */
    name: string;
    /** Email of the user; omitted when unknown or for non-user members */
    email?: string;
    /** The permissions the member's role on the entity grants */
    permissions: LockedEntityPermission[];
};

/**
 * A locked connection or key of a team, with the caller's own permissions on it and the part of its
 * access list the caller may see.
 */
export type LockedEntity = {
    /** The kind of entity `id` refers to */
    type: 'connection' | 'key';
    /** ID of the locked connection or key */
    id: number;
    /** Display name of the locked connection or key */
    name: string;
    /** The caller's own permissions on the entity; without `entity use` the caller cannot use it in scenarios */
    permissions: LockedEntityPermission[];
    /**
     * The access-list members visible to the caller: everyone when the caller holds `entity use` on the
     * entity, otherwise only the `entity manage` holders
     */
    acl: LockedEntityAclMember[];
};

/**
 * Response format for listing a team's locked entities.
 */
type ListLockedEntitiesResponse = {
    /** Every locked connection and key of the team */
    lockedEntities: LockedEntity[];
};

/**
 * Class providing methods for working with a team's locked connections and keys.
 * A locked connection or key is visible only to the members of its access list.
 */
export class LockedEntities {
    readonly #fetch: FetchFunction;

    /**
     * Create a new LockedEntities instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List the locked connections and keys of a team, each with the caller's own permissions and the
     * access-list members the caller may see. Requires both the `connections:read` and `keys:read` scopes.
     * The API answers `400` (`IM903`) where locked connections are off for the organization.
     * @param teamId The team ID to list locked entities for
     * @returns Promise with the team's locked entities; empty when the team has none
     */
    async list(teamId: number): Promise<LockedEntity[]> {
        return (await this.#fetch<ListLockedEntitiesResponse>(`/teams/${teamId}/locked-entities`)).lockedEntities;
    }
}
