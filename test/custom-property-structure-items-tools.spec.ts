import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { MakeTools } from '../src/tools.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/custom-property-structure-items/list.json';
import * as createMock from './mocks/custom-property-structure-items/create.json';
import * as updateMock from './mocks/custom-property-structure-items/update.json';
import * as deleteMock from './mocks/custom-property-structure-items/delete.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const STRUCTURE_ID = 6;

function getTool(name: string) {
    const tool = MakeTools.find(entry => entry.name === name);
    if (!tool) {
        throw new Error(`Missing MCP tool: ${name}`);
    }
    return tool;
}

describe('MCP tools: custom-property-structure-items', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should execute custom-property-structure-items_list', async () => {
        mockFetch(
            `GET https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items?cols%5B%5D=*`,
            listMock,
        );

        const tool = getTool('custom-property-structure-items_list');
        const result = await tool.execute(make, { customPropertyStructureId: STRUCTURE_ID });

        expect(result).toStrictEqual(listMock.customPropertyStructureItems);
    });

    it('Should execute custom-property-structure-items_list with filters', async () => {
        mockFetch(
            `GET https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items` +
                '?cols%5B%5D=*&id=3&name=team&label=Team&description=desc&type=shortText&required=true',
            listMock,
        );

        const tool = getTool('custom-property-structure-items_list');
        const result = await tool.execute(make, {
            customPropertyStructureId: STRUCTURE_ID,
            id: 3,
            name: 'team',
            label: 'Team',
            description: 'desc',
            type: 'shortText',
            required: true,
        });

        expect(result).toStrictEqual(listMock.customPropertyStructureItems);
    });

    it('Should execute custom-property-structure-items_create', async () => {
        const body = { name: 'teamLocation', label: 'Team location', type: 'shortText', required: false };

        mockFetch(
            `POST https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items`,
            createMock,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const tool = getTool('custom-property-structure-items_create');
        const result = await tool.execute(make, { customPropertyStructureId: STRUCTURE_ID, ...body });

        expect(result).toStrictEqual(createMock.customPropertyStructureItem);
    });

    it('Should execute custom-property-structure-items_create with dropdown/multiselect options', async () => {
        const body = {
            name: 'category',
            label: 'Category',
            type: 'multiselect',
            options: [{ value: 'Eshop' }, { value: 'Notifications' }],
            required: false,
        };
        const response = { customPropertyStructureItem: { ...createMock.customPropertyStructureItem, ...body } };

        mockFetch(
            `POST https://make.local/api/v2/custom-property-structures/${STRUCTURE_ID}/custom-property-structure-items`,
            response,
            req => {
                expect(req.body).toStrictEqual(body);
            },
        );

        const tool = getTool('custom-property-structure-items_create');
        const result = await tool.execute(make, { customPropertyStructureId: STRUCTURE_ID, ...body });

        expect(result).toStrictEqual(response.customPropertyStructureItem);
    });

    it('Should execute custom-property-structure-items_update', async () => {
        mockFetch(
            'PATCH https://make.local/api/v2/custom-property-structures/custom-property-structure-items/2',
            updateMock,
            req => {
                expect(req.body).toStrictEqual({ label: 'Updated categories' });
            },
        );

        const tool = getTool('custom-property-structure-items_update');
        const result = await tool.execute(make, { customPropertyStructureItemId: 2, label: 'Updated categories' });

        expect(result).toStrictEqual(updateMock.customPropertyStructureItem);
    });

    it('Should execute custom-property-structure-items_delete', async () => {
        mockFetch(
            'DELETE https://make.local/api/v2/custom-property-structures/custom-property-structure-items/2?confirmed=true',
            deleteMock,
        );

        const tool = getTool('custom-property-structure-items_delete');
        const result = await tool.execute(make, { customPropertyStructureItemId: 2, confirmed: true });

        expect(result).toBe('Custom property structure item has been deleted.');
    });
});
