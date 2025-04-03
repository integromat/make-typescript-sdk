import type { FetchFunction, PickColumns } from '../types.js';

/**
 * Represents a folder in Make.
 * Folders help organize scenarios within a team.
 */
export type Folder = {
    /** Unique identifier of the folder */
    id: number;
    /** Name of the folder */
    name: string;
    /** Total number of scenarios in the folder */
    scenariosTotal: number;
};

/**
 * Options for listing folders.
 * @template C Keys of the Folder type to include in the response
 */
export type ListFoldersOptions<C extends keyof Folder = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
};

/**
 * Response format for listing folders.
 */
type ListFoldersResponse<C extends keyof Folder = never> = {
    /** List of folders matching the query */
    scenariosFolders: PickColumns<Folder, C>[];
};

/**
 * Parameters for creating a new folder.
 */
export type CreateFolderBody = {
    /** Name of the folder */
    name: string;
    /** ID of the team where the folder will be created */
    teamId: number;
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
    cols?: C[];
};

/**
 * Parameters for updating a folder.
 */
export type UpdateFolderBody = {
    /** New name for the folder */
    name?: string;
};

/**
 * Response format for updating a folder.
 */
type UpdateFolderResponse<C extends keyof Folder = never> = {
    /** The updated folder */
    scenarioFolder: PickColumns<Folder, C>;
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
     * List all scenario folders for a team.
     * @param teamId The team ID to list folders for
     * @param options Optional parameters for filtering the returned fields
     * @returns Promise with the list of scenario folders
     */
    async list<C extends keyof Folder = never>(
        teamId: number,
        options?: ListFoldersOptions<C>,
    ): Promise<PickColumns<Folder, C>[]> {
        return (
            await this.#fetch<ListFoldersResponse<C>>('/scenarios-folders', {
                query: {
                    cols: options?.cols,
                    teamId,
                },
            })
        ).scenariosFolders;
    }

    /**
     * Create a new scenario folder.
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
                },
            })
        ).scenarioFolder;
    }

    /**
     * Update a scenario folder.
     * @param folderId The folder ID to update
     * @param folder The folder properties to update
     * @param options Optional parameters for filtering the returned fields
     * @returns Promise with the updated scenario folder
     */
    async update<C extends keyof Folder = never>(
        folderId: number,
        folder: UpdateFolderBody,
        options?: UpdateFolderOptions<C>,
    ): Promise<PickColumns<Folder, C>> {
        return (
            await this.#fetch<UpdateFolderResponse<C>>(`/scenarios-folders/${folderId}`, {
                method: 'PATCH',
                query: {
                    cols: options?.cols,
                },
                body: {
                    name: folder.name,
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
