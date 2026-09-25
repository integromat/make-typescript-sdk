import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as auditLogsListMock from './mocks/audit-logs/list.json';
import * as auditLogsGetMock from './mocks/audit-logs/get.json';
import * as auditLogsFiltersMock from './mocks/audit-logs/filters.json';
import * as auditLogsTeamFiltersMock from './mocks/audit-logs/team-filters.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: AuditLogs', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list organization audit logs', async () => {
        mockFetch('GET https://make.local/api/v2/audit-logs/v2/organization/3', auditLogsListMock);

        const result = await make.auditLogs.list(3);
        // The explicit type makes optional cursors a compile-time regression.
        const cursors: string[] = result.map(entry => entry.imtId);
        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
        expect(cursors).toStrictEqual(auditLogsListMock.auditLogs.map(entry => entry.imtId));
    });

    it('Should list organization audit logs with filters, sorting and pagination', async () => {
        mockFetch(
            'GET https://make.local/api/v2/audit-logs/v2/organization/3?pg%5BsortBy%5D=triggeredAt&pg%5BsortDir%5D=desc&pg%5Blimit%5D=20&dateFrom=2026-09-01&dateTo=2026-09-22&event%5B%5D=webhook_created&event%5B%5D=webhook_updated&author%5B%5D=212&author%5B%5D=john.doe%40example.com&team%5B%5D=212&team%5B%5D=Operations',
            auditLogsListMock,
        );

        const result = await make.auditLogs.list(3, {
            pg: { sortBy: 'triggeredAt', sortDir: 'desc', limit: 20 },
            dateFrom: '2026-09-01',
            dateTo: '2026-09-22',
            event: ['webhook_created', 'webhook_updated'],
            author: [212, 'john.doe@example.com'],
            team: [212, 'Operations'],
        });
        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    it('Should page through organization audit logs with a cursor', async () => {
        mockFetch(
            'GET https://make.local/api/v2/audit-logs/v2/organization/3?pg%5Blast%5D=1713528322000_c37c729235cd4dc4911321b23beaea7d&pg%5Blimit%5D=20',
            auditLogsListMock,
        );

        const result = await make.auditLogs.list(3, {
            pg: { last: '1713528322000_c37c729235cd4dc4911321b23beaea7d', limit: 20 },
        });
        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    it('Should list team audit logs', async () => {
        mockFetch('GET https://make.local/api/v2/audit-logs/v2/team/212', auditLogsListMock);

        const result = await make.auditLogs.listForTeam(212);
        const cursors: string[] = result.map(entry => entry.imtId);
        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
        expect(cursors).toStrictEqual(auditLogsListMock.auditLogs.map(entry => entry.imtId));
    });

    it('Should list team audit logs with filters', async () => {
        mockFetch(
            'GET https://make.local/api/v2/audit-logs/v2/team/212?pg%5Blimit%5D=20&event%5B%5D=webhook_created',
            auditLogsListMock,
        );

        const result = await make.auditLogs.listForTeam(212, {
            pg: { limit: 20 },
            event: ['webhook_created'],
        });
        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    it('Should get audit log detail', async () => {
        mockFetch(
            'GET https://make.local/api/v2/audit-logs/v2/3/c37c7292-35cd-4dc4-9113-21b23beaea7d',
            auditLogsGetMock,
        );

        const result = await make.auditLogs.get(3, 'c37c7292-35cd-4dc4-9113-21b23beaea7d');
        expect(result).toStrictEqual(auditLogsGetMock);
    });

    it('Should get organization audit log filters', async () => {
        mockFetch('GET https://make.local/api/v2/audit-logs/v2/organization/3/filters', auditLogsFiltersMock);

        const result = await make.auditLogs.getFilters(3);
        expect(result).toStrictEqual(auditLogsFiltersMock);
    });

    it('Should get team audit log filters', async () => {
        mockFetch('GET https://make.local/api/v2/audit-logs/v2/team/212/filters', auditLogsTeamFiltersMock);

        const result = await make.auditLogs.getFiltersForTeam(212);
        expect(result).toStrictEqual(auditLogsTeamFiltersMock);
    });
});
