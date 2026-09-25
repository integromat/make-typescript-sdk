import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

/**
 * Audit logs are read-only, so there is nothing to create or clean up. The API key needs the
 * `audit-logs:read` scope, the Admin or Owner role on the organization, and a license that
 * includes the audit logs feature — without any of those the endpoints answer 401, 403 or 402.
 */
describe('Integration: AuditLogs', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list organization audit logs', async () => {
        const auditLogs = await make.auditLogs.list(MAKE_ORGANIZATION, { pg: { limit: 10, sortDir: 'desc' } });

        expect(Array.isArray(auditLogs)).toBe(true);
        expect(auditLogs.length).toBeLessThanOrEqual(10);
    });

    it('Should list team audit logs', async () => {
        const auditLogs = await make.auditLogs.listForTeam(MAKE_TEAM, { pg: { limit: 10, sortDir: 'desc' } });

        expect(Array.isArray(auditLogs)).toBe(true);
        expect(auditLogs.length).toBeLessThanOrEqual(10);
    });

    it('Should get organization audit log filters', async () => {
        const filters = await make.auditLogs.getFilters(MAKE_ORGANIZATION);

        expect(Array.isArray(filters.users)).toBe(true);
        expect(Array.isArray(filters.teams)).toBe(true);
        expect(Array.isArray(filters.events)).toBe(true);
    });

    it('Should get team audit log filters', async () => {
        const filters = await make.auditLogs.getFiltersForTeam(MAKE_TEAM);

        expect(Array.isArray(filters.users)).toBe(true);
        expect(Array.isArray(filters.events)).toBe(true);
    });

    it('Should get the detail of the most recent organization audit log entry', async () => {
        const [auditLog] = await make.auditLogs.list(MAKE_ORGANIZATION, { pg: { limit: 1, sortDir: 'desc' } });
        if (!auditLog) return;

        const detail = await make.auditLogs.get(MAKE_ORGANIZATION, auditLog.uuid);

        expect(detail.uuid).toBe(auditLog.uuid);
        expect(detail.eventName).toBe(auditLog.eventName);
    });
});
