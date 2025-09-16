import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/rpcs/list.json';
import * as getMock from '../mocks/sdk/rpcs/get.json';
import * as createMock from '../mocks/sdk/rpcs/create.json';
import * as updateMock from '../mocks/sdk/rpcs/update.json';
import * as getSectionMock from '../mocks/sdk/rpcs/get-section.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > RPCs', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);
    const appName = 'test-app';
    const appVersion = 1;
    const rpcName = 'listUsers';

    it('Should list SDK app RPCs', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs`, listMock);

        const result = await make.sdk.rpcs.list(appName, appVersion);
        expect(result).toStrictEqual(listMock.appRpcs);
    });

    it('Should get SDK app RPC by name', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, getMock);

        const result = await make.sdk.rpcs.get(appName, appVersion, rpcName);
        expect(result).toStrictEqual(getMock.appRpc);
    });

    it('Should create SDK app RPC', async () => {
        const body = {
            name: 'listUsers',
            label: 'List Users',
        };
        mockFetch(`POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.rpcs.create(appName, appVersion, body);
        expect(result).toStrictEqual(createMock.appRpc);
    });

    it('Should update SDK app RPC', async () => {
        const body = {
            label: 'Updated Label',
            connection: 'myConnection',
        };
        mockFetch(
            `PATCH https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`,
            updateMock,
            req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/json');
            },
        );

        const result = await make.sdk.rpcs.update(appName, appVersion, rpcName, body);
        expect(result).toStrictEqual(updateMock.appRpc);
    });

    it('Should delete SDK app RPC', async () => {
        mockFetch(`DELETE https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, null);

        await make.sdk.rpcs.delete(appName, appVersion, rpcName);
    });

    it('Should test SDK app RPC', async () => {
        const body = {
            data: {
                id: '1',
                name: 'Test User',
            },
            schema: [
                { name: 'id', type: 'text', required: true },
                { name: 'name', type: 'text', required: true },
            ],
        };
        mockFetch(`POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}`, null, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        await make.sdk.rpcs.test(appName, appVersion, rpcName, body);
    });

    it('Should get SDK app RPC section', async () => {
        const section = 'api';
        mockFetch(
            `GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}/${section}`,
            getSectionMock,
        );

        const result = await make.sdk.rpcs.getSection(appName, appVersion, rpcName, section);
        expect(result).toStrictEqual(getSectionMock);
    });

    it('Should set SDK app RPC section', async () => {
        const section = 'api';
        const body = JSON.stringify({
            url: '/api/users',
            method: 'GET',
            qs: {},
            body: {},
            headers: {},
            response: {
                iterate: '{{body.users}}',
                output: {
                    label: '{{item.name}}',
                    value: '{{item.id}}',
                },
            },
        });
        mockFetch(
            `PUT https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/rpcs/${rpcName}/${section}`,
            null,
            req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/jsonc');
            },
        );

        await make.sdk.rpcs.setSection(appName, appVersion, rpcName, section, body);
    });
});
