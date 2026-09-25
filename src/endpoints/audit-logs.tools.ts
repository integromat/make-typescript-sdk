import type { Make } from '../make.js';
import type { JSONSchema, MakeTool } from '../tools.js';
import type { AuditLogsSortBy, ListAuditLogsOptions, ListOrganizationAuditLogsOptions } from './audit-logs.js';

/**
 * Entries returned per call when the caller does not ask for a specific limit.
 *
 * Consumer policy, not an API default: the endpoints themselves default to 1000 entries,
 * which is far more than a tool result should carry. The SDK methods stay faithful to the
 * API and inject nothing — only these tool definitions cap the page size.
 */
const DEFAULT_LIMIT = 100;

/** Shared filtering, sorting, and pagination arguments of the two list tools. */
type ListArgs = {
    dateFrom?: string;
    dateTo?: string;
    event?: string[];
    author?: string[];
    sortBy?: AuditLogsSortBy;
    sortDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    last?: string;
};

/**
 * JSON Schema fragment for the filtering, sorting, and pagination arguments shared by both
 * list tools. Parameterised by the name of the filters tool covering the same scope, so the
 * team variant points at `audit-logs_get-filters-for-team` rather than the organization one.
 */
const listProperties = (filtersTool: string): Record<string, JSONSchema> => ({
    dateFrom: {
        type: 'string',
        description:
            "Return entries triggered at or after this point in time, as an ISO 8601 date ('2026-09-01') or date-time ('2026-09-01T12:00:00.000Z')",
    },
    dateTo: {
        type: 'string',
        description: 'Return entries triggered at or before this point in time, as an ISO 8601 date or date-time',
    },
    event: {
        type: 'array',
        items: { type: 'string' },
        description: `Filter by one or more event names, for example 'webhook_created'. Discover the valid values with ${filtersTool}.`,
    },
    author: {
        type: 'array',
        items: { type: 'string' },
        description: `Filter by one or more actors, each given as a user ID, a user name, or an email address. Discover the valid values with ${filtersTool}.`,
    },
    sortBy: {
        type: 'string',
        enum: ['triggeredAt', 'createdAt', 'eventName', 'targetId'],
        description: 'Property to sort the entries by. Defaults to triggeredAt.',
    },
    sortDir: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort direction. Defaults to asc, so pass desc for the most recent entries first.',
    },
    limit: {
        type: 'number',
        minimum: 1,
        maximum: 10000,
        default: DEFAULT_LIMIT,
        description: `Maximum number of entries to return. Defaults to ${DEFAULT_LIMIT}.`,
    },
    offset: {
        type: 'number',
        minimum: 0,
        description: 'Number of matching entries to skip. Ignored when last is set.',
    },
    last: {
        type: 'string',
        description:
            'imtId of the last entry of the previous page, used for cursor pagination. Prefer this over offset when paging through a large result set.',
    },
});

/** Maps the flattened list arguments onto the SDK's options shape. */
const toListOptions = (args: ListArgs): ListAuditLogsOptions => ({
    dateFrom: args.dateFrom,
    dateTo: args.dateTo,
    event: args.event,
    author: args.author,
    pg: {
        sortBy: args.sortBy,
        sortDir: args.sortDir,
        limit: args.limit ?? DEFAULT_LIMIT,
        offset: args.offset,
        last: args.last,
    },
});

