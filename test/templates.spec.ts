import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/templates/list.json';
import * as getMock from './mocks/templates/get.json';
import * as blueprintMock from './mocks/templates/blueprint.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Templates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list public templates with name search', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public?name=Http', listMock);
        const result = await make.templates.list({ name: 'Http' });
        expect(result).toStrictEqual(listMock.templatesPublic);
    });

    it('Should get public template by URL slug', async () => {
        mockFetch('GET https://make.local/api/v2/templates/public/13-http-template-example', getMock);
        const result = await make.templates.get('13-http-template-example');
        expect(result).toStrictEqual(getMock.templatePublic);
    });

    it('Should get public template blueprint by URL slug', async () => {
        mockFetch(
            'GET https://make.local/api/v2/templates/public/13-http-template-example/blueprint',
            blueprintMock,
        );
        const result = await make.templates.getBlueprint('13-http-template-example');
        expect(result).toStrictEqual(blueprintMock);
    });
});
