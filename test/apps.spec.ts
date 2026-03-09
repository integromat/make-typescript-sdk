import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listModulesWithCredentialsMock from './mocks/apps/list-modules-with-credentials.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Apps', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list modules with credentials for an app', async () => {
        mockFetch('GET https://make.local/api/v2/imt/apps/slack/4/modules-with-credentials', listModulesWithCredentialsMock);

        const result = await make.apps.listModulesWithCredentials('slack', 4);
        expect(result).toStrictEqual(listModulesWithCredentialsMock.appModules);
    });

    it('Should list modules with credentials using "latest" version', async () => {
        mockFetch('GET https://make.local/api/v2/imt/apps/slack/latest/modules-with-credentials', listModulesWithCredentialsMock);

        const result = await make.apps.listModulesWithCredentials('slack', 'latest');
        expect(result).toStrictEqual(listModulesWithCredentialsMock.appModules);
    });

    it('Should encode app name with app# prefix for custom apps', async () => {
        mockFetch('GET https://make.local/api/v2/imt/apps/app%23my-custom-app/1/modules-with-credentials', listModulesWithCredentialsMock);

        const result = await make.apps.listModulesWithCredentials('app#my-custom-app', 1);
        expect(result).toStrictEqual(listModulesWithCredentialsMock.appModules);
    });
});
