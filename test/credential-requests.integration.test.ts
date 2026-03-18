import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);
const PROVIDER_MAKE_USER_ID = String(process.env.MAKE_PROVIDER_USER_ID || '');

describe('Integration: CredentialRequests', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);
    let requestId: string;
    let credentialId: string;
    let hasRemoteCredential: boolean = false;
    let actionRequestId: string;
    let connectionRequestId: string;
    let keyRequestId: string;
    let mixedRequestId: string;
    let nameOverrideRequestId: string;

    it('Should create a credential request', async () => {
        const request = await make.credentialRequests.create({
            name: `Test Credential Request ${Date.now()}`,
            teamId: MAKE_TEAM,
            description: 'Integration test credential request',
            provider: { providerMakeUserId: Number(PROVIDER_MAKE_USER_ID) },
            keys: [
                {
                    type: 'basicauth',
                    appModules: ['ActionSendDataBasicAuth'],
                    appName: 'http',
                    appVersion: '3',
                    description: '',
                },
            ],
        });
        expect(request).toBeDefined();
        expect(request.id).toBeDefined();
        requestId = request.id;
    });

    it('Should get the created credential request', async () => {
        const request = await make.credentialRequests.get(requestId);
        expect(request.id).toBe(requestId);
    });

    it('Should get detail of the credential request with credentials', async () => {
        const detail = await make.credentialRequests.getDetail(requestId);
        expect(detail.id).toBe(requestId);
        expect(detail.credentials).toBeDefined();
        expect(Array.isArray(detail.credentials)).toBe(true);
        expect(detail.makeProvider).toBeDefined();
        expect(detail.user).toBeDefined();
    });

    it('Should list credential requests', async () => {
        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(Array.isArray(requests)).toBe(true);
        expect(requests.some(r => r.id === requestId)).toBe(true);
    });

    it('Should get credential from request', async () => {
        const detail = await make.credentialRequests.getDetail(requestId);
        if (detail.credentials.length === 0) return;
        const credential = detail.credentials[0]!;
        credentialId = credential.id;
        hasRemoteCredential = credential.remoteId != null;
        expect(credentialId).toBeDefined();
    });

    it('Should delete remote credential', async () => {
        if (!credentialId || !hasRemoteCredential) return;
        const deleted = await make.credentialRequests.deleteCredential(credentialId);
        expect(deleted).toBeDefined();
        expect(deleted.state).toBe('pending');
    });

    it('Should decline credential', async () => {
        if (!credentialId) return;
        const declined = await make.credentialRequests.declineCredential(credentialId, 'Integration test decline');
        expect(declined).toBeDefined();
        expect(declined.state).toBe('declined');
    });

    it('Should delete credential request', async () => {
        await make.credentialRequests.delete(requestId);

        // Check that request is deleted
        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(requests.some(r => r.id === requestId)).toBe(false);
    });

    it('Should create a credential request using the create action', async () => {
        const action = await make.credentialRequests.createAction({
            teamId: MAKE_TEAM,
            credentials: [
                {
                    appName: 'http',
                    appModules: ['ActionSendDataBasicAuth'],
                    appVersion: 3,
                },
            ],
        });
        expect(action.request.id).toBeDefined();
        expect(action.publicUri).toBeDefined();
        expect(action.request.teamId).toBe(MAKE_TEAM);
        actionRequestId = action.request.id;
    });

    it('Should get the credential request created with the create action', async () => {
        const request = await make.credentialRequests.get(actionRequestId);
        expect(request.id).toBe(actionRequestId);
    });

    it('Should delete the credential request created by the create action', async () => {
        await make.credentialRequests.delete(actionRequestId);

        // Check that request is deleted
        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(requests.some(r => r.id === actionRequestId)).toBe(false);
    });

    it('Should create a credential action with name and description', async () => {
        const action = await make.credentialRequests.createAction({
            teamId: MAKE_TEAM,
            name: `Test Named Action ${Date.now()}`,
            description: 'Integration test action with name and description',
            credentials: [
                {
                    appName: 'google-sheets',
                    appModules: ['*'],
                },
            ],
        });
        expect(action.request.id).toBeDefined();
        expect(action.publicUri).toBeDefined();
        expect(action.request.teamId).toBe(MAKE_TEAM);
        expect(action.request.name).toBeDefined();

        await make.credentialRequests.delete(action.request.id);
    });

    it('Should create a credential request with a connection', async () => {
        const result = await make.credentialRequests.createByCredentials({
            teamId: MAKE_TEAM,
            name: 'Google Access',
            description: 'Requesting Google connection',
            connections: [
                {
                    type: 'google',
                    scope: ['https://www.googleapis.com/auth/drive'],
                },
            ],
        });
        expect(result.request.id).toBeDefined();
        expect(result.request.teamId).toBe(MAKE_TEAM);
        expect(result.request.name).toBe('Google Access');
        expect(result.request.description).toBe('Requesting Google connection');
        expect(result.credentials).toBeDefined();
        expect(result.credentials.length).toBeGreaterThanOrEqual(1);
        expect(result.credentials[0]!.component).toBe('account');
        expect(result.credentials[0]!.name).toBe('google');
        expect(result.credentials[0]!.state).toBe('pending');
        expect(result.publicUri).toBeDefined();

        connectionRequestId = result.request.id;
    });

    it('Should delete the credential request created with a connection', async () => {
        await make.credentialRequests.delete(connectionRequestId);

        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(requests.some(r => r.id === connectionRequestId)).toBe(false);
    });

    it('Should create a credential request with a key', async () => {
        const result = await make.credentialRequests.createByCredentials({
            teamId: MAKE_TEAM,
            keys: [
                {
                    type: 'apikeyauth',
                    description: 'API Key for HTTP service',
                },
            ],
        });
        expect(result.request.id).toBeDefined();
        expect(result.request.name).toBe('Request for credentials');
        expect(result.credentials).toHaveLength(1);
        expect(result.credentials[0]!.component).toBe('keychain');
        expect(result.credentials[0]!.name).toBe('apikeyauth');
        expect(result.publicUri).toBeDefined();

        keyRequestId = result.request.id;
    });

    it('Should delete the credential request created with a key', async () => {
        await make.credentialRequests.delete(keyRequestId);

        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(requests.some(r => r.id === keyRequestId)).toBe(false);
    });

    it('Should create a credential request with both connections and keys', async () => {
        const result = await make.credentialRequests.createByCredentials({
            teamId: MAKE_TEAM,
            name: 'Mixed Credentials',
            connections: [
                {
                    type: 'google',
                    scope: ['https://www.googleapis.com/auth/drive'],
                },
            ],
            keys: [
                {
                    type: 'apikeyauth',
                },
            ],
        });
        expect(result.request.id).toBeDefined();
        expect(result.credentials).toHaveLength(2);

        const account = result.credentials.find(c => c.component === 'account');
        const keychain = result.credentials.find(c => c.component === 'keychain');
        expect(account).toBeDefined();
        expect(account!.name).toBe('google');
        expect(keychain).toBeDefined();
        expect(keychain!.name).toBe('apikeyauth');

        mixedRequestId = result.request.id;
    });

    it('Should delete the credential request created with both connections and keys', async () => {
        await make.credentialRequests.delete(mixedRequestId);

        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(requests.some(r => r.id === mixedRequestId)).toBe(false);
    });

    it('Should create a credential request with nameOverride', async () => {
        const result = await make.credentialRequests.createByCredentials({
            teamId: MAKE_TEAM,
            connections: [
                {
                    type: 'google',
                    nameOverride: 'My Custom Google Connection',
                },
            ],
        });
        expect(result.request.id).toBeDefined();
        expect(result.credentials).toHaveLength(1);
        expect(result.credentials[0]!.nameOverride).toBe('My Custom Google Connection');

        nameOverrideRequestId = result.request.id;
    });

    it('Should delete the credential request created with nameOverride', async () => {
        await make.credentialRequests.delete(nameOverrideRequestId);

        const requests = await make.credentialRequests.list({ teamId: MAKE_TEAM });
        expect(requests.some(r => r.id === nameOverrideRequestId)).toBe(false);
    });
});
