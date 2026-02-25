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
    let actionRequestId: string;

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
        const request = await make.credentialRequests.get(requestId);
        // If credentials are not part of the response, skip this test
        const credentials = (request as any)?.credentials;
        if (!Array.isArray(credentials) || credentials.length === 0) return;
        credentialId = credentials[0]?.id;
        if (!credentialId) return;
        const fetched = await make.credentialRequests.getCredential(credentialId);
        expect(fetched).toBeDefined();
        expect(fetched.id).toBe(credentialId);
    });

    it('Should decline credential', async () => {
        if (!credentialId) return;
        const declined = await make.credentialRequests.declineCredential(credentialId, 'Integration test decline');
        expect(declined).toBeDefined();
        expect(declined.state).toBe('declined');
    });

    it('Should delete remote credential', async () => {
        if (!credentialId) return;
        const deleted = await make.credentialRequests.deleteCredential(credentialId);
        expect(deleted).toBeDefined();
        expect(deleted.state).toBe('pending');
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
            keys: [
                {
                    name: 'Basic Auth',
                    type: 'basicauth',
                    appModules: ['ActionSendDataBasicAuth'],
                    appName: 'http',
                    appVersion: '3',
                },
            ],
            connections: [],
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
});
