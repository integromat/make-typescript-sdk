import type { FetchFunction, PickColumns } from '../types.js';

/**
 * Non-recursive folder fields, excluding `children`.
 * Used as the base for `Folder`, which adds a `children` property typed recursively
 * so that column selection (`cols`) applies to nested folders as well.
 */
type FolderFields = {
    /** Unique identifier of the folder */
    id: number;
    /** Name of the folder */
    name: string;
    /** Slash-separated folder path including this folder, for example `CRM/cleanup` */
    path: string;
    /** ID of the team that owns the folder. Returned when listing folders by organization */
    teamId?: number;
    /** ID of the parent folder, or `null` for top-level folders */
    parentId: number | null;
    /** Manual sort position among sibling folders, or `null` if unset */
    position: number | null;
    /** Number of scenarios directly assigned to this folder */
    scenariosTotal: number;
    /** Number of scenarios assigned to this folder or any descendant folder */
    scenariosSubtreeTotal: number;
    /** Number of deleted scenarios directly assigned to this folder. Available to admin callers */
    scenariosDeleted?: number;
    /** Number of deleted scenarios assigned to this folder or any descendant folder. Available to admin callers */
    scenariosDeletedSubtreeTotal?: number;
    /** Whether this folder has direct child folders. Use `parentId` to retrieve them */
    hasChildren: boolean;
};

/**
 * Represents a folder in Make.
 * Folders help organize scenarios within a team and can be nested to form a folder tree.
 *
 * `children` holds the direct child folders of this folder (or all descendants when
 * `childrenDepth` is set to `all`). Its items are typed with the same column selection `C`
 * as the parent folder, so `cols` applies recursively to nested folders too.
 * @template C Keys of the folder (and, recursively, of its `children`) to include in the response
 */
export type Folder<C extends keyof FolderFields | 'children' = never> = PickColumns<
    FolderFields,
    Exclude<C, 'children'>
> &
    ([C] extends [never]
        ? { children?: Folder<C>[] }
        : 'children' extends C
          ? { children: Folder<C>[] }
          : object);

/**
 * Options for listing folders.
 * @template C Keys of the Folder type to include in the response
 */
export type ListFoldersOptions<C extends keyof Folder = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** The parent folder whose direct children should be returned. Omit to return top-level folders */
    parentId?: number;
    /** Set to `all` to return all descendants under `children`. By default, `children` includes only one direct child level */
    childrenDepth?: 'all';
};

/**
 * Response format for listing folders.
 */
type ListFoldersResponse<C extends keyof Folder = never> = {
    /** List of folders matching the query */
    scenariosFolders: Folder<C>[];
};

/**
 * Parameters for creating a new folder.
 */
export type CreateFolderBody = {
    /** Name of the folder */
    name: string;
    /** ID of the team where the folder will be created */
    teamId: number;
    /** ID of the parent folder. Omit or pass `null` to create a top-level folder */
    parentId?: number | null;
};

/**
 * Response format for creating a folder.
 */
type CreateFolderResponse = {
    /** The created folder */
    scenarioFolder: Folder;
};

/**
 * Options for updating a folder.
 * @template C Keys of the Folder type to include in the response
 */
export type UpdateFolderOptions<C extends keyof Folder = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Parameters for updating a folder.
 */
export type UpdateFolderBody = {
    /** New name for the folder */
    name?: string;
    /** ID of the new parent folder. Use `null` to move the folder to the top level */
    parentId?: number | null;
};

/**
 * Response format for updating a folder.
 */
type UpdateFolderResponse<C extends keyof Folder = never> = {
    /** The updated folder */
    scenarioFolder: Folder<C>;
};

/**
 * Class providing methods for working with Make folders.
 * Folders help organize scenarios within a team for better organization
 * and management of automation workflows.
 */
export class Folders {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Folders instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List direct scenario folder children for a team.
     * Omit `parentId` in `options` to return top-level folders.
     * @param teamId The team ID to list folders for
     * @param options Optional parameters for filtering the returned fields, selecting a parent folder, or expanding descendants
     * @returns Promise with the list of scenario folders
     */
    async list<C extends keyof Folder = never>(teamId: number, options?: ListFoldersOptions<C>): Promise<Folder<C>[]> {
        return (
            await this.#fetch<ListFoldersResponse<C>>('/scenarios-folders', {
                query: {
                    cols: options?.cols,
                    teamId,
                    parentId: options?.parentId,
                    childrenDepth: options?.childrenDepth,
                },
            })
        ).scenariosFolders;
    }

    /**
     * Create a new scenario folder.
     * Omit `parentId` or pass `null` to create a top-level folder.
     * @param folder Parameters for the folder to create
     * @returns Promise with the created scenario folder
     */
    async create(folder: CreateFolderBody): Promise<Folder> {
        return (
            await this.#fetch<CreateFolderResponse>('/scenarios-folders', {
                method: 'POST',
                body: {
                    name: folder.name,
                    teamId: folder.teamId,
                    parentId: folder.parentId,
                },
            })
        ).scenarioFolder;
    }

    /**
     * Update a scenario folder.
     * Use `parentId: null` to move the folder to the top level. Any property that is not provided is left unchanged.
     * @param folderId The folder ID to update
     * @param folder The folder properties to update
     * @param options Optional parameters for filtering the returned fields
     * @returns Promise with the updated scenario folder
     */
    async update<C extends keyof Folder = never>(
        folderId: number,
        folder: UpdateFolderBody,
        options?: UpdateFolderOptions<C>,
    ): Promise<Folder<C>> {
        return (
            await this.#fetch<UpdateFolderResponse<C>>(`/scenarios-folders/${folderId}`, {
                method: 'PATCH',
                query: {
                    cols: options?.cols,
                },
                body: {
                    name: folder.name,
                    parentId: folder.parentId,
                },
            })
        ).scenarioFolder;
    }

    /**
     * Delete a scenario folder.
     * @param folderId The folder ID to delete
     */
    async delete(folderId: number): Promise<void> {
        await this.#fetch(`/scenarios-folders/${folderId}`, {
            method: 'DELETE',
        });
    }
}
