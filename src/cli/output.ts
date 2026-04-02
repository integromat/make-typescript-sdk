export type OutputFormat = 'json' | 'compact' | 'table';

export function formatOutput(data: unknown, format: OutputFormat): string {
    if (typeof data === 'string') return data;

    if (format === 'compact') return JSON.stringify(data);
    if (format === 'json') return JSON.stringify(data, null, 2);

    return formatTable(data);
}

const MAX_COL_WIDTH = 60;

function formatTable(data: unknown): string {
    const rows = Array.isArray(data) ? data : [data];

    if (rows.length === 0) return '(empty)';

    const keys = [
        ...new Set(rows.flatMap((r) => (r && typeof r === 'object' ? Object.keys(r as object) : []))),
    ];

    if (keys.length === 0) return JSON.stringify(data, null, 2);

    const serialize = (v: unknown): string => {
        const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
        return s.length > MAX_COL_WIDTH ? `${s.slice(0, MAX_COL_WIDTH - 1)}…` : s;
    };

    const getCell = (row: unknown, key: string): unknown =>
        row && typeof row === 'object' ? (row as Record<string, unknown>)[key] : undefined;

    const widths: Record<string, number> = Object.fromEntries(
        keys.map((k) => [
            k,
            Math.max(k.length, ...rows.map((r) => serialize(getCell(r, k)).length)),
        ]),
    );

    const header = keys.map((k) => k.padEnd(widths[k]!)).join(' | ');
    const sep = keys.map((k) => '-'.repeat(widths[k]!)).join('-+-');
    const body = rows.map((r) =>
        keys.map((k) => serialize(getCell(r, k)).padEnd(widths[k]!)).join(' | '),
    );

    return [header, sep, ...body].join('\n');
}
