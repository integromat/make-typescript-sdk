import type { FetchFunction, Pagination, PickColumns } from '../types.js';

/**
 * Represents an organization in Make.
 * Organizations are top-level entities that contain teams and manage overall
 * account settings, billing, and user permissions.
 */
export type Organization = {
    /** Unique identifier of the organization */
    id: number;
    /** Name of the organization */
    name: string;
    /** The ID of the timezone associated with the organization */
    timezoneId: number;
    /** The zone where the organization is hosted */
    zone: string;
    /** The ID of the country associated with the organization */
    countryId: number;
    /** License information for the organization */
    license: {
        /** List of enabled apps */
        apps?: string[];
        /** Maximum number of users */
        users?: number;
        /** Data store limit in records */
        dslimit: number;
        /** File storage limit in bytes */
        fslimit: number;
        /** Input/output operations limit */
        iolimit: number;
        /** Advanced scheduling enabled */
        advsched?: boolean;
        /** Data store storage limit in bytes */
        dsslimit: number;
        /** Full text search enabled */
        fulltext?: boolean;
        /** Minimum scheduling interval in minutes */
        interval: number;
        /** Data transfer limit in bytes */
        transfer: number;
        /** Operations limit */
        operations: number;
        /** Teams limit */
        teams: number;
        /** Portal access enabled */
        portal?: boolean;
        /** API rate limit */
        apiLimit?: number;
        /** Execution priority level */
        priority?: 'low' | 'medium' | 'high';
        /** Log retention period in days */
        retention?: number;
        /** Incomplete executions storage limit in bytes */
        dlqStorage?: number;
        /** Scenario inputs/outputs enabled */
        scenarioIO?: boolean;
        /** Grace period in days */
        gracePeriod: number;
        /** Tier of Make AI tools */
        makeAITools?: number;
        /** On-premise agent enabled */
        onPremAgent?: boolean;
        /** Tier of premium apps */
        premiumApps?: number;
        /** Dedicated SSO enabled */
        dedicatedSso?: boolean;
        /** Audit logs retention period in days */
        auditLogsDays?: number;
        /** Maximum execution time in seconds */
        executionTime?: number;
        /** Restart period for subscriptions */
        restartPeriod?: string;
        /** Analytics access enabled */
        analyticsAccess?: boolean;
        /** Custom IML functions enabled */
        customFunctions?: boolean;
        /** Custom organization/team variables enabled */
        customVariables?: boolean;
        /** Number of custom properties allowed */
        customProperties?: number;
        /** Creating templates enabled */
        creatingTemplates?: boolean;
        /** Installing public apps enabled */
        installPublicApps?: boolean;
        /** Product management type */
        productManagement: string;
        /** Dynamic connections enabled */
        dynamicConnections?: boolean;
        /** On-demand scheduling enabled */
        onDemandScheduling?: boolean;
        /** Portal module bridge enabled */
        portalModuleBridge?: boolean;
        /** Dynamic dependencies enabled */
        dynamicDependencies?: boolean;
        /** Scenario relation tree enabled */
        scenarioRelationTree?: boolean;
        /** Team operations limits enabled */
        teamOperationsLimits?: boolean;
        /** Webhook log retention period in days */
        webhookLogRetentionDays?: number;
    };
    /** The name of the subscription for the organization */
    serviceName: string;
    /** Teams in the organization */
    teams: Array<{
        /** Team ID */
        id: number;
        /** Team name */
        name: string;
    }>;
    /** Whether the organization is paused */
    isPaused: boolean;
    /** Subscription name */
    productName: string;
    /** Last subscription reset date */
    lastReset: string | null;
    /** Next subscription reset date */
    nextReset: string | null;
    /** Current operations count */
    operations: string;
    /** Current transfer amount */
    transfer: string;
    /** Extended operations count */
    operationsExt: string;
    /** Auto purchasing activated */
    autoPurchasingActivated: boolean;
    /** Extended transfer amount */
    transferExt: string;
    /** Unused operations */
    unusedOperations: string;
    /** Unused transfer */
    unusedTransfer: string;
    /** Organization features */
    features: Record<string, unknown>;
    /** External ID for white label instances */
    externalId: string;
    /** Number of active apps */
    activeApps: number;
    /** Number of active scenarios */
    activeScenarios: number;
    /** Solution partner link */
    solutionPartnerLink: string;
};

