import 'dotenv/config';
import { afterAll, describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

const CONNECTED_SYSTEM_APPS = ['http', 'sap-agent'] as const;

const integrationReady = Boolean(MAKE_API_KEY && MAKE_ZONE && MAKE_ORGANIZATION);

/** Valid UUID that is unlikely to exist in the test org */
const NON_EXISTENT_AGENT_ID = '00000000-0000-4000-8000-000000000000';

(integrationReady ? describe : describe.skip)('Integration: Agents (on-prem)', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let agentId: string;
    const agentName = `SDK integration agent ${Date.now()}`;

    it('Should verify on-prem agent license on the organization', async () => {
        const org = await make.organizations.get(MAKE_ORGANIZATION);
        expect(org.license?.onPremAgent).toBe(true);
    });

    it('Should register an on-prem agent via /agent/register', async () => {
        const agent = await make.onPremAgents.create(MAKE_ORGANIZATION, { name: agentName });

        expect(agent.id).toBeDefined();
        expect(agent.name).toBe(agentName);
        expect(agent.status).toBeDefined();

        agentId = agent.id;
    });

    it('Should list on-prem agents', async () => {
        const agents = await make.onPremAgents.list(MAKE_ORGANIZATION);

        expect(Array.isArray(agents)).toBe(true);
        expect(agents.some(a => a.id === agentId)).toBe(true);
    });

    it('Should get an on-prem agent', async () => {
        const agent = await make.onPremAgents.get(MAKE_ORGANIZATION, agentId);

        expect(agent.id).toBe(agentId);
        expect(agent.name).toBe(agentName);
    });

    it('Should update an on-prem agent name', async () => {
        const updatedName = `${agentName} updated`;
        const agent = await make.onPremAgents.update(MAKE_ORGANIZATION, agentId, { name: updatedName });

        expect(agent.id).toBe(agentId);
        expect(agent.name).toBe(updatedName);
    });

    it.each(CONNECTED_SYSTEM_APPS)('Should get app config for %s', async appName => {
        const inputs = await make.onPremAgents.getAppConfig(MAKE_ORGANIZATION, agentId, appName);

        expect(Array.isArray(inputs)).toBe(true);
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('Should execute on-prem-agent_list MCP tool', async () => {
        const tool = MakeTools.find(entry => entry.name === 'on-prem-agent_list');
        expect(tool).toBeDefined();

        const result = await tool!.execute(make, { organizationId: MAKE_ORGANIZATION });
        expect(Array.isArray(result)).toBe(true);
        expect((result as { id: string }[]).some(agent => agent.id === agentId)).toBe(true);
    });

    it('Should throw MakeError for a non-existent on-prem agent', async () => {
        await expect(make.onPremAgents.get(MAKE_ORGANIZATION, NON_EXISTENT_AGENT_ID)).rejects.toMatchObject({
            name: 'MakeError',
            statusCode: 400,
        });
    });

    afterAll(async () => {
        if (agentId) {
            await make.onPremAgents.delete(MAKE_ORGANIZATION, agentId);
        }
    });
});
