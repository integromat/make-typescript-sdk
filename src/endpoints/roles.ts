import type { FetchFunction, PickColumns } from '../types.js';

/**
 * Represents a role in Make.
 * Roles define a set of permissions and can be assigned to users at the
 * organization or team level. In addition to built-in system roles, an
 * organization may have custom roles when the `customRoles` license feature
 * and Roleman are enabled.
 */
export type Role = {
    /** Unique identifier of the role */
    id: number;
    /** Name of the role */
    name: string;
    /** Machine-readable identifier of a built-in system role; absent for custom roles */
    identifier?: string;
    /** Whether the role applies to an organization or a team */
    category: 'organization' | 'team';
    /** Whether the role is assignable by non-admin users */
    subsidiary?: boolean;
    /** Whether the role is a built-in locked role, a built-in admin-managed role, or a custom-managed one */
    managementType: 'system_locked' | 'admin_managed' | 'custom_managed';
    /** Description of the role */
    description: string | null;
    /** ID of the organization that owns the role; only present for custom roles, and only returned by `get()` */
    organizationId?: number | null;
    /** Names of the permissions granted by the role */
    permissions: string[];
};

/**
 * Options for listing roles.
 * @template C Keys of the Role type to include in the response
 */
export type ListRolesOptions<C extends keyof Role = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Restrict results to organization or team roles */
    category?: 'organization' | 'team';
    /** Role IDs to exclude from the response */
    excludeRole?: number[];
    /** Return only the role matching this ID */
    roleId?: number;
    /**
     * Organization to resolve custom roles for. Custom roles are only included when this
     * (or `teamId`) is provided and the organization has the `customRoles` license feature enabled.
     */
    organizationId?: number;
    /** Team to resolve custom roles for; custom roles apply the same way as with `organizationId` */
    teamId?: number;
};

/**
 * Response format for listing roles.
 */
type ListRolesResponse<C extends keyof Role = never> = {
    /** List of roles matching the query */
    usersRoles: PickColumns<Role, C>[];
};

/**
 * Response format for getting a role.
 */
type GetRoleResponse = {
    /** The requested role */
    usersRole: Role;
};

/**
 * Represents a permission that can be granted through a role.
 */
export type RolePermission = {
    /** Unique identifier of the permission */
    id: number;
    /** Name of the permission */
    name: string;
    /** Note describing the permission */
    note: string;
    /** Group the permission belongs to */
    category: string;
    /** Whether the permission applies to an organization or a team */
    roleCategory: 'organization' | 'team';
    /** Human-readable label of the permission */
    label: string;
    /** Whether the permission is hidden from the custom role editor */
    customRolesHidden: boolean;
    /** Names of other permissions this permission requires */
    requires: string[];
};

/**
 * Options for listing role permissions.
 */
export type ListRolePermissionsOptions = {
    /** Restrict results to organization or team permissions */
    roleCategory?: 'organization' | 'team';
};

/**
 * Response format for listing role permissions.
 */
type ListRolePermissionsResponse = {
    /** List of permissions matching the query */
    usersRolesPermissions: RolePermission[];
};

/**
 * Class providing methods for working with Make roles.
 * Covers both built-in system roles and, when enabled, custom roles.
 */
export class Roles {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Roles instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List roles available to the current user.
     * @param options Optional parameters for filtering and column selection
     * @returns Promise with the list of roles
     *
     * @example
     * ```typescript
     * const roles = await make.roles.list({ organizationId: 5 });
     * ```
     */
    async list<C extends keyof Role = never>(options?: ListRolesOptions<C>): Promise<PickColumns<Role, C>[]> {
        return (
            await this.#fetch<ListRolesResponse<C>>('/users/roles', {
                query: {
                    cols: options?.cols,
                    category: options?.category,
                    excludeRole: options?.excludeRole,
                    roleId: options?.roleId,
                    organizationId: options?.organizationId,
                    teamId: options?.teamId,
                },
            })
        ).usersRoles;
    }

    /**
     * Get details of a specific role, including its permissions.
     * Requires Roleman to be enabled; not supported on private (on-premise) instances.
     * @param roleId The role ID to get
     * @returns Promise with the role information
     *
     * @example
     * ```typescript
     * const role = await make.roles.get(42);
     * ```
     */
    async get(roleId: number): Promise<Role> {
        return (await this.#fetch<GetRoleResponse>(`/users/roles/${roleId}`)).usersRole;
    }

    /**
     * List permissions that can be granted through a role.
     * @param options Optional parameters for filtering by role category
     * @returns Promise with the list of permissions
     */
    async permissions(options?: ListRolePermissionsOptions): Promise<RolePermission[]> {
        return (
            await this.#fetch<ListRolePermissionsResponse>('/users/roles/permissions', {
                query: {
                    roleCategory: options?.roleCategory,
                },
            })
        ).usersRolesPermissions;
    }
}
