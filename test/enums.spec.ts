import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as countriesMock from './mocks/enums/countries.json';
import * as regionsMock from './mocks/enums/regions.json';
import * as timezonesMock from './mocks/enums/timezones.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Enums', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list countries', async () => {
        mockFetch('GET https://make.local/api/v2/enums/countries', countriesMock);

        const result = await make.enums.countries();
        expect(result).toStrictEqual(countriesMock.countries);
    });

    it('Should list regions', async () => {
        mockFetch('GET https://make.local/api/v2/enums/imt-regions', regionsMock);

        const result = await make.enums.regions();
        expect(result).toStrictEqual(regionsMock.imtRegions);
    });

    it('Should list timezones', async () => {
        mockFetch('GET https://make.local/api/v2/enums/timezones', timezonesMock);

        const result = await make.enums.timezones();
        expect(result).toStrictEqual(timezonesMock.timezones);
    });
});
