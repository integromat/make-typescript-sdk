import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeError } from '../src/utils.js';
import { mockFetch } from './test.utils.js';

import * as connectedSystemsListMock from './mocks/connected-systems/list.json';
import * as connectedSystemGetMock from './mocks/connected-systems/get.json';
import * as connectedSystemCreateMock from './mocks/connected-systems/create.json';
import * as connectedSystemUpdateMock from './mocks/connected-systems/update.json';
import * as connectedSystemDeleteMock from './mocks/connected-systems/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const ORGANIZATION_ID = 5;
const AGENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const CONNECTED_SYSTEM_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

describe('Endpoints: Connected systems (on-prem)', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list connected systems for an agent', async () => {
        mockFetch(
            `GET https://make.local/api/v2/connected-systems?organizationId=${ORGANIZATION_ID}&agentId=${AGENT_ID}`,
            connectedSystemsListMock,
        );

        const result = await make.connectedSystems.list(ORGANIZATION_ID, AGENT_ID);
        expect(result).toStrictEqual(connectedSystemsListMock.connectedSystems);
    });

    it('Should get a connected system', async () => {
        mockFetch(
            `GET https://make.local/api/v2/connected-systems/${CONNECTED_SYSTEM_ID}?organizationId=${ORGANIZATION_ID}`,
            connectedSystemGetMock,
        );

        const result = await make.connectedSystems.get(ORGANIZATION_ID, CONNECTED_SYSTEM_ID);
        expect(result).toStrictEqual(connectedSystemGetMock.connectedSystem);
    });

    it('Should create a connected system with keyed inputs object', async () => {
        const body = {
            name: 'SAP production',
            agentId: AGENT_ID,
            appName: 'sap-agent',
            inputs: { ashost: '00', sysnr: '00', client: '00' },
        };

        mockFetch(
            `POST https://make.local/api/v2/connected-systems?organizationId=${ORGANIZATION_ID}`,
            connectedSystemCreateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.connectedSystems.create(ORGANIZATION_ID, body);
        expect(result).toStrictEqual(connectedSystemCreateMock.connectedSystem);
    });

    it('Should update a connected system', async () => {
        const body = { name: 'SAP staging' };

        mockFetch(
            `PATCH https://make.local/api/v2/connected-systems/${CONNECTED_SYSTEM_ID}?organizationId=${ORGANIZATION_ID}`,
            connectedSystemUpdateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.connectedSystems.update(ORGANIZATION_ID, CONNECTED_SYSTEM_ID, body);
        expect(result).toStrictEqual(connectedSystemUpdateMock.connectedSystem);
    });

    it('Should delete a connected system', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/connected-systems/${CONNECTED_SYSTEM_ID}?organizationId=${ORGANIZATION_ID}`,
            connectedSystemDeleteMock,
        );

        const result = await make.connectedSystems.delete(ORGANIZATION_ID, CONNECTED_SYSTEM_ID);
        expect(result).toStrictEqual(connectedSystemDeleteMock.connectedSystem);
    });

    it('Should throw MakeError when the connected system is not found', async () => {
        mockFetch(
            `GET https://make.local/api/v2/connected-systems/${CONNECTED_SYSTEM_ID}?organizationId=${ORGANIZATION_ID}`,
            { message: 'Not found' },
            404,
        );

        await expect(make.connectedSystems.get(ORGANIZATION_ID, CONNECTED_SYSTEM_ID)).rejects.toMatchObject({
            name: 'MakeError',
            statusCode: 404,
            message: 'Not found',
        });
    });

    it('Should throw MakeError when agency rejects create', async () => {
        const body = {
            name: 'SAP production',
            agentId: AGENT_ID,
            appName: 'sap-agent',
            inputs: { language: 'EN' },
        };

        mockFetch(
            `POST https://make.local/api/v2/connected-systems?organizationId=${ORGANIZATION_ID}`,
            { message: 'Request to the Agency has failed: [400] Bad Request' },
            400,
        );

        await expect(make.connectedSystems.create(ORGANIZATION_ID, body)).rejects.toBeInstanceOf(MakeError);
    });
});
