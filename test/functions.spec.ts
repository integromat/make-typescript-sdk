import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';
import { mockFetch } from './test.utils.js';

import * as listMock from './mocks/functions/list.json';
import * as getMock from './mocks/functions/get.json';
import * as createMock from './mocks/functions/create.json';
import * as updateMock from './mocks/functions/update.json';
import * as checkMock from './mocks/functions/check.json';
import * as historyMock from './mocks/functions/history.json';

const MAKE_API_KEY = 'api-key';
const MAKE_ZONE = 'make.local';

describe('Endpoints: Functions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    it('Should list functions', async () => {
        mockFetch('GET https://make.local/api/v2/functions?teamId=1', listMock);

        const result = await make.functions.list(1);
        expect(result).toStrictEqual(listMock.functions);
    });

    it('Should get function details', async () => {
        const functionId = 16;
        mockFetch(`GET https://make.local/api/v2/functions/${functionId}`, getMock);

        const result = await make.functions.get(functionId);
        expect(result).toStrictEqual(getMock.function);
    });

    it('Should create a function', async () => {
        const functionData = {
            name: 'symmetricDifference',
            description: 'A function which returns an array with items unique across two arrays.',
            code: 'function symmetricDifference(array1, array2){difference = array1.filter(x => !array2.includes(x)).concat(array2.filter(x => !array1.includes(x))) return difference}',
            args: '(array1, array2)',
        };
        mockFetch('POST https://make.local/api/v2/functions?teamId=1', createMock);

        const result = await make.functions.create(1, functionData);
        expect(result).toStrictEqual(createMock.function);
    });

    it('Should update a function', async () => {
        const functionId = 48;
        const functionData = {
            name: 'greeter',
            description: 'Greet user instead of greeting the World.',
            code: "function greeter(name){return concat('Hello ', name)",
            args: '(name)',
        };
        mockFetch(`PATCH https://make.local/api/v2/functions/${functionId}`, updateMock);

        const result = await make.functions.update(functionId, functionData);
        expect(result).toStrictEqual(updateMock.function);
    });

    it('Should delete a function', async () => {
        const functionId = 16;
        mockFetch(`DELETE https://make.local/api/v2/functions/${functionId}`, {});

        await make.functions.delete(functionId);
    });

    it('Should check a function', async () => {
        const code = 'function greeter(name){return concat("Hello ", name)}';
        mockFetch('POST https://make.local/api/v2/functions/eval?teamId=1', checkMock);

        const result = await make.functions.check(1, code);
        expect(result).toStrictEqual(checkMock);
    });

    it('Should get function history', async () => {
        const functionId = 2;
        mockFetch(`GET https://make.local/api/v2/functions/${functionId}/history?teamId=1`, historyMock);

        const result = await make.functions.history(1, functionId);
        expect(result).toStrictEqual(historyMock.functionHistory);
    });
});
