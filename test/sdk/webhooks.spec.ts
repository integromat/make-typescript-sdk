import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/webhooks/list.json';
import * as getMock from '../mocks/sdk/webhooks/get.json';
import * as createMock from '../mocks/sdk/webhooks/create.json';
import * as updateMock from '../mocks/sdk/webhooks/update.json';
import * as getSectionMock from '../mocks/sdk/webhooks/get-section.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK Webhooks', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list webhooks for an app', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/test-app/webhooks', listMock);

        const result = await make.sdk.webhooks.list('test-app');
        expect(result).toStrictEqual(listMock.appWebhooks);
    });

    it('Should get webhook by name', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/webhooks/custom-app-12', getMock);

        const result = await make.sdk.webhooks.get('custom-app-12');
        expect(result).toStrictEqual(getMock.appWebhook);
    });

    it('Should create webhook', async () => {
        const body = { type: 'web', label: 'Watch Events' };
        mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/webhooks', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.webhooks.create('test-app', body);
        expect(result).toStrictEqual(createMock.appWebhook);
    });

    it('Should update webhook', async () => {
        const body = { label: 'Test Renamed' };
        mockFetch('PATCH https://make.local/api/v2/sdk/apps/webhooks/charlie-1', updateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.webhooks.update('charlie-1', body);
        expect(result).toStrictEqual(updateMock.appWebhook);
    });

    it('Should delete webhook', async () => {
        mockFetch('DELETE https://make.local/api/v2/sdk/apps/webhooks/custom-app-12', null);

        await make.sdk.webhooks.delete('custom-app-12');
    });

    it('Should get webhook section', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/webhooks/custom-app-12/api', getSectionMock);

        const result = await make.sdk.webhooks.getSection('custom-app-12', 'api');
        expect(result).toStrictEqual(getSectionMock);
    });

    it('Should set webhook section', async () => {
        const body = { output: '{{body}}', test: true };
        mockFetch('PUT https://make.local/api/v2/sdk/apps/webhooks/custom-app-12/api', null, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        await make.sdk.webhooks.setSection('custom-app-12', 'api', body);
    });
});
