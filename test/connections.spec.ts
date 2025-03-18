import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/connections/list.json';
import * as getMock from './mocks/connections/get.json';
import * as createMock from './mocks/connections/create.json';
import * as updateMock from './mocks/connections/update.json';
import * as renameMock from './mocks/connections/rename.json';
import * as verifyMock from './mocks/connections/verify.json';
import * as scopedMock from './mocks/connections/scoped.json';
import * as editableParametersMock from './mocks/connections/editable-parameters.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Connections', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('should list connections', async () => {
        mockFetch('GET https://make.local/api/v2/connections?teamId=123', listMock);

        const connections = await make.connections.list(123);
        expect(connections).toStrictEqual(listMock.connections);
    });

    it('should get a connection', async () => {
        mockFetch('GET https://make.local/api/v2/connections/93', getMock);

        const connection = await make.connections.get(93);
        expect(connection).toStrictEqual(getMock.connection);
    });

    it('should create a connection', async () => {
        const body = {
            name: 'Slack test',
            accountName: 'slack',
            data: {
                apiKey: 'test-api-key-12345',
            },
        };

        mockFetch('POST https://make.local/api/v2/connections?teamId=2', createMock, req => {
            expect(req.body).toStrictEqual({
                accountName: body.name,
                accountType: body.accountName,
                apiKey: body.data.apiKey,
            });
        });

        const connection = await make.connections.create({
            ...body,
            teamId: 2,
        });
        expect(connection).toStrictEqual(createMock.connection);
    });

    it('should update a connection', async () => {
        const body = {
            data: {
                token: 'new-token',
            },
        };

        mockFetch('POST https://make.local/api/v2/connections/42/set-data', updateMock, req => {
            expect(req.body).toStrictEqual(body.data);
        });

        const result = await make.connections.update(42, body);
        expect(result).toStrictEqual(updateMock.changed);
    });

    it('should rename a connection', async () => {
        const body = {
            name: 'New Name',
        };

        mockFetch('PATCH https://make.local/api/v2/connections/93', renameMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const connection = await make.connections.rename(93, body.name);
        expect(connection).toStrictEqual(renameMock.connection);
    });

    it('should verify a connection', async () => {
        mockFetch('POST https://make.local/api/v2/connections/55/test', verifyMock);

        const result = await make.connections.verify(55);
        expect(result).toStrictEqual(verifyMock.verified);
    });

    it('should get scoped status', async () => {
        const scope = ['scope1', 'scope2'];

        mockFetch('POST https://make.local/api/v2/connections/77/scoped', scopedMock, req => {
            expect(req.body).toStrictEqual({ scope });
        });

        const scoped = await make.connections.scoped(77, scope);
        expect(scoped).toStrictEqual(scopedMock.connection.scoped);
    });

    it('should get editable parameters', async () => {
        mockFetch('GET https://make.local/api/v2/connections/88/editable-data-schema', editableParametersMock);

        const params = await make.connections.listEditableParameters(88);
        expect(params).toStrictEqual(editableParametersMock.editableParameters);
    });

    it('should delete a connection', async () => {
        mockFetch('DELETE https://make.local/api/v2/connections/99?confirmed=true', null);

        await make.connections.delete(99);
    });
});
