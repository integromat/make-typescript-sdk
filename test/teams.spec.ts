import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as teamsListMock from './mocks/teams/list.json';
import * as teamCreateMock from './mocks/teams/create.json';
import * as teamGetMock from './mocks/teams/get.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Teams', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list teams', async () => {
        mockFetch(
            'GET https://make.local/api/v2/teams?organizationId=5&pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc',
            teamsListMock,
        );

        const result = await make.teams.list(5, {
            pg: {
                sortBy: 'name',
                sortDir: 'asc',
            },
        });

        expect(result).toStrictEqual(teamsListMock.teams);
    });

    it('Should get a team', async () => {
        mockFetch('GET https://make.local/api/v2/teams/1', teamGetMock);

        const result = await make.teams.get(1);

        expect(result).toStrictEqual(teamGetMock.team);
    });

    it('Should create a team', async () => {
        const body = {
            name: 'New Team',
            organizationId: 1,
        };

        mockFetch('POST https://make.local/api/v2/teams', teamCreateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.teams.create(body);

        expect(result).toStrictEqual(teamCreateMock.team);
    });

    it('Should delete a team', async () => {
        mockFetch('DELETE https://make.local/api/v2/teams/1?confirmed=true', null);

        await make.teams.delete(1);
    });
});
