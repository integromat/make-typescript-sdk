import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as agentsListMock from './mocks/agents/list.json';
import * as agentAppConfigMock from './mocks/agents/app-config.json';
import * as connectedSystemAppsMock from './mocks/enums/connected-system-apps.json';
import * as connectedSystemsListMock from './mocks/connected-systems/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const AGENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: on-prem agent and connected-system', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute on-prem-agent_list', async () => {
        mockFetch(`GET https://make.local/api/v2/agents?organizationId=${ORGANIZATION_ID}`, agentsListMock);

        const tool = getTool('on-prem-agent_list');
        const result = await tool.execute(make, { organizationId: ORGANIZATION_ID });

        expect(result).toStrictEqual(agentsListMock.agents);
    });

    it('Should execute on-prem-agent_get-app-config', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${AGENT_ID}/apps/sap-agent/config?organizationId=${ORGANIZATION_ID}`,
            agentAppConfigMock,
        );

        const tool = getTool('on-prem-agent_get-app-config');
        const result = await tool.execute(make, {
            organizationId: ORGANIZATION_ID,
            agentId: AGENT_ID,
            appName: 'sap-agent',
        });

        expect(result).toStrictEqual(agentAppConfigMock.inputs);
    });

    it('Should execute connected-system_list-apps', async () => {
        mockFetch(
            'GET https://make.local/api/v2/enums/connected-system-apps',
            connectedSystemAppsMock,
        );

        const tool = getTool('connected-system_list-apps');
        const result = await tool.execute(make, {});

        expect(result).toStrictEqual(connectedSystemAppsMock.connectedSystemApps);
    });

    it('Should execute connected-system_list', async () => {
        mockFetch(
            `GET https://make.local/api/v2/connected-systems?organizationId=${ORGANIZATION_ID}&agentId=${AGENT_ID}`,
            connectedSystemsListMock,
        );

        const tool = getTool('connected-system_list');
        const result = await tool.execute(make, {
            organizationId: ORGANIZATION_ID,
            agentId: AGENT_ID,
        });

        expect(result).toStrictEqual(connectedSystemsListMock.connectedSystems);
    });
});
