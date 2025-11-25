import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import { Make } from '../src/make.js';

const MAKE_API_KEY = String(process.env.MAKE_API_KEY || '');
const MAKE_ZONE = String(process.env.MAKE_ZONE || '');
const MAKE_TEAM = Number(process.env.MAKE_TEAM || 0);

describe('Integration: Hooks', () => {
    const make = new Make(MAKE_API_KEY, MAKE_ZONE);

    let hookId: number;

    it('Should create a hook', async () => {
        const hook = await make.hooks.create({
            name: `Test Hook ${Date.now()}`,
            teamId: MAKE_TEAM,
            typeName: 'gateway-webhook',
            data: {
                headers: false,
                method: false,
                stringify: false,
            },
        });

        expect(hook).toBeDefined();
        expect(hook.id).toBeDefined();
        expect(hook.name).toContain('Test Hook');
        expect(hook.teamId).toBe(MAKE_TEAM);
        expect(hook.typeName).toBe('gateway-webhook');
        expect(hook.type).toBe('web');
        expect(hook.enabled).toBe(true);

        hookId = hook.id;
    });

    it('Should get a hook', async () => {
        const hook = await make.hooks.get(hookId);

        expect(hook).toBeDefined();
        expect(hook.id).toBe(hookId);
        expect(hook.teamId).toBe(MAKE_TEAM);
        expect(hook.typeName).toBe('gateway-webhook');
        expect(hook.type).toBe('web');
    });

    it('Should rename a hook', async () => {
        const updatedName = `Updated Hook ${Date.now()}`;
        const hook = await make.hooks.rename(hookId, updatedName);

        expect(hook).toBeDefined();
        expect(hook.id).toBe(hookId);
        expect(hook.name).toBe(updatedName);
    });

    it('Should update hook data', async () => {
        const changed = await make.hooks.update(hookId, {
            data: {
                headers: true,
                method: true,
                stringify: true,
            },
        });

        expect(changed).toBe(true);

        // Verify the data was updated
        const hook = await make.hooks.get(hookId);
        expect(hook.data.headers).toBe(true);
        expect(hook.data.method).toBe(true);
        expect(hook.data.stringify).toBe(true);
    });

    it('Should list hooks', async () => {
        const hooks = await make.hooks.list(MAKE_TEAM);

        expect(hooks).toBeDefined();
        expect(Array.isArray(hooks)).toBe(true);

        // Find our created hook
        const createdHook = hooks.find(h => h.id === hookId);
        expect(createdHook).toBeDefined();
    });

    it('Should ping a hook', async () => {
        const pingResult = await make.hooks.ping(hookId);

        expect(pingResult).toBeDefined();
        expect(pingResult.address).toBeDefined();
        expect(typeof pingResult.attached).toBe('boolean');
        expect(typeof pingResult.learning).toBe('boolean');
        expect(typeof pingResult.gone).toBe('boolean');
    });

    it('Should disable and enable a hook', async () => {
        // Disable
        await make.hooks.disable(hookId);
        let hook = await make.hooks.get(hookId);
        expect(hook.enabled).toBe(false);

        // Enable
        await make.hooks.enable(hookId);
        hook = await make.hooks.get(hookId);
        expect(hook.enabled).toBe(true);
    });

    it('Should start and stop learning mode', async () => {
        // Start learning
        await make.hooks.learnStart(hookId);
        let pingResult = await make.hooks.ping(hookId);
        expect(pingResult.learning).toBe(true);

        // Stop learning
        await make.hooks.learnStop(hookId);
        pingResult = await make.hooks.ping(hookId);
        expect(pingResult.learning).toBe(false);
    });

    it('Should delete a hook', async () => {
        await make.hooks.delete(hookId);

        // Verify the hook is deleted by expecting an error when trying to get it
        try {
            await make.hooks.get(hookId);
            // If we get here, the test should fail because the hook should be deleted
            expect(true).toBe(false);
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(error).toBeDefined();
        }
    });
});
