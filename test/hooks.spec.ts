import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as hooksListMock from './mocks/hooks/list.json';
import * as hookCreateMock from './mocks/hooks/create.json';
import * as hookGetMock from './mocks/hooks/get.json';
import * as hookUpdateMock from './mocks/hooks/update.json';
import * as hookPingMock from './mocks/hooks/ping.json';
import * as hookEnableMock from './mocks/hooks/enable.json';
import * as hookDisableMock from './mocks/hooks/disable.json';
import * as hookLearnStartMock from './mocks/hooks/learn-start.json';
import * as hookLearnStopMock from './mocks/hooks/learn-stop.json';
import * as hookUpdateDataMock from './mocks/hooks/update-data.json';
const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Hooks', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    describe('Hooks', () => {
        it('Should list hooks in team', async () => {
            mockFetch('GET https://make.local/api/v2/hooks?teamId=4', hooksListMock);

            const result = await make.hooks.list(4);
            expect(result).toStrictEqual(hooksListMock.hooks);
        });

        it('Should create a hook', async () => {
            const body = {
                name: 'jotform hook 1',
                teamId: 4,
                typeName: 'jotform',
                data: {
                    formId: '91282545501353',
                },
            };

            mockFetch('POST https://make.local/api/v2/hooks', hookCreateMock, req => {
                expect(req.body).toStrictEqual({
                    name: body.name,
                    teamId: body.teamId,
                    typeName: body.typeName,
                    formId: body.data.formId,
                });
            });

            const result = await make.hooks.create(body);
            expect(result).toStrictEqual(hookCreateMock.hook);
        });

        it('Should get hook details', async () => {
            mockFetch('GET https://make.local/api/v2/hooks/46', hookGetMock);

            const result = await make.hooks.get(46);
            expect(result).toStrictEqual(hookGetMock.hook);
        });

        it('Should update a hook', async () => {
            const body = {
                name: 'Updated Hook',
            };

            mockFetch('PATCH https://make.local/api/v2/hooks/46', hookUpdateMock, req => {
                expect(req.body).toStrictEqual(body);
            });

            const result = await make.hooks.rename(46, body.name);
            expect(result).toStrictEqual(hookUpdateMock.hook);
        });

        it('Should update a hook data', async () => {
            const body = {
                data: {
                    formId: '91282545501353',
                },
            };

            mockFetch('POST https://make.local/api/v2/hooks/46/set-data', hookUpdateDataMock, req => {
                expect(req.body).toStrictEqual(body.data);
            });

            const result = await make.hooks.update(46, body);
            expect(result).toStrictEqual(hookUpdateDataMock.changed);
        });

        it('Should delete a hook', async () => {
            mockFetch('DELETE https://make.local/api/v2/hooks/46?confirmed=true', null);

            await make.hooks.delete(46);
        });

        it('Should ping a hook', async () => {
            mockFetch('GET https://make.local/api/v2/hooks/46/ping', hookPingMock);

            const result = await make.hooks.ping(46);
            expect(result).toStrictEqual(hookPingMock);
        });

        it('Should enable a hook', async () => {
            mockFetch('POST https://make.local/api/v2/hooks/46/enable', hookEnableMock);

            await make.hooks.enable(46);
        });

        it('Should disable a hook', async () => {
            mockFetch('POST https://make.local/api/v2/hooks/46/disable', hookDisableMock);

            await make.hooks.disable(46);
        });

        it('Should start learning mode for a hook', async () => {
            mockFetch('POST https://make.local/api/v2/hooks/46/learn-start', hookLearnStartMock);

            await make.hooks.learnStart(46);
        });

        it('Should stop learning mode for a hook', async () => {
            mockFetch('POST https://make.local/api/v2/hooks/46/learn-stop', hookLearnStopMock);

            await make.hooks.learnStop(46);
        });
    });
});
