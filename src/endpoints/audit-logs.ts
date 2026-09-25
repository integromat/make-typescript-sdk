import type { FetchFunction, JSONValue } from '../types.js';

/**
 * A user referenced by an audit log entry, either as its actor or as a filter option.
 */
export type AuditLogUser = {
    /** Unique identifier of the user */
    id: number;
    /** Display name of the user */
    name?: string;
    /** Email address of the user */
    email?: string;
};

/**
 * A team referenced by an audit log entry, either as its scope or as a filter option.
 */
export type AuditLogTeam = {
    /** Unique identifier of the team */
    id: number;
    /** Name of the team */
    name?: string;
};

/**
 * An organization referenced by an audit log entry.
 */
export type AuditLogOrganization = {
    /** Unique identifier of the organization */
    id: number;
    /** Name of the organization */
    name?: string;
};

/**
 * Version transition recorded for audited entities that carry a versioned payload,
 * such as a scenario blueprint.
 */
export type AuditLogVersion = {
    /** Version the entity was on before the event, absent for the first version */
    from?: string;
    /** Version the entity was on after the event */
    to: string;
};

/**
 * The fields every audit log entry carries, whichever endpoint returned it.
 * Audit logs record administrative and configuration events across an organization
 * and its teams.
 *
 * The two endpoint families each add one field of their own — see
 * {@link AuditLogListEntry} and {@link AuditLogDetail}.
 */
export type AuditLog = {
    /** UUIDv4 of the audit log entry. Hyphens are optional. */
    uuid: string;
    /** ISO 8601 timestamp of when the entry was stored */
    createdAt: string;
    /** ISO 8601 timestamp of when the audited event occurred */
    triggeredAt: string;
    /** ID of the organization the entry belongs to */
    organizationId?: number;
    /** Organization the entry belongs to */
    organization?: AuditLogOrganization;
    /** Name of the audited event, for example `webhook_created` */
    eventName: string;
    /** Team the entry belongs to, absent for organization-level events */
    team?: AuditLogTeam;
    /** User who triggered the event */
    actor: AuditLogUser;
    /** ID of the entity the event was performed on */
    targetId: string;
    /** Version transition of the audited entity, when it carries a versioned payload */
    version?: AuditLogVersion;
};

/**
 * An audit log entry as returned by the list endpoints, carrying the cursor used to
 * page through results.
 *
 * Deliberately separate from {@link AuditLogDetail}: the detail endpoint is reached by
 * uuid rather than by cursor and never returns an `imtId`, so typing the two apart stops
 * a detail entry being passed back as a `pg.last` cursor that would silently do nothing.
 */
export type AuditLogListEntry = AuditLog & {
    /**
     * Cursor identifier, present on every list entry. Pass the last entry's value as `pg.last` to
     * request the next page.
     */
    imtId: string;
};

/**
 * An audit log entry together with its event-specific detail payload, as returned by
 * the detail endpoint. Carries no `imtId` — see {@link AuditLogListEntry}.
 */
export type AuditLogDetail = AuditLog & {
    /** Event-specific detail payload, its shape depending on the event */
    detail?: Record<string, JSONValue>;
};

/**
 * Audit log property the results can be sorted by.
 */
export type AuditLogsSortBy = 'triggeredAt' | 'createdAt' | 'eventName' | 'targetId';

/**
 * Pagination and sorting options for audit log listings.
 *
 * Distinct from the SDK's shared `Pagination` type: the audit log endpoints also
 * support cursor pagination through `last`.
 *
 * The endpoints additionally accept `returnTotalCount`, which is deliberately absent here.
 * It only populates the response's own pagination object, and the list methods return just
 * the entries — so setting it could never change anything the caller observes.
 */
export type AuditLogsPagination = {
    /** Property to sort results by. Defaults to `triggeredAt`. */
    sortBy: AuditLogsSortBy;
    /** Sort direction. Defaults to `asc`. */
    sortDir: 'asc' | 'desc';
    /**
     * `imtId` of the last entry from the previous page.
     * When provided, `offset` is ignored.
     */
    last: string;
    /** Maximum number of entries to return, between 1 and 10000. Defaults to 1000. */
    limit: number;
    /** Number of matching entries to skip. Ignored when `last` is provided. Defaults to 0. */
    offset: number;
};

/**
 * Options shared by the organization and team audit log listings.
 */
export type ListAuditLogsOptions = {
    /** Pagination and sorting options */
    pg?: Partial<AuditLogsPagination>;
    /**
     * Return entries triggered at or after this point in time,
     * as an ISO 8601 date, an ISO 8601 date-time, or a Unix timestamp in milliseconds.
     */
    dateFrom?: string | number;
    /**
     * Return entries triggered at or before this point in time,
     * as an ISO 8601 date, an ISO 8601 date-time, or a Unix timestamp in milliseconds.
     */
    dateTo?: string | number;
    /** Filter by one or more event names */
    event?: string[];
    /** Filter by one or more actor IDs, names, or email addresses */
    author?: (string | number)[];
};

/**
 * Options for listing the audit logs of an organization.
 */
