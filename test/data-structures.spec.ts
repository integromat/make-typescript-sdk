import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as dataStructuresMock from './mocks/data-structures/list.json';
import * as dataStructureCreateMock from './mocks/data-structures/create.json';
import * as dataStructureGetMock from './mocks/data-structures/get.json';
import * as dataStructureUpdateMock from './mocks/data-structures/update.json';
import * as dataStructureCloneMock from './mocks/data-structures/clone.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: DataStructures', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list data structures', async () => {
        mockFetch(
            'GET https://make.local/api/v2/data-structures?teamId=1&pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc',
            dataStructuresMock,
        );

        const result = await make.dataStructures.list(1, {
            pg: {
                sortBy: 'name',
                sortDir: 'asc',
            },
        });
        expect(result).toStrictEqual(dataStructuresMock.dataStructures);
    });

    it('Should create a data structure', async () => {
        const body = {
            name: 'Data structure 1',
            teamId: 1,
            spec: [
                {
                    type: 'text',
                    name: 'txt',
                    label: 'Text field',
                    default: 'default string',
                    required: true,
                },
                {
                    type: 'number',
                    name: 'num',
                    label: 'Number field',
                    default: '1,',
                    required: false,
                },
            ],
            strict: true,
        };

        mockFetch('POST https://make.local/api/v2/data-structures', dataStructureCreateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataStructures.create(body);
        expect(result).toStrictEqual(dataStructureCreateMock.dataStructure);
    });

    it('Should get a data structure', async () => {
        mockFetch('GET https://make.local/api/v2/data-structures/9', dataStructureGetMock);

        const result = await make.dataStructures.get(9);
        expect(result).toStrictEqual(dataStructureGetMock.dataStructure);
    });

    it('Should update a data structure', async () => {
        const body = {
            name: 'Data structure 1',
            spec: [
                {
                    type: 'text',
                    name: 'txt',
                    label: 'Text field',
                    default: 'default string',
                    required: true,
                },
                {
                    type: 'number',
                    name: 'num',
                    label: 'Number field',
                    default: '2,',
                    required: false,
                },
                {
                    type: 'boolean',
                    name: 'bool',
                    label: 'Boolean field',
                    default: true,
                    required: false,
                },
            ],
            strict: true,
        };

        mockFetch('PATCH https://make.local/api/v2/data-structures/9', dataStructureUpdateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataStructures.update(9, body);
        expect(result).toStrictEqual(dataStructureUpdateMock.dataStructure);
    });

    it('Should delete a data structure', async () => {
        mockFetch('DELETE https://make.local/api/v2/data-structures/9?confirmed=true', null);

        await make.dataStructures.delete(9);
    });

    it('Should clone a data structure', async () => {
        const body = {
            name: 'Cloned data structure',
            targetTeamId: 22,
        };

        mockFetch('POST https://make.local/api/v2/data-structures/9/clone', dataStructureCloneMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.dataStructures.clone(9, body);
        expect(result).toStrictEqual(dataStructureCloneMock.dataStructure);
    });
});
