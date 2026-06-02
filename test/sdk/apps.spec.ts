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
import { readFileSync } from 'fs';
import { join } from 'path';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

/** Build a minimal valid PNG header (signature + IHDR) with the given dimensions. */
function pngIcon(width: number, height: number): Uint8Array {
    const bytes = new Uint8Array(24);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG signature
    bytes.set([0x49, 0x48, 0x44, 0x52], 12); // "IHDR"
    new DataView(bytes.buffer).setUint32(16, width);
    new DataView(bytes.buffer).setUint32(20, height);
    return bytes;
}

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

    it('Should upload app icon as raw PNG data', async () => {
        const iconData = pngIcon(512, 512);
        mockFetch('PUT https://make.local/api/v2/sdk/apps/test-app/1/icon', { changed: true }, req => {
            expect(req.body).toBeInstanceOf(ArrayBuffer);
            expect([...new Uint8Array(req.body as ArrayBuffer)]).toStrictEqual([...iconData]);
            expect(req.headers.get('content-type')).toBe('image/png');
        });

        const result = await make.sdk.apps.setIcon('test-app', 1, iconData);
        expect(result).toBe(true);
    });

    it('Should reject a non-PNG app icon before upload', async () => {
        await expect(make.sdk.apps.setIcon('test-app', 1, new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(
            'App icon must be a PNG image.',
        );
    });

    it('Should reject an app icon that is not 512x512', async () => {
        await expect(make.sdk.apps.setIcon('test-app', 1, pngIcon(256, 256))).rejects.toThrow(
            'App icon must be 512x512 PNG. Got 256x256.',
        );
    });

    it('Should download app icon as an ArrayBuffer', async () => {
        const iconData = pngIcon(512, 512);
        mockFetch('GET https://make.local/api/v2/sdk/apps/test-app/1/icon/512', iconData);

        const result = await make.sdk.apps.getIcon('test-app', 1);
        expect(result).toBeInstanceOf(ArrayBuffer);
        expect([...new Uint8Array(result)]).toStrictEqual([...iconData]);
    });

    it('Should make app public and private', async () => {
        mockFetch(
            ['POST https://make.local/api/v2/sdk/apps/test-app/1/public', { changed: true }, undefined],
            ['POST https://make.local/api/v2/sdk/apps/test-app/1/private', { changed: true }, undefined],
        );

        await expect(make.sdk.apps.makePublic('test-app', 1)).resolves.toBeUndefined();
        await expect(make.sdk.apps.makePrivate('test-app', 1)).resolves.toBeUndefined();
    });
});
