import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/custom-property-structures/list.json';
import * as createMock from './mocks/custom-property-structures/create.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: CustomPropertyStructures', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list custom property structures', async () => {
        mockFetch('GET https://make.local/api/v2/custom-property-structures?organizationId=57', listMock);

        const result = await make.customPropertyStructures.list(57);

        expect(result).toStrictEqual(listMock.customPropertyStructures);
    });

    it('Should create a custom property structure', async () => {
        const body = {
            associatedType: 'scenario' as const,
            belongerType: 'organization' as const,
            belongerId: 57,
        };

        mockFetch('POST https://make.local/api/v2/custom-property-structures', createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.customPropertyStructures.create(body);

        expect(result).toStrictEqual(createMock.customPropertyStructure);
    });
});
