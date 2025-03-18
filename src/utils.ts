import type { QueryValue } from './types.js';

export function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

export class MakeError extends Error {
    statusCode?: number;
    subErrors?: string[];

    constructor(message: string, statusCode?: number) {
        super(message);

        this.name = 'MakeError';
        this.statusCode = statusCode;
    }
}
