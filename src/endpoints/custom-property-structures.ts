import type { FetchFunction } from '../types.js';
import { CustomPropertyStructureItems } from './custom-property-structure-items.js';

/**
 * Describes one entity that owns a custom property structure and which entity
 * types the structure's items apply to.
 */
export type CustomPropertyStructureBelonger = {
    /** ID of the entity that owns the structure; currently always an organization ID */
    belongerId: number;
    /** Type of the entity that owns the structure; only 'organization' is supported today */
    belongerType: 'organization';
    /** Entity types this structure's items apply to; only 'scenario' is supported today */
    associatedTypes: 'scenario'[];
};

/**
 * Represents a custom property structure in Make.
 * A structure defines which entity type (currently only scenarios) can carry custom
 * properties for an organization. At most one structure can exist per combination of
 * associated type, belonger type, and belonger ID, and a structure cannot be deleted
 * through the API once created.
 */
export type CustomPropertyStructure = {
    /** Unique identifier of the structure */
    id: number;
    /**
     * Creation timestamp, e.g. `"2026-07-15T13:31:53.345339+00:00"` when returned by `list()`.
     * `create()`'s response format for this field hasn't been verified live and may differ
     * (possibly date-only) — treat it as unconfirmed until checked against a real response.
     */
    created: string;
    /** Entities that own this structure and the associated types it applies to */
    belongers: CustomPropertyStructureBelonger[];
};

/**
 * Body for creating a custom property structure.
 */
export type CreateCustomPropertyStructureBody = {
    /**
     * Entity type the custom properties apply to; only 'scenario' is supported today.
     * Stored as a single-element array in the resulting structure's `associatedTypes`.
     */
    associatedType: 'scenario';
    /** Type of the entity that owns the structure; only 'organization' is supported today */
    belongerType: 'organization';
    /** ID of the entity that owns the structure (the organization ID) */
    belongerId: number;
};

/**
 * Response format for listing custom property structures.
 */
type ListCustomPropertyStructuresResponse = {
    /** List of custom property structures matching the query */
    customPropertyStructures: CustomPropertyStructure[];
};

/**
 * Response format for creating a custom property structure.
 */
type CreateCustomPropertyStructureResponse = {
    /** The created custom property structure */
    customPropertyStructure: CustomPropertyStructure;
};

/**
 * Class providing methods for working with Make custom property structures.
 * Structures define which entity type can carry custom properties for an organization;
 * use the `items` property to manage the individual field definitions within a structure.
 * There is no `get()` or `update()` — use `list()` to look up a structure, since none of
 * its fields can be changed after creation.
 */
export class CustomPropertyStructures {
    readonly #fetch: FetchFunction;

    /** Access to custom property structure item operations */
    public readonly items: CustomPropertyStructureItems;

    /**
     * Create a new CustomPropertyStructures instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
        this.items = new CustomPropertyStructureItems(fetch);
    }

    /**
     * List the custom property structures of an organization.
     * The API does not support column selection or pagination for this endpoint.
     * Requires the organization's custom-properties feature to be enabled (error IM027 otherwise).
     * @param organizationId The organization ID to list custom property structures for
     * @returns Promise with the list of custom property structures
     *
     * @example
     * ```typescript
     * const structures = await make.customPropertyStructures.list(123);
     * ```
     */
    async list(organizationId: number): Promise<CustomPropertyStructure[]> {
        return (
            await this.#fetch<ListCustomPropertyStructuresResponse>('/custom-property-structures', {
                query: { organizationId },
            })
        ).customPropertyStructures;
    }

    /**
     * Create a custom property structure for an organization.
     * Only one structure can exist per (associatedType, belongerType, belongerId)
     * combination — a duplicate fails with IM005. Once created, a structure cannot be
     * deleted through the API.
     * @param body The structure to create
     * @returns Promise with the created custom property structure
     *
     * @example
     * ```typescript
     * const structure = await make.customPropertyStructures.create({
     *     associatedType: 'scenario',
     *     belongerType: 'organization',
     *     belongerId: 123,
     * });
     * ```
     */
    async create(body: CreateCustomPropertyStructureBody): Promise<CustomPropertyStructure> {
        return (
            await this.#fetch<CreateCustomPropertyStructureResponse>('/custom-property-structures', {
                method: 'POST',
                body,
            })
        ).customPropertyStructure;
    }
}
