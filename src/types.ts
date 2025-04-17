/**
 * Represents a JSON-compatible value that can be serialized and deserialized.
 * Used for request and response bodies in the SDK.
 */
export type JSONValue =
    | Partial<{ [key: string]: JSONValue }>
    | JSONValue[]
    | string
    | number
    | boolean
    | null
    | undefined;

/**
 * Represents a value that can be used in a query parameter.
 * Handles primitive types, records, and arrays for URL parameter construction.
 */
export type QueryValue =
    | undefined
    | string
    | number
    | boolean
    | Record<string, string | number | boolean | undefined>
    | Array<string | number | boolean | undefined>;

/**
 * Options for configuring API requests.
 */
export type FetchOptions = {
    /** HTTP headers to include with the request */
    headers?: Record<string, string>;
    /** Query parameters to append to the URL */
    query?: Record<string, QueryValue>;
    /** Request body as an object or string */
    body?: Record<string, JSONValue> | string;
    /** HTTP method (GET, POST, PATCH, etc.) */
    method?: string;
};

/**
 * Function signature for making API requests.
 * @template T The expected response type
 * @param url The endpoint URL
 * @param options Request options including headers, query parameters, and body
 * @returns Promise resolving to the response data
 */
export type FetchFunction = <T = unknown>(url: string, options?: FetchOptions) => Promise<T>;

/**
 * Pagination parameters for API requests that return lists of items.
 * @template T The type of object being paginated
 */
export type Pagination<T> = {
    /** Field to sort results by */
    sortBy: keyof T;
    /** Sort direction (ascending or descending) */
    sortDir: 'asc' | 'desc';
    /** Number of items to skip */
    offset: number;
    /** Maximum number of items to return */
    limit: number;
};

/**
 * Utility type that picks specified columns from an object type.
 * Used to request only specific fields from API responses.
 * @template T The object type to pick columns from
 * @template K The keys to pick from the object
 * @template D The default columns to pick if K is never (all if not specified)
 */
export type PickColumns<T, K extends keyof T | never, D extends keyof T | never = never> = [K] extends [never]
    ? [D] extends [never]
        ? T
        : Pick<T, D>
    : { [P in K]-?: NonNullable<T[P]> };
