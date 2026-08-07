import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/custom-property-structure-items/list.json';
import * as createMock from './mocks/custom-property-structure-items/create.json';
import * as updateMock from './mocks/custom-property-structure-items/update.json';
import * as deleteMock from './mocks/custom-property-structure-items/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const STRUCTURE_ID = 6;

describe('Endpoints: CustomPropertyStructureItems', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list custom property structure items', async () => {
        mockFetch(
            `GET https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items`,
            listMock,
        );

        const result = await make.customPropertyStructures.items.list(STRUCTURE_ID);

        expect(result).toStrictEqual(listMock.customPropertyStructureItems);
    });

    it('Should create a custom property structure item', async () => {
        const body = {
            name: 'teamLocation',
            label: 'Team location',
            description: 'Location of the team managing the scenario.',
            type: 'shortText' as const,
            required: false,
        };

        mockFetch(
            `POST https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items`,
            createMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.customPropertyStructures.items.create(STRUCTURE_ID, body);

        expect(result).toStrictEqual(createMock.customPropertyStructureItem);
    });

    it('Should update a custom property structure item', async () => {
        const body = { label: 'Updated categories' };

        mockFetch(
            'PATCH https://make.local/api/v2/custom-property-structures/custom-property-structure-items/2',
            updateMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.customPropertyStructures.items.update(2, body);

        expect(result).toStrictEqual(updateMock.customPropertyStructureItem);
    });

    it('Should delete a custom property structure item', async () => {
        mockFetch(
            'DELETE https://make.local/api/v2/custom-property-structures/custom-property-structure-items/2',
            deleteMock,
        );

        await make.customPropertyStructures.items.delete(2);
    });

    it('Should delete a custom property structure item with confirmation', async () => {
        mockFetch(
            'DELETE https://make.local/api/v2/custom-property-structures/custom-property-structure-items/2?confirmed=true',
            deleteMock,
        );

        await make.customPropertyStructures.items.delete(2, { confirmed: true });
    });
});
