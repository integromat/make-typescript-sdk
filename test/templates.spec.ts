import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/templates/list.json';
import * as getMock from './mocks/templates/get.json';
import * as createMock from './mocks/templates/create.json';
import * as updateMock from './mocks/templates/update.json';
import * as deleteMock from './mocks/templates/delete.json';
import * as blueprintMock from './mocks/templates/blueprint.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Templates', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list templates', async () => {
        mockFetch('GET https://make.local/api/v2/templates', listMock);
        const result = await make.templates.list();
        expect(result).toStrictEqual(listMock.templates);
    });

    it('Should list templates filtered by teamId and usedApps', async () => {
        mockFetch(
            'GET https://make.local/api/v2/templates?teamId=5&usedApps%5B%5D=gmail&usedApps%5B%5D=http',
            listMock,
        );
        const result = await make.templates.list({ teamId: 5, usedApps: ['gmail', 'http'] });
        expect(result).toStrictEqual(listMock.templates);
    });

    it('Should list templates filtered by public status', async () => {
        mockFetch('GET https://make.local/api/v2/templates?public=true', listMock);
        const result = await make.templates.list({ public: true });
        expect(result).toStrictEqual(listMock.templates);
    });

    it('Should get a template by id', async () => {
        mockFetch('GET https://make.local/api/v2/templates/42', getMock);
        const result = await make.templates.get(42);
        expect(result).toStrictEqual(getMock.template);
    });

    it('Should get a template blueprint by id', async () => {
        mockFetch('GET https://make.local/api/v2/templates/42/blueprint', blueprintMock);
        const result = await make.templates.getBlueprint(42);
        expect(result).toStrictEqual(blueprintMock);
    });

    it('Should get a template blueprint for use', async () => {
        mockFetch('GET https://make.local/api/v2/templates/42/blueprint?forUse=true', blueprintMock);
        const result = await make.templates.getBlueprint(42, { forUse: true });
        expect(result).toStrictEqual(blueprintMock);
    });

    it('Should create a template, JSON-encoding blueprint/scheduling/controller as strings', async () => {
        const body = {
            teamId: 5,
            language: 'en',
            blueprint: { name: 'New Template', flow: [], metadata: { version: 1 } },
            scheduling: { type: 'on-demand' },
            controller: { name: 'New Template', modules: {}, idSequence: 1 },
        };
        mockFetch('POST https://make.local/api/v2/templates', createMock, req => {
            expect(req.body).toStrictEqual({
                teamId: 5,
                language: 'en',
                blueprint: JSON.stringify(body.blueprint),
                scheduling: JSON.stringify(body.scheduling),
                controller: JSON.stringify(body.controller),
            });
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.templates.create(body as never);
        expect(result).toStrictEqual(createMock.template);
    });

    it('Should update a template', async () => {
        const body = { name: 'Renamed Template' };
        mockFetch('PATCH https://make.local/api/v2/templates/42', updateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.templates.update(42, body);
        expect(result).toStrictEqual(updateMock.template);
    });

    it('Should JSON-encode blueprint/scheduling/controller as strings when updating a template', async () => {
        const blueprint = { name: 'Renamed Template', flow: [], metadata: { version: 1 } };
        const scheduling = { type: 'on-demand' as const };
        const controller = { name: 'Renamed Template', modules: {}, idSequence: 1 };

        mockFetch('PATCH https://make.local/api/v2/templates/42', updateMock, req => {
            expect(req.body).toStrictEqual({
                blueprint: JSON.stringify(blueprint),
                scheduling: JSON.stringify(scheduling),
                controller: JSON.stringify(controller),
            });
        });

        const result = await make.templates.update(42, { blueprint, scheduling, controller } as never);
        expect(result).toStrictEqual(updateMock.template);
    });

    it('Should delete a template and return the bare numeric id', async () => {
        mockFetch('DELETE https://make.local/api/v2/templates/42?confirmed=true', deleteMock);

        const result = await make.templates.delete(42);
        expect(result).toBe(deleteMock.template);
        expect(typeof result).toBe('number');
    });
});
