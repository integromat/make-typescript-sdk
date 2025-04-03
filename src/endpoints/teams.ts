import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents a team in Make.
 * Teams are workspaces for organizing scenarios, users, and resources
 * within an organization's account.
 */
export type Team = {
    /** Unique identifier of the team */
    id: number;
    /** Name of the team */
    name: string;
    /** ID of the organization this team belongs to */
    organizationId: number;
    /** Number of active scenarios in the team */
    activeScenarios?: number;
    /** Number of active apps in the team */
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
    /** Whether the team is paused */
    isPaused?: boolean;
};

/**
 * Represents a user's role in a team.
 * Defines the relationship between a user and a team, including permissions.
 */
type UserTeamRole = {
    /** ID of the user's role */
    usersRoleId: number;
    /** ID of the user */
    userId: number;
    /** ID of the team */
    teamId: number;
    /** Whether the role can be changed */
    changeable: boolean;
};

/**
 * Options for listing teams.
 * @template C Keys of the Team type to include in the response
 */
export type ListTeamsOptions<C extends keyof Team = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
    /** Pagination options */
    pg?: Partial<Pagination<Team>>;
};

/**
 * Response format for listing teams.
 */
type ListTeamsResponse<C extends keyof Team = never> = {
    /** List of teams matching the query */
    teams: PickColumns<Team, C>[];
    /** Pagination information */
    pg: Pagination<Team>;
};

/**
 * Parameters for creating a new team.
 */
export type CreateTeamBody = {
    /** Name for the new team */
    name: string;
    /** ID of the organization where the team will be created */
    organizationId: number;
    /** Maximum operations limit for the team */
    operationsLimit?: number;
    /** Maximum data transfer limit for the team */
    transferLimit?: number;
};

/**
 * Response format for creating a team.
 */
type CreateTeamResponse = {
    /** The created team */
    team: Team;
    /** The creator's role in the team */
    userTeamRole: UserTeamRole;
};

/**
 * Options for retrieving a team.
 * @template C Keys of the Team type to include in the response
 */
export type GetTeamOptions<C extends keyof Team = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[];
};

/**
 * Response format for getting a team.
 */
type GetTeamResponse<C extends keyof Team = never> = {
    /** The requested team */
    team: PickColumns<Team, C>;
};

/**
 * Class providing methods for working with Make teams.
 * Teams are workspaces for organizing scenarios, users, and resources within an organization.
 * Each user can be a member of multiple teams and have different roles in each.
 */
export class Teams {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Teams instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all teams in an organization.
     * @param organizationId The organization ID to list teams for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of teams
     *
     * @example
     * ```typescript
     * // List all teams in organization 123
     * const teams = await make.teams.list(123);
     *
     * // List teams with pagination
     * const teams = await make.teams.list(123, {
     *   pg: { sortBy: 'name', sortDir: 'asc' }
     * });
     * ```
     */
    async list<C extends keyof Team = never>(
        organizationId: number,
        options?: ListTeamsOptions<C>,
    ): Promise<PickColumns<Team, C>[]> {
        return (
            await this.#fetch<ListTeamsResponse<C>>('/teams', {
                query: {
                    organizationId,
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).teams;
    }

    /**
     * Get details of a specific team.
     * @param teamId The team ID to get
     * @param options Optional parameters for filtering returned fields
     * @returns Promise with the team information
     *
     * @example
     * ```typescript
     * const team = await make.teams.get(123);
     * ```
     */
    async get<C extends keyof Team = never>(
        teamId: number,
        options?: GetTeamOptions<C>,
    ): Promise<PickColumns<Team, C>> {
        return (
            await this.#fetch<GetTeamResponse<C>>(`/teams/${teamId}`, {
                query: {
                    cols: options?.cols,
                },
            })
        ).team;
    }

    /**
     * Create a new team.
     * @param body The team configuration
     * @returns Promise with the created team
     *
     * @example
     * ```typescript
     * const team = await make.teams.create({
     *   name: 'My Team',
     *   organizationId: 123
     * });
     * ```
     */
    async create(body: CreateTeamBody): Promise<Team> {
        return (
            await this.#fetch<CreateTeamResponse>('/teams', {
                method: 'POST',
                body,
            })
        ).team;
    }

    /**
     * Delete a team.
     * @param teamId The team ID to delete
     * @returns Promise that resolves when the team is deleted
     *
     * @example
     * ```typescript
     * await make.teams.delete(123);
     * ```
     */
    async delete(teamId: number): Promise<void> {
        await this.#fetch(`/teams/${teamId}`, {
            query: {
                confirmed: true,
            },
            method: 'DELETE',
        });
    }
}
