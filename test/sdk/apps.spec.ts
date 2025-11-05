import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/apps/list.json';
import * as getMock from '../mocks/sdk/apps/get.json';
import * as createMock from '../mocks/sdk/apps/create.json';
import * as updateMock from '../mocks/sdk/apps/update.json';
import * as getSectionMock from '../mocks/sdk/apps/get-section.json';
import * as getCommonMock from '../mocks/sdk/apps/get-common.json';
import * as setCommonMock from '../mocks/sdk/apps/set-common.json';
import * as setDocsMock from '../mocks/sdk/apps/set-docs.json';
import * as uploadIconMock from '../mocks/sdk/apps/upload-icon.json';
import * as makePrivateMock from '../mocks/sdk/apps/make-private.json';
import * as makePublicMock from '../mocks/sdk/apps/make-public.json';
import * as cloneMock from '../mocks/sdk/apps/clone.json';
import * as commitMock from '../mocks/sdk/apps/commit.json';
import * as rollbackMock from '../mocks/sdk/apps/rollback.json';
import { readFileSync } from 'fs';
import { join } from 'path';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > Apps', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list SDK apps', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps', listMock);

        const result = await make.sdk.apps.list();
        expect(result).toStrictEqual(listMock.apps);
    });

    it('Should list SDK apps with options', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps?all=true&cols%5B%5D=name&cols%5B%5D=label', listMock);

        const result = await make.sdk.apps.list({ all: true, cols: ['name', 'label'] });
        expect(result).toStrictEqual(listMock.apps);
    });

    it('Should get SDK app by name and version', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/postman-test-app-1/1', getMock);

        const result = await make.sdk.apps.get('postman-test-app-1', 1);
        expect(result).toStrictEqual(getMock.app);
    });

    it('Should get SDK app with options', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/postman-test-app-1/1', getMock);

        const result = await make.sdk.apps.get('postman-test-app-1', 1);
        expect(result).toStrictEqual(getMock.app);
    });

    it('Should create SDK app', async () => {
        const body = {
            name: 'postman-test-app-7',
            label: 'Postman Test App',
            description: 'This is a testing app from Postman',
            theme: '#FF00FF',
            language: 'en',
            countries: [],
            private: false,
            audience: 'countries',
        };
        mockFetch('POST https://make.local/api/v2/sdk/apps', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.apps.create(body);
        expect(result).toStrictEqual(createMock.app);
    });

    it('Should update SDK app', async () => {
        const body = {
            audience: 'countries',
            description: 'Hey there, Charlie!',
            countries: ['us', 'uk', 'cz'],
            label: 'Multiverse',
            theme: '#AABBCC',
            language: 'en',
        };
        mockFetch('PATCH https://make.local/api/v2/sdk/apps/postman-test-app-1/1', updateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.apps.update('postman-test-app-1', 1, body);
        expect(result).toStrictEqual(updateMock.app);
    });

    it('Should delete SDK app', async () => {
        mockFetch('DELETE https://make.local/api/v2/sdk/apps/postman-test-app-1/1', null);

        await make.sdk.apps.delete('postman-test-app-1', 1);
    });

    it('Should get app section', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/test-app/1/base', getSectionMock);

        const result = await make.sdk.apps.getSection('test-app', 1, 'base');
        expect(result).toStrictEqual(getSectionMock);
    });

    it('Should set app section', async () => {
        const body = JSON.stringify({ name: 'text', type: 'text' });
        mockFetch('PUT https://make.local/api/v2/sdk/apps/test-app/1/base', null, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/jsonc');
        });

        await make.sdk.apps.setSection('test-app', 1, 'base', body);
    });

    it('Should get app documentation', async () => {
        const docsContent = readFileSync(join(__dirname, '../mocks/sdk/apps/get-docs.txt'), 'utf8');
        mockFetch('GET https://make.local/api/v2/sdk/apps/test-app/1/readme', docsContent);

        const result = await make.sdk.apps.getDocs('test-app', 1);
        expect(result).toBe(docsContent);
    });

    it('Should set app documentation', async () => {
        const docs = '# Updated Documentation\n\nThis is updated documentation.';
        mockFetch('PUT https://make.local/api/v2/sdk/apps/test-app/1/readme', setDocsMock, req => {
            expect(req.body).toBe(docs);
            expect(req.headers.get('content-type')).toBe('text/markdown');
        });

        const result = await make.sdk.apps.setDocs('test-app', 1, docs);
        expect(result).toBe(true);
    });

    it('Should get app common data', async () => {
        mockFetch('GET https://make.local/api/v2/sdk/apps/test-app/1/common', getCommonMock);

        const result = await make.sdk.apps.getCommon('test-app', 1);
        expect(result).toStrictEqual(getCommonMock);
    });

    it('Should set app common data', async () => {
        const common = { clientId: '789', clientSecret: 'newsecret' };
        mockFetch('PUT https://make.local/api/v2/sdk/apps/test-app/1/common', setCommonMock, req => {
            expect(req.body).toStrictEqual(common);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.apps.setCommon('test-app', 1, common);
        expect(result).toBe(true);
    });

    describe('Advanced Operations', () => {
        it('Should upload app icon', async () => {
            const iconData = new Uint8Array([137, 80, 78, 71]);
            const contentType = 'image/png';
            mockFetch('PUT https://make.local/api/v2/sdk/apps/test-app/1/icon', uploadIconMock, req => {
                expect(req.headers.get('content-type')).toContain(contentType);
            });

            const result = await make.sdk.apps.uploadIcon('test-app', 1, iconData, contentType);
            expect(result).toBe(true);
        });

        it('Should make app private', async () => {
            mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/1/private', makePrivateMock);

            const result = await make.sdk.apps.makePrivate('test-app', 1);
            expect(result).toStrictEqual(makePrivateMock.app);
        });

        it('Should make app public', async () => {
            mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/1/public', makePublicMock);

            const result = await make.sdk.apps.makePublic('test-app', 1);
            expect(result).toStrictEqual(makePublicMock.app);
        });

        it('Should clone app', async () => {
            const cloneData = {
                name: 'test-app-clone',
                version: '2',
                label: 'Test App Clone',
                description: 'Cloned test application'
            };
            mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/1/clone', cloneMock, req => {
                expect(req.body).toStrictEqual(cloneData);
                expect(req.headers.get('content-type')).toBe('application/json');
            });

            const result = await make.sdk.apps.clone('test-app', 1, cloneData);
            expect(result).toStrictEqual(cloneMock.app);
        });

        it('Should commit changes to app', async () => {
            const commitData = {
                message: 'Updated app configuration',
                changes: ['base.json', 'common.json']
            };
            mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/1/commit', commitMock, req => {
                expect(req.body).toStrictEqual(commitData);
                expect(req.headers.get('content-type')).toBe('application/json');
            });

            const result = await make.sdk.apps.commit('test-app', 1, commitData);
            expect(result).toStrictEqual(commitMock.commit);
        });

        it('Should rollback changes to app', async () => {
            const rollbackData = {
                commitId: 'abc123',
                steps: 2
            };
            mockFetch('POST https://make.local/api/v2/sdk/apps/test-app/1/rollback', rollbackMock, req => {
                expect(req.body).toStrictEqual(rollbackData);
                expect(req.headers.get('content-type')).toBe('application/json');
            });

            const result = await make.sdk.apps.rollback('test-app', 1, rollbackData);
            expect(result).toStrictEqual(rollbackMock.app);
        });
    });

    describe('Error Handling', () => {
        it('Should handle 404 errors for non-existent apps', async () => {
            mockFetch('GET https://make.local/api/v2/sdk/apps/non-existent-app/1', null, 404);

            await expect(make.sdk.apps.get('non-existent-app', 1)).rejects.toThrow();
        });

        it('Should handle validation errors when creating apps with invalid data', async () => {
            const invalidBody = {
                name: '',
                label: '',
                audience: 'invalid'
            };
            mockFetch('POST https://make.local/api/v2/sdk/apps', null, 400);

            await expect(make.sdk.apps.create(invalidBody as any)).rejects.toThrow();
        });

        it('Should handle permission errors when accessing restricted apps', async () => {
            mockFetch('GET https://make.local/api/v2/sdk/apps/restricted-app/1', null, 403);

            await expect(make.sdk.apps.get('restricted-app', 1)).rejects.toThrow();
        });
    });
});
