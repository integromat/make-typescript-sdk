import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/scenario-notes/list.json';
import * as getMock from './mocks/scenario-notes/get.json';
import * as createMock from './mocks/scenario-notes/create.json';
import * as updateMock from './mocks/scenario-notes/update.json';
import * as deleteMock from './mocks/scenario-notes/delete.json';
import * as batchMock from './mocks/scenario-notes/batch.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';
const SCENARIO_ID = 19;
const NOTE_ID = '4';

describe('Endpoints: ScenarioNotes', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list notes of a scenario', async () => {
        mockFetch(`GET https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes`, listMock);

        const result = await make.scenarioNotes.list(SCENARIO_ID);
        expect(result).toStrictEqual(listMock.notes);
    });

    it('Should get a scenario note', async () => {
        mockFetch(`GET https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes/${NOTE_ID}`, getMock);

        const result = await make.scenarioNotes.get(SCENARIO_ID, NOTE_ID);
        expect(result).toStrictEqual(getMock.note);
    });

    it('Should create a scenario note', async () => {
        const body = {
            content: '<p>This is a test note</p>',
            moduleIds: [1],
            metadata: { color: '#9138FE' },
            isFilterNote: false,
        };
        mockFetch(`POST https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes`, createMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.scenarioNotes.create(SCENARIO_ID, body);
        expect(result).toStrictEqual(createMock.note);
    });

    it('Should create an empty scenario note', async () => {
        mockFetch(`POST https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes`, createMock, req => {
            expect(req.body).toStrictEqual({});
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.scenarioNotes.create(SCENARIO_ID);
        expect(result).toStrictEqual(createMock.note);
    });

    it('Should update a scenario note', async () => {
        const body = {
            content: '<p>This is an updated test note</p>',
            moduleIds: [1, 2],
            metadata: { canvasPosition: { x: 64, y: 128 }, color: '#9138FE' },
            isFilterNote: true,
        };
        mockFetch(`PATCH https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes/${NOTE_ID}`, updateMock, req => {
            expect(req.body).toStrictEqual(body);
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.scenarioNotes.update(SCENARIO_ID, NOTE_ID, body);
        expect(result).toStrictEqual(updateMock.note);
    });

    it('Should delete a scenario note and return its ID', async () => {
        mockFetch(`DELETE https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes/${NOTE_ID}`, deleteMock);

        const result = await make.scenarioNotes.delete(SCENARIO_ID, NOTE_ID);
        expect(result).toBe(deleteMock.id);
    });

    it('Should batch create, update and delete scenario notes', async () => {
        const body = {
            create: [{ content: '<p>Created in a batch</p>' }],
            update: [{ id: NOTE_ID, content: '<p>Updated in a batch</p>', moduleIds: [1] }],
            delete: ['5'],
            scenarioVersionId: 7,
        };
        mockFetch(`POST https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes/batch`, batchMock, req => {
            // The endpoint 500s on a create entry without `metadata`, so the SDK fills it in.
            expect(req.body).toStrictEqual({ ...body, create: [{ ...body.create[0], metadata: {} }] });
            expect(req.headers.get('content-type')).toBe('application/json');
        });

        const result = await make.scenarioNotes.batch(SCENARIO_ID, body);
        expect(result).toStrictEqual({
            created: batchMock.created,
            updated: batchMock.updated,
            deleted: batchMock.deleted,
        });
    });

    it('Should keep an explicit metadata object on a batched create', async () => {
        const body = {
            create: [{ content: '<p>Created in a batch</p>', metadata: { color: '#9138FE' } }],
            update: [],
            delete: [],
        };
        mockFetch(`POST https://make.local/api/v2/scenarios/${SCENARIO_ID}/notes/batch`, batchMock, req => {
            expect(req.body).toStrictEqual(body);
        });

        await make.scenarioNotes.batch(SCENARIO_ID, body);
    });
});
