import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/templates/list.json';
import * as listPublicMock from './mocks/templates/list-public.json';
import * as getMock from './mocks/templates/get.json';
import * as getPublicMock from './mocks/templates/get-public.json';
import * as blueprintMock from './mocks/templates/blueprint.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Templates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list templates', async () => {
        mockFetch('GET https://make.local/api/v2/templates?teamId=1', listMock);
        const result = await make.templates.list({ teamId: 1 });
        expect(result).toStrictEqual(listMock.templates);
    });

    it('Should list public templates with name search', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public?name=Http', listPublicMock);
        const result = await make.templates.listPublic({ name: 'Http' });
        expect(result).toStrictEqual(listPublicMock.templatesPublic);
    });

    it('Should get template by ID', async () => {
        mockFetch('GET https://make.local/api/v2/templates/61', getMock);
        const result = await make.templates.get(61);
        expect(result).toStrictEqual(getMock.template);
    });

    it('Should get template blueprint', async () => {
        mockFetch('GET https://make.local/api/v2/templates/61/blueprint', blueprintMock);
        const result = await make.templates.getBlueprint(61);
        expect(result).toStrictEqual(blueprintMock);
    });

    it('Should get template blueprint with forUse option', async () => {
        mockFetch('GET https://make.local/api/v2/templates/61/blueprint?forUse=true', blueprintMock);
        const result = await make.templates.getBlueprint(61, { forUse: true });
        expect(result).toStrictEqual(blueprintMock);
    });

    it('Should get public template by URL slug', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public/13-http-template-example', getPublicMock);
        const result = await make.templates.getPublic('13-http-template-example');
        expect(result).toStrictEqual(getPublicMock.templatePublic);
    });

    it('Should get public template blueprint by URL slug', async () => {
        mockFetch(
            'GET https://make.local/api/v2/templates/public/13-http-template-example/blueprint',
            blueprintMock,
        );
        const result = await make.templates.getPublicBlueprint('13-http-template-example');
        expect(result).toStrictEqual(blueprintMock);
    });
});
