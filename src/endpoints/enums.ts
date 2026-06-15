import type { FetchFunction } from '../types.js';

export type Country = {
    /** Unique identifier of the country */
    id: number;
    /** Name of the country */
    name: string;
    /** Three-letter upper-case country code */
    code: string;
    /** Two-letter lower-case country code */
    code2: string;
};

export type Region = {
    /** Unique identifier of the region */
    id: number;
    /** Name of the region */
    name: string;
};

export type Timezone = {
    /** Unique identifier of the timezone */
    id: number;
    /** Display name of the timezone */
    name: string;
    /** Timezone code (e.g. Europe/Prague) */
    code: string;
    /** UTC offset */
    offset: string;
};

/**
 * On-prem connected-system app available for bridge agents.
 */
export type ConnectedSystemApp = {
    /** App slug used as `appName` when creating a connected system */
    name: string;
    /** Human-readable label */
    label: string;
    /** Icon identifier or URL */
    icon: string;
};

type ListCountriesResponse = {
    /** List of countries */
    countries: Country[];
};

type ListRegionsResponse = {
    /** List of regions */
    imtRegions: Region[];
};

type ListTimezonesResponse = {
    /** List of timezones */
    timezones: Timezone[];
};

type ListConnectedSystemAppsResponse = {
    /** List of connected-system apps supported on on-prem agents */
    connectedSystemApps: ConnectedSystemApp[];
};

/**
 * Class providing methods for working with Make enums.
 * Enums provide access to standardized lists of values like countries, regions, and timezones.
 */
export class Enums {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Enums instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Get list of all countries.
     * @returns Promise with the list of countries
     */
    async countries(): Promise<Country[]> {
        return (await this.#fetch<ListCountriesResponse>('/enums/countries')).countries;
    }

    /**
     * Get list of all regions/states.
     * @returns Promise with the list of regions
     */
    async regions(): Promise<Region[]> {
        return (await this.#fetch<ListRegionsResponse>('/enums/imt-regions')).imtRegions;
    }

    /**
     * Get list of all timezones.
     * @returns Promise with the list of timezones
     */
    async timezones(): Promise<Timezone[]> {
        return (await this.#fetch<ListTimezonesResponse>('/enums/timezones')).timezones;
    }

    /**
     * Get list of apps available for on-prem connected systems (e.g. `http`, `sap-agent`).
     * @returns Promise with the list of connected-system apps
     */
    async connectedSystemApps(): Promise<ConnectedSystemApp[]> {
        return (await this.#fetch<ListConnectedSystemAppsResponse>('/enums/connected-system-apps')).connectedSystemApps;
    }
}