export const tools: MakeTool[] = [
    {
        name: 'audit-logs_list',
        title: 'List organization audit logs',
        description:
            'List the audit log entries of an organization: who changed what and when, across the organization and all of its teams. Entries carry no event-specific payload — call audit-logs_get with the organizationId and uuid from the entry to see that. Requires the Admin or Owner role on the organization.',
        category: 'audit-logs',
        scope: 'audit-logs:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: { type: 'number', description: 'The organization ID to list audit log entries for' },
                team: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'Filter by one or more teams, each given as a team ID or a team name. Discover the valid values with audit-logs_get-filters.',
                },
                ...listProperties('audit-logs_get-filters'),
            },
            required: ['organizationId'],
        },
        examples: [
            { organizationId: 3 },
            { organizationId: 3, event: ['webhook_created'], sortDir: 'desc', limit: 20 },
        ],
        execute: async (make: Make, args: { organizationId: number; team?: string[] } & ListArgs) => {
            const { organizationId, team, ...rest } = args;
            const options: ListOrganizationAuditLogsOptions = { ...toListOptions(rest), team };
            return await make.auditLogs.list(organizationId, options);
        },
    },
    {
        name: 'audit-logs_list-for-team',
        title: 'List team audit logs',
        description:
            'List the audit log entries of a single team: who changed what and when within that team. Entries carry no event-specific payload — call audit-logs_get with the organizationId and uuid from the entry to see that. Use audit-logs_list instead to cover a whole organization.',
        category: 'audit-logs',
        scope: 'audit-logs:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to list audit log entries for' },
                ...listProperties('audit-logs_get-filters-for-team'),
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 212 }, { teamId: 212, dateFrom: '2026-09-01', sortDir: 'desc', limit: 20 }],
        execute: async (make: Make, args: { teamId: number } & ListArgs) => {
            const { teamId, ...rest } = args;
            return await make.auditLogs.listForTeam(teamId, toListOptions(rest));
        },
    },
    {
        name: 'audit-logs_get',
        title: 'Get audit log detail',
        description:
            'Get a single audit log entry together with its event-specific detail payload — the part the list tools omit. Call this to find out what actually changed in an event surfaced by audit-logs_list or audit-logs_list-for-team.',
        category: 'audit-logs',
        scope: 'audit-logs:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        resourceId: 'uuid',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: {
                    type: 'number',
                    description:
                        'The ID of the organization the entry belongs to. Must match the entry, or the call is rejected.',
                },
                uuid: {
                    type: 'string',
                    description:
                        "The uuid of the audit log entry, as returned by audit-logs_list or audit-logs_list-for-team (e.g. 'c37c7292-35cd-4dc4-9113-21b23beaea7d'). Hyphens are optional.",
                },
            },
            required: ['organizationId', 'uuid'],
        },
        examples: [{ organizationId: 3, uuid: 'c37c7292-35cd-4dc4-9113-21b23beaea7d' }],
        execute: async (make: Make, args: { organizationId: number; uuid: string }) => {
            return await make.auditLogs.get(args.organizationId, args.uuid);
        },
    },
    {
        name: 'audit-logs_get-filters',
        title: 'Get organization audit log filters',
        description:
            'Get the values accepted by the filters of audit-logs_list for an organization: selectable users for author, teams for team, and events for event. Call this first when building a filtered audit log query, so the filter values are real rather than guessed.',
        category: 'audit-logs',
        scope: 'audit-logs:read',
        scopeId: 'organizationId',
        identifier: 'organizationId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                organizationId: {
                    type: 'number',
                    description: 'The organization ID to get audit log filter options for',
                },
            },
            required: ['organizationId'],
        },
        examples: [{ organizationId: 3 }],
        execute: async (make: Make, args: { organizationId: number }) => {
            return await make.auditLogs.getFilters(args.organizationId);
        },
    },
    {
        name: 'audit-logs_get-filters-for-team',
        title: 'Get team audit log filters',
        description:
            'Get the values accepted by the filters of audit-logs_list-for-team: selectable users for author and events for event. Call this first when building a filtered team audit log query, so the filter values are real rather than guessed.',
        category: 'audit-logs',
        scope: 'audit-logs:read',
        scopeId: 'teamId',
        identifier: 'teamId',
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
        inputSchema: {
            type: 'object',
            properties: {
                teamId: { type: 'number', description: 'The team ID to get audit log filter options for' },
            },
            required: ['teamId'],
        },
        examples: [{ teamId: 212 }],
        execute: async (make: Make, args: { teamId: number }) => {
            return await make.auditLogs.getFiltersForTeam(args.teamId);
        },
    },
];
