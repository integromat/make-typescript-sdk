import type { FetchFunction } from '../types.js';

/**
 * Represents a Make user.
 * Contains user profile information and settings.
 */
export type User = {
    /** Unique identifier of the user */
    id: number;
    /** Full name of the user */
    name: string;
    /** Email address of the user */
    email: string;
    /** User's preferred language */
    language: string;
    /** ID of the user's timezone */
    timezoneId: number;
    /** ID of the user's locale settings */
    localeId: number;
    /** ID of the user's country */
    countryId: number;
    /** Features enabled for the user */
    features: Record<string, boolean>;
    /** URL to the user's avatar image */
    avatar: string;
    /** User's timezone as string (e.g., 'Europe/Prague') */
    timezone: string;
    /** User's locale as string (e.g., 'en_US') */
    locale: string;
};

export type Authorization = {
    authUsed: string;
    scope: string[];
};

/**
 * Response format for getting the current user.
 */
type MeResponse = {
    /** The authenticated user's information */
    authUser: User;
};

/**
 * Response format for getting the current authorization.
 */
type CurrentAuthorizationResponse = {
    /** The current authorization information */
    authorization: Authorization;
};

/**
 * Class providing methods for working with Make users.
 * Allows retrieving information about the current user.
 */
export class Users {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Users instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Get the current authenticated user's information.
     * @returns Promise with the current user's profile data
     */
    async me(): Promise<User> {
        return (await this.#fetch<MeResponse>('/users/me')).authUser;
    }

    /**
     * Get the current authenticated user's information.
     * @returns Promise with the current user's profile data
     */
    async currentAuthorization(): Promise<Authorization> {
        return (await this.#fetch<CurrentAuthorizationResponse>('/users/current-authorization')).authorization;
    }
}
