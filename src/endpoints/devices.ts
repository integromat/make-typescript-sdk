import type { FetchFunction, PickColumns } from '../types.js';

/**
 * Represents device hardware and software information.
 */
export type DeviceInfo = {
    /** Operating system */
    os: 'iOS' | 'Android';
    /** Device manufacturer (e.g. Apple, Samsung) */
    brand: string;
    /** Device model (e.g. iPhone) */
    model: string;
    /** Operating system version */
    osversion: string;
    /** Make app version installed on the device */
    appversion: string;
};

/**
 * Represents a registered device in Make.
 * Devices are mobile phones or tablets connected to Make that can trigger
 * or interact with scenarios through the Make mobile app.
 */
export type Device = {
    /** Unique identifier of the device */
    id: number;
    /** User-defined name of the device */
    name: string;
    /** ID of the team that owns the device */
    teamId: number;
    /** Unique device identifier */
    udid: string;
    /** List of capabilities/triggers the device supports */
    scope: string[];
    /** Hardware and software information about the device */
    info: DeviceInfo;
    /** Whether the device is no longer accessible */
    gone: boolean;
    /** Number of items currently in the device queue */
    queueCount: number;
    /** Maximum number of items allowed in the device queue */
    queueLimit: number;
    /** IDs of scenarios associated with this device */
    scenarioId: number[];
};

/**
 * Options for listing devices.
 * @template C Keys of the Device type to include in the response
 */
export type ListDevicesOptions<C extends keyof Device = never> = {
    /** Specific columns/fields to include in the response */
    cols?: C[] | ['*'];
};

/**
 * Response format for listing devices.
 */
type ListDevicesResponse<C extends keyof Device = never> = {
    devices: PickColumns<Device, C>[];
};

/**
 * Class providing methods for working with Make devices.
 * Devices are mobile phones or tablets connected to Make that can trigger
 * or interact with scenarios through the Make mobile app.
 */
export class Devices {
    readonly #fetch: FetchFunction;

    /**
     * Create a new Devices instance.
     * @param fetch Function for making API requests
     */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List devices for a team.
     * @param teamId The team ID to list devices for
     * @param options Optional parameters for filtering and pagination
     * @returns Promise with the list of devices
     *
     * @example
     * ```typescript
     * // List all devices in team 1
     * const devices = await make.devices.list(1);
     * ```
     */
    async list<C extends keyof Device = never>(
        teamId: number,
        options?: ListDevicesOptions<C>,
    ): Promise<PickColumns<Device, C>[]> {
        return (
            await this.#fetch<ListDevicesResponse<C>>('/devices', {
                query: {
                    teamId,
                    cols: options?.cols,
                },
            })
        ).devices;
    }
}
