import type { QueryValue } from './types.js';

/** Regular expression to validate a UUIDv4 string format */
const UUIDv4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a value is an object (not null and not an array)
 * @param value Value to check
 * @returns True if the value is an object
 */
export function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Determine if a string is in API key format (UUIDv4)
 * @param value The string to check
 * @returns True if the string matches UUIDv4 format used for API keys
 */
export function isAPIKey(value: string): boolean {
    return UUIDv4_RE.test(value);
}

/**
 * Build a URL with query parameters
 * @param baseUrl The base URL
 * @param params Object containing query parameters
 * @returns URL with query parameters properly encoded and appended
 */
export function buildUrl(baseUrl: string, params: Record<string, QueryValue> = {}): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }

        if (Array.isArray(value)) {
            value.forEach(item => {
                if (item !== undefined && item !== null) {
                    searchParams.append(`${key}[]`, String(item));
                }
            });
        } else if (isObject(value)) {
            for (const [subKey, subValue] of Object.entries(value)) {
                if (subValue !== undefined && subValue !== null) {
                    searchParams.append(`${key}[${subKey}]`, String(subValue));
                }
            }
        } else {
            searchParams.append(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}` : baseUrl;
}

/**
 * Create a MakeError from a fetch Response
 * Attempts to extract error information from JSON response
 * @param res The Response object from fetch
 * @returns A MakeError instance with appropriate message and status code
 */
export async function createMakeError(res: Response): Promise<MakeError> {
    try {
        const body: unknown = await res.clone().json();
        if (isObject(body) && 'message' in body && typeof body.message === 'string') {
            let message = 'detail' in body && typeof body.detail === 'string' ? body.detail : body.message;
            if ('suberrors' in body && Array.isArray(body.suberrors)) {
                body.suberrors
                    .filter(suberr => {
                        return isObject(suberr) && 'message' in suberr && typeof suberr.message === 'string';
                    })
                    .forEach(suberr => {
                        message += `\n - ${suberr.message}`;
                    });
            }
            return new MakeError(message, res.status);
        }
    } catch (err: unknown) {
        // Do nothing.
    }

    return new MakeError(res.statusText, res.status);
}

/**
 * Error class for handling Make API errors
 * Contains the error message and HTTP status code
 */
export class MakeError extends Error {
    /** HTTP status code returned by the API */
    statusCode?: number;
    /** List of sub-errors if provided by the API */
    subErrors?: string[];

    /**
     * Create a new MakeError
     * @param message Error message
     * @param statusCode HTTP status code
     */
    constructor(message: string, statusCode?: number) {
        super(message);

        this.name = 'MakeError';
        this.statusCode = statusCode;
    }
}
