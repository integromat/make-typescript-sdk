import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as scenariosMock from './mocks/scenarios/list.json';
import * as scenarioInterfaceMock from './mocks/scenarios/interface.json';
import * as scenarioUpdateInterfaceMock from './mocks/scenarios/update-interface.json';
import * as scenarioRunMock from './mocks/scenarios/run.json';
import * as scenarioActivateMock from './mocks/scenarios/activate.json';
import * as scenarioCreateMock from './mocks/scenarios/create.json';
import * as scenarioGetMock from './mocks/scenarios/get.json';
import * as scenarioUpdateMock from './mocks/scenarios/update.json';
import * as scenarioDeactivateMock from './mocks/scenarios/deactivate.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Scenarios', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    describe('Scenarios', () => {
        it('Should list scenarios in team', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios?teamId=18&pg%5Blimit%5D=1000', scenariosMock);

            const result = await make.scenarios.list(18, {
                pg: {
                    limit: 1000,
                },
            });
            expect(result).toStrictEqual(scenariosMock.scenarios);
        });

        it('Should list scenarios in organization', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios?organizationId=18&pg%5Blimit%5D=1000', scenariosMock);

            const result = await make.scenarios.listInOrganization(18, {
                pg: {
                    limit: 1000,
                },
            });
            expect(result).toStrictEqual(scenariosMock.scenarios);
        });

        it('Should get scenario interface', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios/18/interface', scenarioInterfaceMock);

            const result = await make.scenarios['interface'](18);
            expect(result).toStrictEqual(scenarioInterfaceMock.interface);
        });

        it('Should update scenario interface', async () => {
            const body = {
                interface: {
                    input: [
                        {
                            name: 'userName',
                            type: 'text',
                            default: 'John Doe',
                            required: true,
                            multiline: false,
                        },
                        {
                            name: 'employeeID',
                            type: 'number',
                            required: false,
                        },
                    ],
                    output: null,
                },
            };

            mockFetch('PATCH https://make.local/api/v2/scenarios/18/interface', scenarioUpdateInterfaceMock, req => {
                expect(req.body).toStrictEqual(body);
                expect(req.headers.get('content-type')).toBe('application/json');
            });

            const result = await make.scenarios.setInterface(18, body);
            expect(result).toStrictEqual(scenarioUpdateInterfaceMock.interface);
        });

        it('Should run scenario', async () => {
            const data = { key: 'value' };

            mockFetch('POST https://make.local/api/v2/scenarios/18/run', scenarioRunMock, req => {
                expect(req.body).toStrictEqual({
                    data,
                    responsive: true,
                });
            });

            const result = await make.scenarios.run(18, data);
            expect(result).toStrictEqual(scenarioRunMock);
        });

        it('Should activate scenario', async () => {
            mockFetch('POST https://make.local/api/v2/scenarios/5/start', scenarioActivateMock, req => {
                expect(req.body).toBe('');
            });

            const result = await make.scenarios.activate(5);
            expect(result).toBe(true);
        });

        it('Should create a scenario', async () => {
            const body = {
                teamId: 18,
                folderId: 99,
                scheduling: '{"type":"immediately"}',
                blueprint: '{"flow":[],"metadata":{},"name":"Test Scenario"}',
            };

            mockFetch('POST https://make.local/api/v2/scenarios', scenarioCreateMock, req => {
                expect(req.body).toStrictEqual(body);
            });

            const result = await make.scenarios.create(body);
            expect(result).toStrictEqual(scenarioCreateMock.scenario);
        });

        it('Should get scenario details', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios/123456', scenarioGetMock);

            const result = await make.scenarios.get(123456);
            expect(result).toStrictEqual(scenarioGetMock.scenario);
        });

        it('Should update a scenario', async () => {
            const body = {
                name: 'Updated Test Scenario',
                folderId: 100,
            };

            mockFetch('PATCH https://make.local/api/v2/scenarios/123456', scenarioUpdateMock, req => {
                expect(req.body).toStrictEqual(body);
            });

            const result = await make.scenarios.update(123456, body);
            expect(result).toStrictEqual(scenarioUpdateMock.scenario);
        });

        it('Should delete a scenario', async () => {
            mockFetch('DELETE https://make.local/api/v2/scenarios/1399', null);

            await make.scenarios.delete(1399);
        });

        it('Should deactivate a scenario', async () => {
            mockFetch('POST https://make.local/api/v2/scenarios/5/stop', scenarioDeactivateMock, req => {
                expect(req.body).toBe('');
            });

            const result = await make.scenarios.deactivate(5);
            expect(result).toBe(false);
        });
    });
});
