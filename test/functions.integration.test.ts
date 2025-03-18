import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Functions', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);
    const functionName = `testFunction${Date.now()}`;
    let testFunctionId: number;

    it('Should create a function', async () => {
        const functionData = {
            name: functionName,
            description: 'Test function created by integration tests',
            code: `function ${functionName}(input) { return input + " processed"; }`,
            args: '(input)',
        };

        const result = await make.functions.create(MAKE_TEAM, functionData);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(functionData.name);
        expect(result.description).toBe(functionData.description);
        expect(result.code).toBe(functionData.code);
        expect(result.args).toBe(functionData.args);

        testFunctionId = result.id;
    });

    it('Should list functions', async () => {
        const functions = await make.functions.list(MAKE_TEAM);

        expect(Array.isArray(functions)).toBe(true);
        expect(functions.length).toBeGreaterThan(0);

        const createdFunction = functions.find(f => f.id === testFunctionId);
        expect(createdFunction).toBeDefined();
    });

    it('Should get function details', async () => {
        const functionDetails = await make.functions.get(testFunctionId);

        expect(functionDetails).toBeDefined();
        expect(functionDetails.id).toBe(testFunctionId);
    });

    it('Should update a function', async () => {
        const updatedData = {
            description: 'Updated test function description',
            code: `function ${functionName}(input) { return input + " processed and updated"; }`,
        };

        const result = await make.functions.update(testFunctionId, updatedData);

        expect(result).toBeDefined();
        expect(result.id).toBe(testFunctionId);
        expect(result.description).toBe(updatedData.description);
        expect(result.code).toBe(updatedData.code);
    });

    it('Should check a function', async () => {
        const code = `function ${functionName}(x) { return x * 2; }`;

        const result = await make.functions.check(MAKE_TEAM, code);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.error).toBeNull();
    });

    it('Should get function history', async () => {
        const history = await make.functions.history(MAKE_TEAM, testFunctionId);

        expect(Array.isArray(history)).toBe(true);
        // The function was updated above, so there should be at least 1 history entry
        expect(history.length).toBeGreaterThan(0);
    });

    it('Should delete a function', async () => {
        await make.functions.delete(testFunctionId);
    });
});
