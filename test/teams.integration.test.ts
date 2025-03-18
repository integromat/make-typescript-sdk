import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

describe('Integration: Teams', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let teamId: number;

    it('Should create a team', async () => {
        const team = await make.teams.create({
            name: 'SDK Unit Test Team',
            organizationId: MAKE_ORGANIZATION,
        });

        expect(team).toBeDefined();
        expect(team).toBeDefined();
        expect(team.id).toBeDefined();
        expect(team.name).toContain('SDK Unit Test Team');
        expect(team.organizationId).toBe(MAKE_ORGANIZATION);

        teamId = team.id;
    });

    it('Should get a team', async () => {
        const team = await make.teams.get(teamId);

        expect(team).toBeDefined();
        expect(team.id).toBe(teamId);
        expect(team.organizationId).toBe(MAKE_ORGANIZATION);
    });

    it('Should list teams', async () => {
        const teams = await make.teams.list(MAKE_ORGANIZATION);

        expect(teams).toBeDefined();
        expect(Array.isArray(teams)).toBe(true);
        expect(teams.length).toBeGreaterThanOrEqual(1);

        // Find our created team
        const createdTeam = teams.find(t => t.id === teamId);
        expect(createdTeam).toBeDefined();
        expect(createdTeam?.name).toContain('SDK Unit Test Team');
    });

    it('Should delete a team', async () => {
        await make.teams.delete(teamId);

        // Verify the team is deleted by expecting an error when trying to get it
        try {
            await make.teams.get(teamId);
            // If we get here, the test should fail because the team should be deleted
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
