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

    it('Should list custom property structure items with column selection, pagination, and filters', async () => {
        mockFetch(
            `GET https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items` +
                '?cols%5B%5D=id&cols%5B%5D=name&cols%5B%5D=label&cols%5B%5D=type&cols%5B%5D=required' +
                '&pg%5BsortBy%5D=name&pg%5BsortDir%5D=asc&pg%5Boffset%5D=0&pg%5Blimit%5D=10' +
                '&id=3&name=team&label=Team&description=desc&type=shortText&required=true',
            listMock,
        );

        const result = await make.customPropertyStructures.items.list(STRUCTURE_ID, {
            cols: ['id', 'name', 'label', 'type', 'required'],
            pg: { sortBy: 'name', sortDir: 'asc', offset: 0, limit: 10 },
            id: 3,
            name: 'team',
            label: 'Team',
            description: 'desc',
            type: 'shortText',
            required: true,
        });

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

    it('Should create a dropdown/multiselect custom property structure item with options', async () => {
        const body = {
            name: 'category',
            label: 'Category',
            type: 'multiselect' as const,
            options: [{ value: 'Eshop' }, { value: 'Notifications' }],
            required: false,
        };
        const response = {
            customPropertyStructureItem: {
                ...createMock.customPropertyStructureItem,
                name: body.name,
                label: body.label,
                type: body.type,
                options: body.options,
                required: body.required,
            },
        };

        mockFetch(
            `POST https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items`,
            response,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const result = await make.customPropertyStructures.items.create(STRUCTURE_ID, body);

        expect(result).toStrictEqual(response.customPropertyStructureItem);
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
