import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Data type of a custom property structure item.
 */
export type CustomPropertyStructureItemType =
    | 'boolean'
    | 'number'
    | 'shortText'
    | 'longText'
    | 'date'
    | 'dropdown'
    | 'multiselect';

/**
 * One available choice for a 'dropdown' or 'multiselect' structure item.
 */
export type CustomPropertyStructureItemOption = {
    /** The option's value, shown to users and stored as the property value */
    value: string;
};

/**
 * Represents one field definition within a custom property structure.
 */
export type CustomPropertyStructureItem = {
    /** Unique identifier of the structure item */
    id: number;
    /** Unique name of the item within its structure; used as the key in scenario data */
    name: string;
    /** Label shown to users in the scenario table header */
    label: string;
    /** Description shown in the Scenario properties tab of the Organization dashboard */
    description?: string;
    /** Data type of the item */
    type: CustomPropertyStructureItemType;
    /**
     * Available choices for 'dropdown'/'multiselect' items. Confirmed live: `create()`/
     * `update()` always include this key (`null` for other types); `list()` omits the key
     * entirely for other types instead of sending `null`.
     */
    options?: CustomPropertyStructureItemOption[] | null;
    /** Whether filling in this item is mandatory when setting scenario custom properties data */
    required: boolean;
};

/**
 * A structure item as returned by `create()`/`update()`, which also report the owning structure.
 */
export type CustomPropertyStructureItemWithStructureId = CustomPropertyStructureItem & {
    /** ID of the structure this item belongs to */
    structureId: number;
};

/**
 * Options for listing custom property structure items.
 * @template C Keys of the CustomPropertyStructureItem type to include in the response
 */
export type ListCustomPropertyStructureItemsOptions<C extends keyof CustomPropertyStructureItem = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options (the API does not support sorting by `options`) */
    pg?: Partial<Pagination<Omit<CustomPropertyStructureItem, 'options'>>>;
    /** Filter items by exact ID */
    id?: number;
    /** Filter items by name (matched as a case-insensitive regular expression by the API) */
    name?: string;
    /** Filter items by label (matched as a case-insensitive regular expression by the API) */
    label?: string;
    /** Filter items by description (matched as a case-insensitive regular expression by the API) */
    description?: string;
    /** Filter items by exact data type */
    type?: CustomPropertyStructureItemType;
    /** Filter items by whether they are required */
    required?: boolean;
};

/**
 * Body for creating a custom property structure item.
 */
export type CreateCustomPropertyStructureItemBody = {
    /**
     * Unique name of the item within the structure, used as its key in scenario data.
     * Must match `^[a-zA-Z_$][0-9a-zA-Z_$]*$`, max 64 characters. Immutable after creation.
     */
    name: string;
    /** Label shown to users in the scenario table header, max 64 characters */
    label: string;
    /** Data type of the item. Immutable after creation. */
    type: CustomPropertyStructureItemType;
    /** Description shown in the Scenario properties tab, max 1024 characters */
    description?: string;
    /**
     * Available choices. Required for 'dropdown'/'multiselect' items and not allowed for any
     * other type; values must be unique and max 250 characters each.
     */
    options?: CustomPropertyStructureItemOption[];
    /**
     * Whether filling in this item is mandatory. The live validator requires this field to be
     * explicitly supplied on create even though the public API docs list it as optional
     * (defaulting to `false`) — verify against Task 1's findings before relaxing this to optional.
     */
    required: boolean;
};

/**
 * Body for updating a custom property structure item. `name` and `type` cannot be changed.
 */
export type UpdateCustomPropertyStructureItemBody = {
    /** New label, max 64 characters */
    label?: string;
    /** New description, max 1024 characters */
    description?: string;
    /**
     * Full replacement set of available choices for 'dropdown'/'multiselect' items. The new set
     * replaces the current one entirely; existing scenario data referencing removed options is
     * not remapped.
     */
    options?: CustomPropertyStructureItemOption[];
    /** Whether filling in this item is mandatory */
    required?: boolean;
};

/**
 * Options for deleting a custom property structure item.
 */
export type DeleteCustomPropertyStructureItemOptions = {
    /**
     * Confirmation of the deletion. Required (the API fails with IM004 otherwise) when scenarios
     * already have data for this item; confirming discards that data irreversibly.
     */
    confirmed?: boolean;
};

/**
 * Response format for listing custom property structure items.
 */