export type ListOrganizationAuditLogsOptions = ListAuditLogsOptions & {
    /** Filter by one or more team IDs or team names */
    team?: (string | number)[];
};

/**
 * A single selectable value of an audit log filter.
 */
export type AuditLogFilterItem = {
    /** Human-readable label of the value */
    label: string;
    /** Value to pass to the corresponding list parameter */
    value: string;
};

/**
 * A named group of audit log filter values.
 */
export type AuditLogFilterCategory = {
    /** Heading of the group */
    header: string;
    /** Values belonging to the group */
    items: AuditLogFilterItem[];
};

/**
 * A single group of audit log filter values carrying no heading.
 */
export type AuditLogUncategorizedFilterItems = {
    /** Values belonging to the group */
    items: AuditLogFilterItem[];
};

/**
 * Available values of an audit log filter, either grouped under headings or
 * returned as a single uncategorized group.
 */
export type AuditLogFilterOptions = AuditLogFilterCategory[] | AuditLogUncategorizedFilterItems[];

/**
 * Filter options available for an organization's audit logs.
 */
export type OrganizationAuditLogFilters = {
    /** Users selectable as the `author` filter */
    users: AuditLogUser[];
    /** Teams selectable as the `team` filter */
    teams: AuditLogTeam[];
    /** Events selectable as the `event` filter */
    events: AuditLogFilterOptions;
};

/**
 * Filter options available for a team's audit logs.
 */
export type TeamAuditLogFilters = {
    /** Users selectable as the `author` filter */
    users: AuditLogUser[];
    /** Events selectable as the `event` filter */
    events: AuditLogFilterOptions;
};

/**
 * Response format for listing audit logs.
 */
type ListAuditLogsResponse = {
    /** The matching audit log entries */
    auditLogs: AuditLogListEntry[];
    /** Pagination state of the response */
    pg: Partial<AuditLogsPagination> & { returnTotalCount?: boolean; totalCount?: number };
};

/**
 * Class providing methods for working with Make audit logs.
 *
 * Audit logs record administrative and configuration events across an organization
 * and its teams. Reading them requires the `audit-logs:read` scope, the Admin or Owner
 * role on the organization (or the corresponding team role for team-scoped reads),
 * and an organization license that includes the audit logs feature.
 *
 * The list methods return the entries alone. To page through a large result set, pass the
 * `imtId` of the last entry you received as the next call's `pg.last`.
 */
export class AuditLogs {
    readonly #fetch: FetchFunction;

    /**
     * Create a new AuditLogs instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List the audit log entries of an organization.
     * @param organizationId The organization ID to list audit log entries for
     * @param options Optional filtering, sorting, and pagination parameters
     * @returns Promise with the list of audit log entries
     */
    async list(organizationId: number, options?: ListOrganizationAuditLogsOptions): Promise<AuditLogListEntry[]> {
        return (
            await this.#fetch<ListAuditLogsResponse>(`/audit-logs/v2/organization/${organizationId}`, {
                query: {
                    pg: options?.pg,
                    dateFrom: options?.dateFrom,
                    dateTo: options?.dateTo,
                    event: options?.event,
                    author: options?.author,
                    team: options?.team,
                },
            })
        ).auditLogs;
    }

    /**
     * List the audit log entries of a team.
     * @param teamId The team ID to list audit log entries for
     * @param options Optional filtering, sorting, and pagination parameters
     * @returns Promise with the list of audit log entries
     */
    async listForTeam(teamId: number, options?: ListAuditLogsOptions): Promise<AuditLogListEntry[]> {
        return (
            await this.#fetch<ListAuditLogsResponse>(`/audit-logs/v2/team/${teamId}`, {
                query: {
                    pg: options?.pg,
                    dateFrom: options?.dateFrom,
                    dateTo: options?.dateTo,
                    event: options?.event,
                    author: options?.author,
                },
            })
        ).auditLogs;
    }

    /**
     * Get a single audit log entry together with its event-specific detail payload.
     * @param organizationId The ID of the organization the entry belongs to
     * @param uuid The UUIDv4 of the audit log entry
     * @returns Promise with the audit log entry detail
     */
    async get(organizationId: number, uuid: string): Promise<AuditLogDetail> {
        return await this.#fetch<AuditLogDetail>(`/audit-logs/v2/${organizationId}/${uuid}`);
    }

    /**
     * Get the filter options available for an organization's audit logs.
     * @param organizationId The organization ID to get filter options for
     * @returns Promise with the available users, teams, and events
     */
    async getFilters(organizationId: number): Promise<OrganizationAuditLogFilters> {
        return await this.#fetch<OrganizationAuditLogFilters>(`/audit-logs/v2/organization/${organizationId}/filters`);
    }

    /**
     * Get the filter options available for a team's audit logs.
     * @param teamId The team ID to get filter options for
     * @returns Promise with the available users and events
     */
    async getFiltersForTeam(teamId: number): Promise<TeamAuditLogFilters> {
        return await this.#fetch<TeamAuditLogFilters>(`/audit-logs/v2/team/${teamId}/filters`);
    }
}
