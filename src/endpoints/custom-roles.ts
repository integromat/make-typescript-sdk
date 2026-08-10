import type { FetchFunction } from '../types.js';

/**
 * Represents a custom role in Make.
 * Custom roles are user-defined roles managed through Roleman; they require
 * the organization's `customRoles` license feature and only apply at the
 * organization or team level (never to admin roles).
 */
export type CustomRole = {
    /** Unique identifier of the custom role */
    id: number;
    /** Name of the custom role */
    name: string;
    /** Whether the role applies to an organization or a team */
    category: 'organization' | 'team';
    /** Always `'custom_managed'` for a custom role */
    managementType: 'custom_managed';
    /** Description of the custom role */
    description: string | null;
    /** Permissions granted by the custom role */
    permissions: { id: number; name: string }[];
};

/**
 * Body for creating a custom role.
 */
export type CreateCustomRoleBody = {
    /** Name of the custom role */
    name: string;
    /** Whether the role applies to an organization or a team */
    category: 'organization' | 'team';
    /** ID of the organization to create the custom role in */
    organizationId: number;
    /** Description of the custom role */
    description?: string | null;
    /** IDs of the permissions to assign to the custom role */
    permissions?: number[];
};

/**
 * Body for updating a custom role.
 */
export type UpdateCustomRoleBody = {
    /** ID of the custom role to update */
    id: number;
    /** ID of the organization the custom role belongs to */
    organizationId: number;
    /** New name for the custom role */
    name?: string;
    /** New description for the custom role. Pass `null` to clear it */
    description?: string | null;
    /** Full list of permission IDs to assign to the role; replaces the existing permissions */
    permissions?: number[];
};

/**
 * Body for deleting a custom role.
 */
export type DeleteCustomRoleBody = {
    /** ID of the custom role to delete */
    id: number;
    /** ID of the organization the custom role belongs to */
    organizationId: number;
};

/**
 * Response format for creating or updating a custom role.
 */
type CustomRoleResponse = {
    /** The created or updated custom role */
    role: CustomRole;
};

/**
 * Response format for deleting a custom role.
 */
type DeleteCustomRoleResponse = {
    /** The ID of the deleted custom role */
    roleId: number;
};

/**
 * Class providing methods for working with Make custom roles.
 * Requires the organization's `customRoles` license feature to be enabled.
 */
export class CustomRoles {
    readonly #fetch: FetchFunction;

    /**
     * Create a new CustomRoles instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Create a new custom role.
     * @param body Parameters for the custom role to create
     * @returns Promise with the created custom role
     *
     * @example
     * ```typescript
     * const role = await make.customRoles.create({
     *     name: 'Custom Viewer',
     *     category: 'organization',
     *     organizationId: 1,
     *     permissions: [101, 102],
     * });
     * ```
     */
    async create(body: CreateCustomRoleBody): Promise<CustomRole> {
        return (
            await this.#fetch<CustomRoleResponse>('/users/custom-roles', {
                method: 'POST',
                body,
            })
        ).role;
    }

    /**
     * Update an existing custom role.
     * @param body The custom role ID, its organization ID, and the fields to update
     * @returns Promise with the updated custom role
     */
    async update(body: UpdateCustomRoleBody): Promise<CustomRole> {
        return (
            await this.#fetch<CustomRoleResponse>('/users/custom-roles', {
                method: 'PATCH',
                body,
            })
        ).role;
    }

    /**
     * Delete a custom role. The role must not be currently assigned to any users.
     * @param body The custom role ID and its organization ID
     * @returns Promise with the ID of the deleted custom role
     */
    async delete(body: DeleteCustomRoleBody): Promise<number> {
        return (
            await this.#fetch<DeleteCustomRoleResponse>('/users/custom-roles', {
                method: 'DELETE',
                body,
            })
        ).roleId;
    }
}
