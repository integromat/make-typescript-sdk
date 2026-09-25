import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as auditLogsListMock from './mocks/audit-logs/list.json';
import * as auditLogsGetMock from './mocks/audit-logs/get.json';
import * as auditLogsFiltersMock from './mocks/audit-logs/filters.json';
import * as auditLogsTeamFiltersMock from './mocks/audit-logs/team-filters.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 3;
const TEAM_ID = 212;
const CURSOR = '1788264000000_c37c729235cd4dc4911321b23beaea7d';
const UUID = 'c37c7292-35cd-4dc4-9113-21b23beaea7d';

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: audit-logs', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should expose exactly the five audit-log tools', () => {
        expect(MakeTools.filter(tool => tool.category === 'audit-logs').map(tool => tool.name)).toStrictEqual([
            'audit-logs_list',
            'audit-logs_list-for-team',
            'audit-logs_get',
            'audit-logs_get-filters',
            'audit-logs_get-filters-for-team',
        ]);
    });

    // The endpoints default to 1000 entries; the tool layer caps an unspecified page at 100 so a
    // tool result stays a sane size. Pinned here because nothing else would catch it regressing.
    it('Should cap audit-logs_list at the default page size when no limit is given', async () => {
        mockFetch(
            `GET https://make.local/api/v2/audit-logs/v2/organization/${ORGANIZATION_ID}?pg%5Blimit%5D=100`,
            auditLogsListMock,
        );

        const result = await getTool('audit-logs_list').execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    it('Should map every audit-logs_list argument onto the query, including team', async () => {
        mockFetch(
            `GET https://make.local/api/v2/audit-logs/v2/organization/${ORGANIZATION_ID}?pg%5BsortBy%5D=triggeredAt&pg%5BsortDir%5D=desc&pg%5Blimit%5D=20&pg%5Boffset%5D=40&dateFrom=2026-09-01&dateTo=2026-09-22T23%3A59%3A59.999Z&event%5B%5D=webhook_created&event%5B%5D=webhook_updated&author%5B%5D=212&author%5B%5D=john.doe%40example.com&team%5B%5D=212&team%5B%5D=Operations`,
            auditLogsListMock,
        );

        const result = await getTool('audit-logs_list').execute(make, {
            organizationId: ORGANIZATION_ID,
            sortBy: 'triggeredAt',
            sortDir: 'desc',
            limit: 20,
            offset: 40,
            dateFrom: '2026-09-01',
            dateTo: '2026-09-22T23:59:59.999Z',
            event: ['webhook_created', 'webhook_updated'],
            author: ['212', 'john.doe@example.com'],
            team: ['212', 'Operations'],
        });

        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    it('Should execute audit-logs_list-for-team with a cursor', async () => {
        mockFetch(
            `GET https://make.local/api/v2/audit-logs/v2/team/${TEAM_ID}?pg%5Blimit%5D=100&pg%5Blast%5D=${CURSOR}`,
            auditLogsListMock,
        );

        const result = await getTool('audit-logs_list-for-team').execute(make, { teamId: TEAM_ID, last: CURSOR });

        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    // The team endpoint has no `team` filter, so the team tool must not forward one.
    it('Should not send a team filter from audit-logs_list-for-team', async () => {
        mockFetch(`GET https://make.local/api/v2/audit-logs/v2/team/${TEAM_ID}?pg%5Blimit%5D=5`, auditLogsListMock);

        const result = await getTool('audit-logs_list-for-team').execute(make, {
            teamId: TEAM_ID,
            limit: 5,
            team: ['999'],
        });

        expect(result).toStrictEqual(auditLogsListMock.auditLogs);
    });

    it('Should execute audit-logs_get', async () => {
        mockFetch(`GET https://make.local/api/v2/audit-logs/v2/${ORGANIZATION_ID}/${UUID}`, auditLogsGetMock);

        const result = await getTool('audit-logs_get').execute(make, {
            organizationId: ORGANIZATION_ID,
            uuid: UUID,
        });

        expect(result).toStrictEqual(auditLogsGetMock);
    });

    it('Should execute audit-logs_get-filters', async () => {
        mockFetch(
            `GET https://make.local/api/v2/audit-logs/v2/organization/${ORGANIZATION_ID}/filters`,
            auditLogsFiltersMock,
        );

        const result = await getTool('audit-logs_get-filters').execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(auditLogsFiltersMock);
    });

    it('Should execute audit-logs_get-filters-for-team', async () => {
        mockFetch(`GET https://make.local/api/v2/audit-logs/v2/team/${TEAM_ID}/filters`, auditLogsTeamFiltersMock);

        const result = await getTool('audit-logs_get-filters-for-team').execute(make, { teamId: TEAM_ID });

        expect(result).toStrictEqual(auditLogsTeamFiltersMock);
    });
});
