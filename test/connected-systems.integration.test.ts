import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import {
    assertInputsMatchAppConfig,
    parseInputs,
} from './connected-systems.utils.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_ORGANIZATION = Number(process.env.MAKE_ORGANIZATION || 0);

const CONNECTED_SYSTEM_APPS = ['http', 'sap-agent'] as const;

type ConnectedSystemAppName = (typeof CONNECTED_SYSTEM_APPS)[number];

const CREATE_INPUTS_ENV: Record<ConnectedSystemAppName, string> = {
    http: 'MAKE_CONNECTED_SYSTEM_HTTP_INPUTS',
    'sap-agent': 'MAKE_CONNECTED_SYSTEM_SAP_AGENT_INPUTS',
};

const integrationReady = Boolean(MAKE_API_KEY && MAKE_ZONE && MAKE_ORGANIZATION);

/** Valid UUID that is unlikely to exist in the test org */
const NON_EXISTENT_RESOURCE_ID = '00000000-0000-4000-8000-000000000000';

function createSuiteEnabled(appName: ConnectedSystemAppName): boolean {
    return integrationReady && Boolean(process.env[CREATE_INPUTS_ENV[appName]]);
}

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

(integrationReady ? describe : describe.skip)('Integration: Connected systems (on-prem, read)', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let agentId: string;

    it('Should verify on-prem agent license on the organization', async () => {
        const org = await make.organizations.get(MAKE_ORGANIZATION);
        expect(org.license?.onPremAgent).toBe(true);
    });

    it('Should provision a temporary on-prem agent for connected-system reads', async () => {
        const agent = await make.onPremAgents.create(MAKE_ORGANIZATION, {
            name: `SDK integration CS agent ${Date.now()}`,
        });
        agentId = agent.id;
        expect(agentId).toBeDefined();
    });

    it('Should list http and sap-agent in connected-system apps', async () => {
        const apps = await make.enums.connectedSystemApps();
        const names = apps.map(app => app.name);

        expect(Array.isArray(apps)).toBe(true);
        for (const appName of CONNECTED_SYSTEM_APPS) {
            expect(names).toContain(appName);
        }
    });

    it.each(CONNECTED_SYSTEM_APPS)('Should get app config for %s', async appName => {
        const config = await make.onPremAgents.getAppConfig(MAKE_ORGANIZATION, agentId, appName);

        expect(Array.isArray(config)).toBe(true);
        expect(config.length).toBeGreaterThan(0);
    });

    it('Should list connected systems for the agent', async () => {
        const systems = await make.connectedSystems.list(MAKE_ORGANIZATION, agentId);

        expect(Array.isArray(systems)).toBe(true);
    });

    it('Should execute connected-system_list MCP tool', async () => {
        const tool = getTool('connected-system_list');
        const systems = await tool.execute(make, {
            organizationId: MAKE_ORGANIZATION,
            agentId,
        });

        expect(Array.isArray(systems)).toBe(true);
    });

    it('Should throw MakeError for a non-existent connected system', async () => {
        await expect(
            make.connectedSystems.get(MAKE_ORGANIZATION, NON_EXISTENT_RESOURCE_ID),
        ).rejects.toMatchObject({ name: 'MakeError', statusCode: 400 });
    });

    afterAll(async () => {
        if (agentId) {
            await make.onPremAgents.delete(MAKE_ORGANIZATION, agentId);
        }
    });
});

for (const appName of CONNECTED_SYSTEM_APPS) {
    const inputsEnv = CREATE_INPUTS_ENV[appName];
    const inputsRaw = process.env[inputsEnv];
    const suiteReady = createSuiteEnabled(appName);
    const skipHint = suiteReady ? '' : ` — set ${inputsEnv} in .env`;

    (suiteReady ? describe : describe.skip)(
        `Integration: Connected systems (on-prem, create ${appName})${skipHint}`,
        () => {
            const make = new Make(MAKE_API_KEY, MAKE_ZONE);

            let agentId: string;
            let connectedSystemId: string;
            const systemName = `SDK integration ${appName} ${Date.now()}`;

            beforeAll(async () => {
                const agent = await make.onPremAgents.create(MAKE_ORGANIZATION, {
                    name: `SDK integration ${appName} create ${Date.now()}`,
                });
                agentId = agent.id;

                const config = await make.onPremAgents.getAppConfig(MAKE_ORGANIZATION, agentId, appName);
                assertInputsMatchAppConfig(
                    config,
                    parseInputs(inputsRaw, inputsEnv),
                    inputsEnv,
                    appName,
                );
            });

            it(`Should create a ${appName} connected system`, async () => {
                const connectedSystem = await make.connectedSystems.create(MAKE_ORGANIZATION, {
                    name: systemName,
                    agentId,
                    appName,
                    inputs: parseInputs(inputsRaw, inputsEnv),
                });

                expect(connectedSystem.id).toBeDefined();
                expect(connectedSystem.name).toBe(systemName);
                expect(connectedSystem.agentId).toBe(agentId);
                expect(connectedSystem.appName).toBe(appName);

                connectedSystemId = connectedSystem.id;
            });

            it(`Should get the ${appName} connected system`, async () => {
                const connectedSystem = await make.connectedSystems.get(
                    MAKE_ORGANIZATION,
                    connectedSystemId,
                );

                expect(connectedSystem.id).toBe(connectedSystemId);
                expect(connectedSystem.appName).toBe(appName);
            });

            it(`Should update the ${appName} connected system name`, async () => {
                const updatedName = `${systemName} updated`;
                const connectedSystem = await make.connectedSystems.update(
                    MAKE_ORGANIZATION,
                    connectedSystemId,
                    { name: updatedName },
                );

                expect(connectedSystem.name).toBe(updatedName);
            });

            afterAll(async () => {
                if (connectedSystemId) {
                    await make.connectedSystems.delete(MAKE_ORGANIZATION, connectedSystemId);
                }
                if (agentId) {
                    await make.onPremAgents.delete(MAKE_ORGANIZATION, agentId);
                }
            });
        },
    );
}
