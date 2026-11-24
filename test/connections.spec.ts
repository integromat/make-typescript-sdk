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
import * as listLockedMock from './mocks/connections/list-locked.json';
import * as listUnusableMock from './mocks/connections/list-unusable.json';
import * as makeLockedMock from './mocks/connections/make-locked.json';
import * as makeTeamMock from './mocks/connections/make-team.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Connections', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('should list connections', async () => {
        mockFetch('GET https://make.local/api/v2/connections?teamId=123', listMock);

        const connections = await make.connections.list(123);
        expect(connections).toStrictEqual(listMock.connections);
    });

    it('should list the usable locked connections', async () => {
        mockFetch('GET https://make.local/api/v2/connections?teamId=22&visibility=locked&usable=true', listLockedMock);

        const connections = await make.connections.list(22, { visibility: 'locked', usable: true });
        expect(connections).toStrictEqual(listLockedMock.connections);
    });

    it('should list the connections the caller cannot use', async () => {
        mockFetch('GET https://make.local/api/v2/connections?teamId=22&usable=false', listUnusableMock);

        const connections = await make.connections.list(22, { usable: false });
        expect(connections).toStrictEqual(listUnusableMock.connections);
    });

    it('should type acl on the rows listed with both id and visibility', async () => {
        mockFetch('GET https://make.local/api/v2/connections?teamId=22&cols%5B%5D=id&cols%5B%5D=visibility', {
            connections: [{ id: 15, visibility: 'locked', acl: { permissions: ['entity use'], isOrphaned: false } }],
        });

        const connections = await make.connections.list(22, { cols: ['id', 'visibility'] });
        expect(connections[0]?.acl?.permissions).toStrictEqual(['entity use']);
    });

    it('should not type acl on the rows listed without id', async () => {
        mockFetch('GET https://make.local/api/v2/connections?teamId=22&cols%5B%5D=visibility', {
            connections: [{ visibility: 'locked' }],
        });

        const connections = await make.connections.list(22, { cols: ['visibility'] });
        // @ts-expect-error without `id` the API sends no `acl`
        expect(connections[0]?.acl).toBeUndefined();
    });

    it('should not accept acl as a column', async () => {
        mockFetch(
            'GET https://make.local/api/v2/connections?teamId=22&cols%5B%5D=acl',
            { message: 'Validation of query columns failed' },
            400,
        );

        // @ts-expect-error `acl` is derived by the API, not a column
        const request = make.connections.list(22, { cols: ['acl'] });
        await expect(request).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should list connections of a particular type with scopes', async () => {
        const googleConnections = listMock.connections.filter(c => c.accountName === 'google');
        mockFetch(
            'GET https://make.local/api/v2/connections?teamId=123&type%5B%5D=google&google%5B%5D=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets&google%5B%5D=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive',
            { connections: googleConnections },
        );

        const connections = await make.connections.list(123, {
            type: ['google'],
            scopes: {
                google: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
            },
        });
        expect(connections).toStrictEqual(googleConnections);
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

    it('should lock a connection', async () => {
        mockFetch('POST https://make.local/api/v2/connections/15/make-locked', makeLockedMock);

        const connection = await make.connections.makeLocked(15);
        expect(connection).toStrictEqual(makeLockedMock.connection);
    });

    it('should make a connection available to the team', async () => {
        mockFetch('POST https://make.local/api/v2/connections/15/make-team', makeTeamMock);

        const connection = await make.connections.makeTeam(15);
        expect(connection).toStrictEqual(makeTeamMock.connection);
    });

    it('should delete a connection', async () => {
        mockFetch('DELETE https://make.local/api/v2/connections/99?confirmed=true', null);

        await make.connections.delete(99);
    });
});
