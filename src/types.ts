export type JSONValue =
    | Partial<{ [key: string]: JSONValue }>
    | JSONValue[]
    | string
    | number
    | boolean
    | null
    | undefined;

export type QueryValue =
    | undefined
    | string
    | number
    | boolean
    | Record<string, string | number | boolean | undefined>
    | Array<string | number | boolean | undefined>;

export type FetchOptions = {
    headers?: Record<string, string>;
    query?: Record<string, QueryValue>;
    body?: Record<string, JSONValue> | string;
    method?: string;
};

export type FetchFunction = <T = unknown>(url: string, options?: FetchOptions) => Promise<T>;

export type Pagination<T> = {
    sortBy: keyof T;
    sortDir: 'asc' | 'desc';
    offset: number;
    limit: number;
};

export type PickColumns<T, K extends keyof T | never> = [K] extends [never] ? T : { [P in K]-?: NonNullable<T[P]> };
