/**
 * A generic export type for = API responses.
 *
 * @template T - The type of the data included in the response.
 */
export interface GenericResponse<T = undefined> {
    status: string;
    data?: T;
    message?: string;
}

/**
 * engagement over time data
 */
export type EngagementOverTime = {
    date: string;
    clicks: number;
}

/**
 * location data
 */
export type LocationData = {
    country?: string;
    city?: string;
    clicks: number;
}

/**
 * device data
 */
export type DeviceData = {
    device_type?: string;
    browser?: string;
    os?: string;
    clicks: number;
}