type ListCustomPropertyStructureItemsResponse<C extends keyof CustomPropertyStructureItem = never> = {
    /** List of structure items matching the query */
    customPropertyStructureItems: PickColumns<CustomPropertyStructureItem, C>[];
    /** Pagination information */
    pg: Pagination<Omit<CustomPropertyStructureItem, 'options'>>;
};

/**
 * Response format for creating a custom property structure item.
 */
type CreateCustomPropertyStructureItemResponse = {
    /** The created structure item */
    customPropertyStructureItem: CustomPropertyStructureItemWithStructureId;
};

/**
 * Response format for updating a custom property structure item.
 */
type UpdateCustomPropertyStructureItemResponse = {
    /** The updated structure item */
    customPropertyStructureItem: CustomPropertyStructureItemWithStructureId;
};

/**
 * Class providing methods for working with items (field definitions) within a custom property
 * structure. `list()`/`create()` take the structure's ID; `update()`/`delete()` take the item's
 * ID directly, matching the underlying API's routes.
 */
export class CustomPropertyStructureItems {
    readonly #fetch: FetchFunction;

    /**
     * Create a new CustomPropertyStructureItems instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List the items of a custom property structure.
     * @param structureId The custom property structure ID to list items for
     * @param options Optional parameters for filtering, column selection, and pagination
     * @returns Promise with the list of structure items
     *
     * @example
     * ```typescript
     * const items = await make.customPropertyStructures.items.list(6);
     * ```
     */
    async list<C extends keyof CustomPropertyStructureItem = never>(
        structureId: number,
        options?: ListCustomPropertyStructureItemsOptions<C>,
    ): Promise<PickColumns<CustomPropertyStructureItem, C>[]> {
        return (
            await this.#fetch<ListCustomPropertyStructureItemsResponse<C>>(
                `/custom-property-structures/${structureId}/custom-property-structure-items`,
                {
                    query: {
                        cols: options?.cols,
                        pg: options?.pg,
                        id: options?.id,
                        name: options?.name,
                        label: options?.label,
                        description: options?.description,
                        type: options?.type,
                        required: options?.required,
                    },
                },
            )
        ).customPropertyStructureItems;
    }

    /**
     * Create an item in a custom property structure.
     * @param structureId The custom property structure ID to add the item to
     * @param body The item to create
     * @returns Promise with the created structure item
     *
     * @example
     * ```typescript
     * const item = await make.customPropertyStructures.items.create(6, {
     *     name: 'teamLocation',
     *     label: 'Team location',
     *     type: 'shortText',
     *     required: false,
     * });
     * ```
     */
    async create(
        structureId: number,
        body: CreateCustomPropertyStructureItemBody,
    ): Promise<CustomPropertyStructureItemWithStructureId> {
        return (
            await this.#fetch<CreateCustomPropertyStructureItemResponse>(
                `/custom-property-structures/${structureId}/custom-property-structure-items`,
                { method: 'POST', body },
            )
        ).customPropertyStructureItem;
    }

    /**
     * Update an item in a custom property structure. `name` and `type` cannot be changed.
     * @param itemId The custom property structure item ID to update
     * @param body The fields to update
     * @returns Promise with the updated structure item
     *
     * @example
     * ```typescript
     * const item = await make.customPropertyStructures.items.update(2, { label: 'Updated label' });
     * ```
     */
    async update(
        itemId: number,
        body: UpdateCustomPropertyStructureItemBody,
    ): Promise<CustomPropertyStructureItemWithStructureId> {
        return (
            await this.#fetch<UpdateCustomPropertyStructureItemResponse>(
                `/custom-property-structures/custom-property-structure-items/${itemId}`,
                { method: 'PATCH', body },
            )
        ).customPropertyStructureItem;
    }

    /**
     * Delete an item from a custom property structure. Deleting an item also deletes any
     * scenario data filled in for it — this is irreversible.
     * @param itemId The custom property structure item ID to delete
     * @param options Confirmation options, required when scenarios already hold data for the item
     *
     * @example
     * ```typescript
     * await make.customPropertyStructures.items.delete(2);
     * ```
     */
    async delete(itemId: number, options?: DeleteCustomPropertyStructureItemOptions): Promise<void> {
        await this.#fetch(`/custom-property-structures/custom-property-structure-items/${itemId}`, {
            method: 'DELETE',
            query: { confirmed: options?.confirmed },
        });
    }
}
