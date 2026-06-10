import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import { mockFetch } from './test.utils.js';

import * as agentsListMock from './mocks/agents/list.json';
import * as agentGetMock from './mocks/agents/get.json';
import * as agentCreateMock from './mocks/agents/create.json';
import * as agentUpdateMock from './mocks/agents/update.json';
import * as agentDeleteMock from './mocks/agents/delete.json';
import * as agentAppConfigMock from './mocks/agents/app-config.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const AGENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const APP_NAME = 'sap-agent';

describe('Endpoints: Agents (on-prem)', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list on-prem agents', async () => {
        mockFetch(`GET https://make.local/api/v2/agents?organizationId=${ORGANIZATION_ID}`, agentsListMock);

        const result = await make.onPremAgents.list(ORGANIZATION_ID);
        expect(result).toStrictEqual(agentsListMock.agents);
    });

    it('Should get an on-prem agent', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            agentGetMock,
        );

        const result = await make.onPremAgents.get(ORGANIZATION_ID, AGENT_ID);
        expect(result).toStrictEqual(agentGetMock.agent);
    });

    it('Should register an on-prem agent via /agent/register', async () => {
        const body = { name: 'New bridge' };

        mockFetch(
            `POST https://make.local/api/v2/agent/register?organizationId=${ORGANIZATION_ID}`,
            agentCreateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.onPremAgents.create(ORGANIZATION_ID, body);
        expect(result).toStrictEqual(agentCreateMock.agent);
    });

    it('Should update an on-prem agent', async () => {
        const body = { name: 'Renamed bridge' };

        mockFetch(
            `PATCH https://make.local/api/v2/agents/${AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            agentUpdateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.onPremAgents.update(ORGANIZATION_ID, AGENT_ID, body);
        expect(result).toStrictEqual(agentUpdateMock.agent);
    });

    it('Should delete an on-prem agent', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/agents/${AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            agentDeleteMock,
        );

        const result = await make.onPremAgents.delete(ORGANIZATION_ID, AGENT_ID);
        expect(result).toStrictEqual(agentDeleteMock.agent);
    });

    it('Should get app config for connected-system inputs', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${AGENT_ID}/apps/${APP_NAME}/config?organizationId=${ORGANIZATION_ID}`,
            agentAppConfigMock,
        );

        const result = await make.onPremAgents.getAppConfig(ORGANIZATION_ID, AGENT_ID, APP_NAME);
        expect(result).toStrictEqual(agentAppConfigMock.inputs);
    });

    it('Should throw MakeError when the agent is not found', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            { message: 'Not found' },
            404,
        );

        await expect(make.onPremAgents.get(ORGANIZATION_ID, AGENT_ID)).rejects.toMatchObject({
            name: 'MakeError',
            statusCode: 404,
            message: 'Not found',
        });
    });

    it('Should throw MakeError when agent registration fails validation', async () => {
        mockFetch(
            `POST https://make.local/api/v2/agent/register?organizationId=${ORGANIZATION_ID}`,
            {
                message: 'Validation failed',
                suberrors: [{ message: 'Name is required' }],
            },
            422,
        );

        await expect(make.onPremAgents.create(ORGANIZATION_ID, { name: '' })).rejects.toBeInstanceOf(MakeError);
    });
});
