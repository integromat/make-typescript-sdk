import type { FetchFunction } from '../types.js';

export type User = {
    id: number;
    name: string;
    email: string;
    language: string;
    timezoneId: number;
    localeId: number;
    countryId: number;
    features: Record<string, boolean>;
    avatar: string;
    timezone: string;
    locale: string;
};

type MeResponse = {
    authUser: User;
};

export class Users {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * Get the current user's information
     * @returns Promise with the current user's information
     */
    async me(): Promise<User> {
        return (await this.#fetch<MeResponse>('/users/me')).authUser;
    }
}
