import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/credential-requests/list.json';
import * as getMock from './mocks/credential-requests/get.json';
import * as getDetailMock from './mocks/credential-requests/get-detail.json';
import * as createMock from './mocks/credential-requests/create.json';
import * as getCredentialMock from './mocks/credential-requests/get-credential.json';
import * as declineMock from './mocks/credential-requests/decline.json';
import * as deleteRemoteMock from './mocks/credential-requests/delete-remote.json';
import * as createActionMock from './mocks/credential-requests/create-action.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: CredentialRequests', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list credential requests', async () => {
        mockFetch('GET https://make.local/api/v2/credential-requests/requests', listMock);

        const result = await make.credentialRequests.list();

        expect(result).toStrictEqual(listMock.requests);
    });

    it('Should list credential requests with filters and pagination', async () => {
        mockFetch(
            'GET https://make.local/api/v2/credential-requests/requests?teamId=123&status=pending&pg%5Blimit%5D=50',
            listMock,
        );

        const result = await make.credentialRequests.list({
            teamId: 123,
            status: 'pending',
            pg: {
                limit: 50,
            },
        });

        expect(result).toStrictEqual(listMock.requests);
    });

    it('Should list credential requests with multiple filters', async () => {
        mockFetch(
            'GET https://make.local/api/v2/credential-requests/requests?teamId=123&userId=789&makeProviderId=456&name=Google+Workspace+Access',
            listMock,
        );

        const result = await make.credentialRequests.list({
            teamId: 123,
            userId: 789,
            makeProviderId: '456',
            name: 'Google Workspace Access',
        });

        expect(result).toStrictEqual(listMock.requests);
    });

    it('Should create a credential request', async () => {
        const body = {
            name: 'Google Workspace Access',
            teamId: 123,
            description: 'Request access to Google Workspace APIs',
            connections: [
                {
                    accountName: 'Google Account',
                    scopes: ['drive.readonly', 'drive.file'],
                },
            ],
            provider: {
                email: 'admin@example.com',
            },
        };

        mockFetch('POST https://make.local/api/v2/credential-requests/requests', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.credentialRequests.create(body);

        expect(result).toStrictEqual(createMock.request);
    });

    it('Should get a credential request by ID', async () => {
        mockFetch('GET https://make.local/api/v2/credential-requests/requests/req-123', getMock);

        const result = await make.credentialRequests.get('req-123');

        expect(result).toStrictEqual(getMock.request);
    });

    it('Should get a credential request by ID with column selection', async () => {
        mockFetch(
            'GET https://make.local/api/v2/credential-requests/requests/req-123?cols%5B%5D=id&cols%5B%5D=name',
            getMock,
        );

        const result = await make.credentialRequests.get('req-123', {
            cols: ['id', 'name'],
        });

        expect(result).toStrictEqual(getMock.request);
    });

    it('Should get full detail of a credential request with associated credentials', async () => {
        mockFetch('GET https://make.local/api/v2/credential-requests/requests/req-123/detail', getDetailMock);

        const result = await make.credentialRequests.getDetail('req-123');

        expect(result).toStrictEqual(getDetailMock.requestDetail);
        expect(result.credentials).toHaveLength(2);
        expect(result.makeProvider).toBeDefined();
        expect(result.user).toBeDefined();
    });

    it('Should delete a credential request by ID', async () => {
        mockFetch('DELETE https://make.local/api/v2/credential-requests/requests/req-123?confirmed=true', null);

        await make.credentialRequests.delete('req-123');
    });

    it('Should get a credential by ID', async () => {
        mockFetch('GET https://make.local/api/v2/credential-requests/credentials/cred-456', getCredentialMock);

        const result = await make.credentialRequests.getCredential('cred-456');

        expect(result).toStrictEqual(getCredentialMock.credential);
    });

    it('Should get a credential by ID with column selection', async () => {
        mockFetch(
            'GET https://make.local/api/v2/credential-requests/credentials/cred-456?cols%5B%5D=id&cols%5B%5D=state',
            getCredentialMock,
        );

        const result = await make.credentialRequests.getCredential('cred-456', {
            cols: ['id', 'state'],
        });

        expect(result).toStrictEqual(getCredentialMock.credential);
    });

    it('Should decline a credential without reason', async () => {
        mockFetch(
            'POST https://make.local/api/v2/credential-requests/credentials/cred-789/decline',
            declineMock,
            req => {
                // When no reason is provided, body is sent as empty string
                expect(req.body).toBe('');
            },
        );

        const result = await make.credentialRequests.declineCredential('cred-789');

        expect(result).toStrictEqual(declineMock.credential);
    });

    it('Should decline a credential with reason', async () => {
        mockFetch(
            'POST https://make.local/api/v2/credential-requests/credentials/cred-789/decline',
            declineMock,
            req => {
                expect(req.body).toStrictEqual({ reason: 'Not authorized' });
                expect(req.headers.get('content-type')).toBe('application/json');
            },
        );

        const result = await make.credentialRequests.declineCredential('cred-789', 'Not authorized');

        expect(result).toStrictEqual(declineMock.credential);
    });

    it('Should delete credential', async () => {
        mockFetch(
            'POST https://make.local/api/v2/credential-requests/credentials/cred-999/delete-remote',
            deleteRemoteMock,
        );

        const result = await make.credentialRequests.deleteCredential('cred-999');

        expect(result).toStrictEqual(deleteRemoteMock.credential);
    });

    it('Should create a credential action', async () => {
        const body = {
            teamId: 123,
            connections: [],
            keys: [
                {
                    appModules: ['ActionSendDataBasicAuth'],
                    appName: 'http',
                    appVersion: '3',
                    name: 'Basic Auth',
                    type: 'basicauth',
                },
            ],
        };

        mockFetch('POST https://make.local/api/v2/credential-requests/actions/create', createActionMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.credentialRequests.createAction({
            teamId: 123,
            connections: [],
            keys: [
                {
                    name: 'Basic Auth',
                    type: 'basicauth',
                    appModules: ['ActionSendDataBasicAuth'],
                    appName: 'http',
                    appVersion: '3',
                },
            ],
        });

        expect(result).toStrictEqual({
            request: createActionMock.request,
            publicUri: createActionMock.publicUri,
        });
    });
});
