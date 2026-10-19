import type { FetchFunction } from '../types.js';
import { Projects } from './projects.js';
import type { CreateProjectBody, GetProjectOptions, ListProjectsOptions, Project } from './projects.js';

/**
 * Represents a project (formerly team) in Make.
 * @deprecated Teams were renamed to Projects. Use {@link Project} instead.
 */
export type Team = Project;

/**
 * Options for listing projects (formerly teams).
 * @deprecated Use {@link ListProjectsOptions} instead.
 */
export type ListTeamsOptions<C extends keyof Team = never> = ListProjectsOptions<C>;

/**
 * Parameters for creating a new project (formerly team).
 * @deprecated Use {@link CreateProjectBody} instead.
 */
export type CreateTeamBody = CreateProjectBody;

/**
 * Options for retrieving a project (formerly team).
 * @deprecated Use {@link GetProjectOptions} instead.
 */
export type GetTeamOptions<C extends keyof Team = never> = GetProjectOptions<C>;

/**
 * Class providing methods for working with Make projects (formerly teams) through the legacy `/teams` API paths.
 * Same methods as {@link Projects}; the parameter named `teamId` is the project ID.
 * @deprecated Teams were renamed to Projects. Use `make.projects` ({@link Projects}) instead.
 */
export class Teams extends Projects {
    /**
     * Create a new Teams instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        super(fetch, '/teams');
    }
}
