import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as foldersListMock from './mocks/folders/list.json';
import * as foldersListChildrenMock from './mocks/folders/list-children.json';
import * as foldersCreateMock from './mocks/folders/create.json';
import * as foldersCreateNestedMock from './mocks/folders/create-nested.json';
import * as foldersUpdateMock from './mocks/folders/update.json';
import * as foldersUpdateMoveMock from './mocks/folders/update-move.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Scenario Folders', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    describe('Scenario Folders', () => {
        it('Should list top-level scenario folders in team', async () => {
            mockFetch('GET https://make.local/api/v2/scenarios-folders?teamId=18', foldersListMock);

            const result = await make.folders.list(18);
            expect(result).toStrictEqual(foldersListMock.scenariosFolders);
        });

        it('Should list direct children of a parent folder with all descendants', async () => {
            mockFetch(
                'GET https://make.local/api/v2/scenarios-folders?teamId=18&parentId=1576&childrenDepth=all',
                foldersListChildrenMock,
            );

            const result = await make.folders.list(18, { parentId: 1576, childrenDepth: 'all' });
            expect(result).toStrictEqual(foldersListChildrenMock.scenariosFolders);
        });

        it('Should create a top-level scenario folder', async () => {
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

        it('Should create a nested scenario folder', async () => {
            const body = {
                name: 'cleanup',
                teamId: 18,
                parentId: 1576,
            };

            mockFetch('POST https://make.local/api/v2/scenarios-folders', foldersCreateNestedMock, req => {
                expect(req.body).toStrictEqual(body);
            });

            const result = await make.folders.create(body);
            expect(result).toStrictEqual(foldersCreateNestedMock.scenarioFolder);
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

        it('Should move a scenario folder to a new parent', async () => {
            const body = {
                parentId: 2001,
            };

            let requestBody: unknown;
            mockFetch('PATCH https://make.local/api/v2/scenarios-folders/1576', foldersUpdateMoveMock, req => {
                requestBody = req.body;
            });

            const result = await make.folders.update(1576, body);

            expect(requestBody).toStrictEqual(body);
            expect(result).toStrictEqual(foldersUpdateMoveMock.scenarioFolder);
        });

        it('Should move a scenario folder to the top level', async () => {
            const body = {
                parentId: null,
            };

            let requestBody: unknown;
            mockFetch('PATCH https://make.local/api/v2/scenarios-folders/1576', foldersUpdateMock, req => {
                requestBody = req.body;
            });

            const result = await make.folders.update(1576, body);

            expect(requestBody).toStrictEqual(body);
            expect(result).toStrictEqual(foldersUpdateMock.scenarioFolder);
        });

        it('Should delete a scenario folder', async () => {
            mockFetch('DELETE https://make.local/api/v2/scenarios-folders/1576', null);

            await make.folders.delete(1576);
        });
    });
});
