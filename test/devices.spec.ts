import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as devicesListMock from './mocks/devices/list.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Devices', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list devices', async () => {
        mockFetch('GET https://make.local/api/v2/devices?teamId=103', devicesListMock);

        const result = await make.devices.list(103);

        expect(result).toStrictEqual(devicesListMock.devices);
    });
});
