import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import { mockFetch } from './test.utils.js';

import * as onPremAgentsListMock from './mocks/on-prem-agents/list.json';
import * as onPremAgentGetMock from './mocks/on-prem-agents/get.json';
import * as onPremAgentCreateMock from './mocks/on-prem-agents/create.json';
import * as onPremAgentUpdateMock from './mocks/on-prem-agents/update.json';
import * as onPremAgentDeleteMock from './mocks/on-prem-agents/delete.json';
import * as onPremAgentAppConfigMock from './mocks/on-prem-agents/app-config.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const ON_PREM_AGENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const APP_NAME = 'sap-agent';

describe('Endpoints: OnPremAgents', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list on-prem agents', async () => {
        mockFetch(`GET https://make.local/api/v2/agents?organizationId=${ORGANIZATION_ID}`, onPremAgentsListMock);

        const result = await make.onPremAgents.list(ORGANIZATION_ID);
        expect(result).toStrictEqual(onPremAgentsListMock.agents);
    });

    it('Should get an on-prem agent', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${ON_PREM_AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            onPremAgentGetMock,
        );

        const result = await make.onPremAgents.get(ORGANIZATION_ID, ON_PREM_AGENT_ID);
        expect(result).toStrictEqual(onPremAgentGetMock.agent);
    });

    it('Should register an on-prem agent via /agent/register', async () => {
        const body = { name: 'New bridge' };

        mockFetch(
            `POST https://make.local/api/v2/agent/register?organizationId=${ORGANIZATION_ID}`,
            onPremAgentCreateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.onPremAgents.create(ORGANIZATION_ID, body);
        expect(result).toStrictEqual(onPremAgentCreateMock.agent);
    });

    it('Should update an on-prem agent', async () => {
        const body = { name: 'Renamed bridge' };

        mockFetch(
            `PATCH https://make.local/api/v2/agents/${ON_PREM_AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            onPremAgentUpdateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.onPremAgents.update(ORGANIZATION_ID, ON_PREM_AGENT_ID, body);
        expect(result).toStrictEqual(onPremAgentUpdateMock.agent);
    });

    it('Should delete an on-prem agent', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/agents/${ON_PREM_AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            onPremAgentDeleteMock,
        );

        const result = await make.onPremAgents.delete(ORGANIZATION_ID, ON_PREM_AGENT_ID);
        expect(result).toStrictEqual(onPremAgentDeleteMock.agent);
    });

    it('Should get app config for connected-system inputs', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${ON_PREM_AGENT_ID}/apps/${APP_NAME}/config?organizationId=${ORGANIZATION_ID}`,
            onPremAgentAppConfigMock,
        );

        const result = await make.onPremAgents.getAppConfig(ORGANIZATION_ID, ON_PREM_AGENT_ID, APP_NAME);
        expect(result).toStrictEqual(onPremAgentAppConfigMock.inputs);
    });

    it('Should throw MakeError when the agent is not found', async () => {
        mockFetch(
            `GET https://make.local/api/v2/agents/${ON_PREM_AGENT_ID}?organizationId=${ORGANIZATION_ID}`,
            { message: 'Not found' },
            404,
        );

        await expect(make.onPremAgents.get(ORGANIZATION_ID, ON_PREM_AGENT_ID)).rejects.toMatchObject({
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
