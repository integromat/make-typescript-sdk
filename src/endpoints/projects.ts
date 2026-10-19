import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a project (formerly team) in Make.
 * Projects are workspaces for organizing scenarios, users, and resources
 * within an organization's account.
 */
export type Project = {
    /** Unique identifier of the project */
    id: number;
    /** Name of the project */
    name: string;
    /** ID of the organization this project belongs to */
    organizationId: number;
    /** Number of active scenarios in the project */
    activeScenarios?: number;
    /** Number of active apps in the project */
    activeApps?: number;
    /** Total operations count */
    operations?: number;
    /** Total data transfer */
    transfer?: number;
    /** Maximum operations limit */
    operationsLimit?: number;
    /** Maximum data transfer limit */
    transferLimit?: string;
    /** Number of operations consumed */
    consumedOperations?: number;
    /** Amount of data transfer consumed */
    consumedTransfer?: number;
    /** Whether the project is paused */
    isPaused?: boolean;
    /** Type of the project: `personal` for a private space, `standard` otherwise. */
    type?: 'personal' | 'standard';
};

/**
 * Represents a user's role in a project.
 */
type UserProjectRole = {
    /** ID of the user's role */
    usersRoleId: number;
    /** ID of the user */
    userId: number;
    /** ID of the project (same value as `teamId`) */
    projectId?: number;
    /** ID of the project (legacy name) */
    teamId: number;
    /** Whether the role can be changed */
    changeable: boolean;
};

/**
 * Options for listing projects.
 * @template C Keys of the Project type to include in the response
 */
export type ListProjectsOptions<C extends keyof Project = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<Project>>;
    /** Whether to include private spaces in the results */
    includePrivateSpaces?: boolean;
};

/**
 * Parameters for creating a new project.
 */
export type CreateProjectBody = {
    /** Name for the new project */
    name: string;
    /** ID of the organization where the project will be created */
    organizationId: number;
    /** Maximum operations limit for the project */
    operationsLimit?: number;
    /** Maximum data transfer limit for the project */
    transferLimit?: number;
};

/**
 * Options for retrieving a project.
 * @template C Keys of the Project type to include in the response
 */
export type GetProjectOptions<C extends keyof Project = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * The API returns both the project and the legacy team key names.
 */
type ListProjectsResponse<C extends keyof Project = never> = {
    projects?: PickColumns<Project, C>[];
    teams: PickColumns<Project, C>[];
    pg: Pagination<Project>;
};

type GetProjectResponse<C extends keyof Project = never> = {
    project?: PickColumns<Project, C>;
    team: PickColumns<Project, C>;
};

type CreateProjectResponse = {
    project?: Project;
    team: Project;
    userProjectRole?: UserProjectRole;
    userTeamRole: UserProjectRole;
};

/**
 * Class providing methods for working with Make projects (formerly teams).
 * Projects are workspaces for organizing scenarios, users, and resources within an organization.
 * Each user can be a member of multiple projects and have different roles in each.
 */
export class Projects {
    readonly #fetch: FetchFunction;
    readonly #basePath: string;

    /**
     * Create a new Projects instance.
     * @param fetch Function for making API requests
     * @param basePath API path prefix of the collection
     * @internal
     */
    constructor(fetch: FetchFunction, basePath: '/projects' | '/teams' = '/teams') {
        this.#fetch = fetch;
        this.#basePath = basePath;
    }

    /**
     * List all projects in an organization.
     * @param organizationId The organization ID to list projects for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of projects
     *
     * @example
     * ```typescript
     * const projects = await make.projects.list(123, {
     *   pg: { sortBy: 'name', sortDir: 'asc' }
     * });
     * ```
     */
    async list<C extends keyof Project = never>(
        organizationId: number,
        options?: ListProjectsOptions<C>,
    ): Promise<PickColumns<Project, C>[]> {
        const response = await this.#fetch<ListProjectsResponse<C>>(this.#basePath, {
            query: {
                organizationId,
                cols: options?.cols,
                pg: options?.pg,
                includePrivateSpaces: options?.includePrivateSpaces,
            },
        });
        return response.projects ?? response.teams;
    }

    /**
     * Get details of a specific project.
     * @param projectId The project ID to get
     * @param options Optional parameters for filtering returned fields
     * @returns Promise with the project information
     *
     * @example
     * ```typescript
     * const project = await make.projects.get(123);
     * ```
     */
    async get<C extends keyof Project = never>(
        projectId: number,
        options?: GetProjectOptions<C>,
    ): Promise<PickColumns<Project, C>> {
        const response = await this.#fetch<GetProjectResponse<C>>(`${this.#basePath}/${projectId}`, {
            query: {
                cols: options?.cols,
            },
        });
        return response.project ?? response.team;
    }

    /**
     * Create a new project.
     * @param body The project configuration
     * @returns Promise with the created project
     *
     * @example
     * ```typescript
     * const project = await make.projects.create({
     *   name: 'My Project',
     *   organizationId: 123
     * });
     * ```
     */
    async create(body: CreateProjectBody): Promise<Project> {
        const response = await this.#fetch<CreateProjectResponse>(this.#basePath, {
            method: 'POST',
            body,
        });
        return response.project ?? response.team;
    }

    /**
     * Delete a project.
     * @param projectId The project ID to delete
     * @returns Promise that resolves when the project is deleted
     *
     * @example
     * ```typescript
     * await make.projects.delete(123);
     * ```
     */
    async delete(projectId: number): Promise<void> {
        await this.#fetch(`${this.#basePath}/${projectId}`, {
            query: {
                confirmed: true,
            },
            method: 'DELETE',
        });
    }
}