export type PartialOrganization = Pick<
    Organization,
    | 'id'
    | 'name'
    | 'zone'
    | 'teams'
    | 'timezoneId'
    | 'countryId'
    | 'externalId'
    | 'isPaused'
    | 'license'
    | 'productName'
    | 'serviceName'
    | 'solutionPartnerLink'
>;

/**
 * Options for listing organizations.
 * @template C Keys of the Organization type to include in the response
 */
export type ListOrganizationsOptions<C extends keyof Organization = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
    /** Pagination options */
    pg?: Partial<Pagination<Organization>>;
};

/**
 * Response format for listing organizations.
 */
type ListOrganizationsResponse<C extends keyof Organization = never> = {
    /** List of organizations matching the query */
    organizations: PickColumns<Organization, C>[];
    /** Pagination information */
    pg: Pagination<Organization>;
};

/**
 * Options for getting an organization.
 */
export type GetOrganizationOptions = {
    /** Wait for the organization to be ready */
    wait?: boolean;
};

/**
 * Response format for getting an organization.
 */
type GetOrganizationResponse<C extends keyof Organization = never> = {
    /** The requested organization */
    organization: PickColumns<Organization, C>;
};

/**
 * Parameters for creating a new organization.
 */
export type CreateOrganizationBody = {
    /** Name of the organization */
    name: string;
    /** The ID of the region the organization will be created in */
    regionId: number;
    /** The ID of the timezone */
    timezoneId: number;
    /** The ID of the country */
    countryId: number;
};

/**
 * Response format for creating an organization.
 */
type CreateOrganizationResponse = {
    /** The created organization */
    organization: PartialOrganization;
};

/**
 * Parameters for updating an organization.
 */
export type UpdateOrganizationBody = {
    /** New name for the organization */
    name?: string;
    /** The ID of the timezone */
    timezoneId?: number;
    /** The ID of the country */
    countryId?: number;
};

/**
 * Response format for updating an organization.
 */
type UpdateOrganizationResponse = {
    /** The updated organization */
    organization: PartialOrganization;
};

/**
 * Class providing methods for working with Make organizations.
 * Organizations are top-level entities that contain teams and manage overall
 * account settings, billing, and user permissions.
 */
export class Organizations {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Organizations instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all organizations accessible by the current user.
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of organizations
     */
    async list<C extends keyof Organization = never>(
        options?: ListOrganizationsOptions<C>,
    ): Promise<PickColumns<Organization, C, 'id' | 'name' | 'zone' | 'timezoneId'>[]> {
        return (
            await this.#fetch<ListOrganizationsResponse<C>>('/organizations', {
                query: {
                    cols: options?.cols,
                    pg: options?.pg,
                },
            })
        ).organizations;
    }

    /**
     * Get details of a specific organization.
     * @param organizationId The organization ID to get
     * @param options Optional parameters for filtering returned fields
     * @returns Promise with the organization information
     *
     * @example
     * ```typescript
     * const organization = await make.organizations.get(123);
     * ```
     */
    async get<C extends keyof Organization = never>(
        organizationId: number,
        options?: GetOrganizationOptions,
    ): Promise<PickColumns<Organization, C>> {
        return (
            await this.#fetch<GetOrganizationResponse<C>>(`/organizations/${organizationId}`, {
                query: {
                    wait: options?.wait,
                },
            })
        ).organization;
    }

    /**
     * Create a new organization.
     * @param body Parameters for the organization to create
     * @returns Promise with the created organization
     */
    async create(body: CreateOrganizationBody): Promise<PartialOrganization> {
        return (
            await this.#fetch<CreateOrganizationResponse>('/organizations', {
                method: 'POST',
                body,
            })
        ).organization;
    }

    /**
     * Update an organization.
     * @param organizationId The organization ID to update
     * @param body The organization properties to update
     * @returns Promise with the updated organization
     */
    async update(organizationId: number, body: UpdateOrganizationBody): Promise<PartialOrganization> {
        return (
            await this.#fetch<UpdateOrganizationResponse>(`/organizations/${organizationId}`, {
                method: 'PATCH',
                body,
            })
        ).organization;
    }

    /**
     * Delete an organization.
     * @param organizationId The organization ID to delete
     * @returns Promise that resolves when the organization is deleted
     */
    async delete(organizationId: number): Promise<void> {
        await this.#fetch(`/organizations/${organizationId}`, {
            method: 'DELETE',
            query: {
                confirmed: true,
            },
        });
    }
}
