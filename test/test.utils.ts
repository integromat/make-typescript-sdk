import { enableFetchMocks } from 'jest-fetch-mock';
import type { JSONValue } from '../src/types';
enableFetchMocks();

type Mock = [string, unknown, number | Asserts | undefined];
type Asserts = (req: {
    body: Record<string, JSONValue> | string;
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
            const body = contentType?.includes('application/json') ? await req.json() : await req.text();
            mock.asserts({
                body,
                headers: req.headers,
                method: req.method,
                url: req.url,
            });
        }

        return Promise.resolve({
            body: typeof mock.body === 'string' ? mock.body : JSON.stringify(mock.body),
            status: mock.status,
            headers: {
                'content-type': typeof mock.body === 'string' ? 'text/plain' : 'application/json',
            },
        });
    });
}
