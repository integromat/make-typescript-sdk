import { enableFetchMocks } from 'jest-fetch-mock';
import type { JSONValue } from '../src/types';
import { isObject } from '../src/utils';
import { Make } from '../src';
enableFetchMocks();

type Mock = [string, unknown, number | Asserts | undefined];
type Asserts = (req: {
    body: Record<string, JSONValue> | Array<JSONValue> | string | ArrayBuffer;
    headers: Headers;
    method: string;
    url: string;
}) => void;

let history: Set<string>;

export function mockFetch(url: string, content: unknown, asserts?: Asserts): void;
export function mockFetch(url: string, content: unknown, status?: number): void;
export function mockFetch(...mocks: Mock[]): void;
export function mockFetch(...args: unknown[]): void {
    if (typeof args[0] === 'string') {
        args = [[args[0], args[1], args[2]]];
    }

    const mocks = args as Mock[];
    const index = new Map<string, { body: unknown; status: number; asserts: Asserts | undefined }>();
    mocks.forEach(mock => {
        if (!/^GET|POST|PUT|DELETE|PATCH /.test(mock[0])) {
            if (!/^(https?:\/)?\//.test(mock[0])) {
                throw new Error(`Invalid mock URL: ${mock[0]}`);
            }
            mock[0] = `GET ${mock[0]}`;
        }
        index.set(mock[0], {
            body: mock[1],
            status: typeof mock[2] === 'number' ? mock[2] : 200,
            asserts: typeof mock[2] === 'function' ? mock[2] : undefined,
        });
    });

    history = new Set();

    fetchMock.resetMocks();
    fetchMock.mockResponse(async req => {
        const mock = index.get(`${req.method} ${req.url}`);
        if (!mock) throw new Error(`Unmocked HTTP request: ${req.method} ${req.url}`);

        if (history.has(req.url)) {
            throw new Error(`${req.url} has been requested mutliple times.`);
        }
        history.add(req.url);

        if (mock.asserts) {
            const contentType = req.headers.get('content-type');
            const isJsonType: boolean = Boolean(
                contentType === 'application/json' || contentType?.startsWith('application/json;'),
            ); //prevent application/jsonc to be parsed as json
            const isBinaryType = Boolean(
                contentType?.startsWith('image/') || contentType?.startsWith('application/octet-stream'),
            );
            const body = isJsonType ? await req.json() : isBinaryType ? await req.arrayBuffer() : await req.text();
            mock.asserts({
                body:
                    body instanceof ArrayBuffer
                        ? body
                        : isObject(body)
                          ? (body as Record<string, JSONValue>)
                          : Array.isArray(body)
                            ? body
                            : String(body),
                headers: req.headers,
                method: req.method,
                url: req.url,
            });
        }

        const binaryBody =
            mock.body instanceof Uint8Array
                ? mock.body
                : mock.body instanceof ArrayBuffer
                  ? new Uint8Array(mock.body)
                  : null;
        return Promise.resolve({
            // Hand the raw bytes to Response so they survive intact; a string body
            // would be re-encoded as UTF-8 and corrupt any byte > 0x7f. Cast because
            // jest-fetch-mock types `body` as string, but undici accepts a Uint8Array.
            body: (binaryBody ??
                (typeof mock.body === 'string' ? mock.body : JSON.stringify(mock.body))) as unknown as string,
            status: mock.status,
            headers: {
                'content-type': binaryBody
                    ? 'image/png'
                    : typeof mock.body === 'string'
                      ? 'text/plain'
                      : 'application/json',
            },
        });
    });
}
export class TestableMake extends Make {
    // Expose the protected method just for tests
    public callHandleResponse<T>(response: Response) {
        return this.handleResponse<T>(response);
    }
}
