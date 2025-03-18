import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as foldersListMock from './mocks/folders/list.json';
import * as foldersCreateMock from './mocks/folders/create.json';
import * as foldersUpdateMock from './mocks/folders/update.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Scenario Folders', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    describe('Scenario Folders', () => {
        it('Should list scenario folders in team', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios-folders?teamId=18', foldersListMock);

            const result = await make.folders.list(18);
            expect(result).toStrictEqual(foldersListMock.scenariosFolders);
        });

        it('Should create a scenario folder', async () => {
            const body = {
                name: 'ALPHA',
                teamId: 18,
            };

            mockFetch('POST https://make.local/api/v2/scenarios-folders', foldersCreateMock, req => {
                expect(req.body).toStrictEqual(body);
            });

            const result = await make.folders.create(body);
            expect(result).toStrictEqual(foldersCreateMock.scenarioFolder);
        });

        it('Should update a scenario folder', async () => {
            const body = {
                name: 'BETA',
            };

            mockFetch('PATCH https://make.local/api/v2/scenarios-folders/1576', foldersUpdateMock, req => {
                expect(req.body).toStrictEqual(body);
            });

            const result = await make.folders.update(1576, body);
            expect(result).toStrictEqual(foldersUpdateMock.scenarioFolder);
        });

        it('Should delete a scenario folder', async () => {
            mockFetch('DELETE https://make.local/api/v2/scenarios-folders/1576', null);

            await make.folders.delete(1576);
        });
    });
});
