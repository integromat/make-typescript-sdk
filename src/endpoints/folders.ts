import type { FetchFunction, PickColumns } from '../types.js';

export type Folder = {
    id: number;
    name: string;
    scenariosTotal: number;
};

export type ListFoldersOptions<C extends keyof Folder = never> = {
    cols?: C[];
};

type ListFoldersResponse<C extends keyof Folder = never> = {
    scenariosFolders: PickColumns<Folder, C>[];
};

export type CreateFolderBody = {
    name: string;
    teamId: number;
};

type CreateFolderResponse = {
    scenarioFolder: Folder;
};

export type UpdateFolderOptions<C extends keyof Folder = never> = {
    cols?: C[];
};

export type UpdateFolderBody = {
    name?: string;
};

type UpdateFolderResponse<C extends keyof Folder = never> = {
    scenarioFolder: PickColumns<Folder, C>;
};

export class Folders {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all scenario folders for a team
     * @param teamId The team ID to filter folders by
     * @param options Optional parameters for filtering and pagination
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
     * Create a new scenario folder
     * @param folder The folder data to create
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
     * Update a scenario folder
     * @param folderId The folder ID to update
     * @param folder The folder data to update
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
     * Delete a scenario folder
     * @param folderId The folder ID to delete
     * @returns Promise with void
     */
    async delete(folderId: number): Promise<void> {
        await this.#fetch(`/scenarios-folders/${folderId}`, {
            method: 'DELETE',
        });
    }
}
