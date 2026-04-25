import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/public-templates/list.json';
import * as getMock from './mocks/public-templates/get.json';
import * as blueprintMock from './mocks/public-templates/blueprint.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: PublicTemplates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list public templates with name search', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public?name=Http', listMock);
        const result = await make.publicTemplates.list({ name: 'Http' });
        expect(result).toStrictEqual(listMock.templatesPublic);
    });

    it('Should serialize usedApps array and includeEn boolean query params', async () => {
        mockFetch(
            'GET https://make.local/api/v2/templates/public?usedApps%5B%5D=gmail&usedApps%5B%5D=http&includeEn=true',
            listMock,
        );
        const result = await make.publicTemplates.list({ usedApps: ['gmail', 'http'], includeEn: true });
        expect(result).toStrictEqual(listMock.templatesPublic);
    });

    it('Should get public template by URL slug', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public/13-http-template-example', getMock);
        const result = await make.publicTemplates.get('13-http-template-example');
        expect(result).toStrictEqual(getMock.templatePublic);
    });

    it('Should get public template blueprint by URL slug', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public/13-http-template-example/blueprint', blueprintMock);
        const result = await make.publicTemplates.getBlueprint('13-http-template-example');
        expect(result).toStrictEqual(blueprintMock);
    });
});
