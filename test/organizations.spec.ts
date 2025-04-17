import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';
import type { Organization } from '../src/endpoints/organizations.js';

import * as organizationsListMock from './mocks/organizations/list.json';
import * as organizationCreateMock from './mocks/organizations/create.json';
import * as organizationUpdateMock from './mocks/organizations/update.json';
import * as organizationGetMock from './mocks/organizations/get.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Organizations', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list organizations', async () => {
        mockFetch(
            'GET https://make.local/api/v2/organizations?pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc',
            organizationsListMock,
        );

        const result = await make.organizations.list({
            pg: {
                sortBy: 'name',
                sortDir: 'asc',
            },
        });

        expect(result).toStrictEqual(organizationsListMock.organizations);
    });

    it('Should list organizations with additional columns', async () => {
        const cols: (keyof Organization)[] = ['id', 'name'];
        mockFetch(
            `GET https://make.local/api/v2/organizations?cols%5B%5D=${cols.join('&cols%5B%5D=')}`,
            organizationsListMock,
        );

        const result = await make.organizations.list({
            cols,
        });

        expect(result).toStrictEqual(organizationsListMock.organizations);
    });

    it('Should get an organization with wait option', async () => {
        const organizationId = 10;

        mockFetch(`GET https://make.local/api/v2/organizations/${organizationId}?wait=true`, organizationGetMock);

        const result = await make.organizations.get(organizationId, { wait: true });

        expect(result).toStrictEqual(organizationGetMock.organization);
    });

    it('Should create an organization', async () => {
        const body = {
            name: 'New organization',
            regionId: 1,
            timezoneId: 113,
            countryId: 1,
        };

        mockFetch('POST https://make.local/api/v2/organizations', organizationCreateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.organizations.create(body);

        expect(result).toStrictEqual(organizationCreateMock.organization);
    });

    it('Should update an organization', async () => {
        const organizationId = 10;
        const body = {
            name: 'Organization 10',
            timezoneId: 113,
            countryId: 1,
        };

        mockFetch(`PATCH https://make.local/api/v2/organizations/${organizationId}`, organizationUpdateMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        const result = await make.organizations.update(organizationId, body);

        expect(result).toStrictEqual(organizationUpdateMock.organization);
    });

    it('Should delete an organization', async () => {
        const organizationId = 10;
        const response = { organization: organizationId };

        mockFetch(`DELETE https://make.local/api/v2/organizations/${organizationId}?confirmed=true`, response);

        await make.organizations.delete(organizationId);
    });
});
