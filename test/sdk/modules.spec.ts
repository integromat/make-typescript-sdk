import { describe, expect, it } from '@jest/globals';
import { Make } from '../../src/make.js';
import { mockFetch } from '../test.utils.js';

import * as listMock from '../mocks/sdk/modules/list.json';
import * as getMock from '../mocks/sdk/modules/get.json';
import * as createMock from '../mocks/sdk/modules/create.json';
import * as updateMock from '../mocks/sdk/modules/update.json';
import * as deleteMock from '../mocks/sdk/modules/delete.json';
import * as getSectionMock from '../mocks/sdk/modules/get-section.json';
import * as setSectionMock from '../mocks/sdk/modules/set-section.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: SDK > Modules', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);
    const appName = 'test-app';
    const appVersion = 1;
    const moduleName = 'getEntity';

    it('Should list SDK app modules', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules`, listMock);

        const result = await make.sdk.modules.list(appName, appVersion);
        expect(result).toStrictEqual(listMock.appModules);
    });

    it('Should get SDK app module by name', async () => {
        mockFetch(`GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`, getMock);

        const result = await make.sdk.modules.get(appName, appVersion, moduleName);
        expect(result).toStrictEqual(getMock.appModule);
    });

    it('Should create SDK app module', async () => {
        const body = {
            name: 'getEntity',
            typeId: 4,
            label: 'Get Entity',
            description: 'Retrieves the given entity.',
            moduleInitMode: 'blank' as const,
        };
        mockFetch(`POST https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.sdk.modules.create(appName, appVersion, body);
        expect(result).toStrictEqual(createMock.appModule);
    });

    it('Should update SDK app module', async () => {
        const body = {
            label: 'Get Order',
            description: 'Retrieves the order by its id.',
            connection: 'charlie-1',
        };
        mockFetch(
            `PATCH https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`,
            updateMock,
            req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/json');
            },
        );

        const result = await make.sdk.modules.update(appName, appVersion, moduleName, body);
        expect(result).toStrictEqual(updateMock.appModule);
    });

    it('Should delete SDK app module', async () => {
        mockFetch(
            `DELETE https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules/${moduleName}`,
            deleteMock,
        );

        await make.sdk.modules.delete(appName, appVersion, moduleName);
    });

    it('Should get module section', async () => {
        const section = 'api';
        mockFetch(
            `GET https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/${section}`,
            getSectionMock,
        );

        const result = await make.sdk.modules.getSection(appName, appVersion, moduleName, section);
        expect(result).toStrictEqual(getSectionMock);
    });

    it('Should set module section', async () => {
        const section = 'api';
        const body = {
            url: '/api/users',
            method: 'GET',
            qs: {},
            body: {},
            headers: {},
            response: {
                iterate: '{{body.users}}',
                trigger: {
                    id: '{{item.id}}',
                    date: '{{item.created}}',
                    type: 'string',
                    order: 'desc',
                },
                output: '{{item}}',
                limit: '{{parameters.limit}}',
            },
        };
        mockFetch(
            `PUT https://make.local/api/v2/sdk/apps/${appName}/${appVersion}/modules/${moduleName}/${section}`,
            setSectionMock,
            req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/json');
            },
        );

        const result = await make.sdk.modules.setSection(appName, appVersion, moduleName, section, body);
        expect(result).toStrictEqual(setSectionMock);
    });
});
