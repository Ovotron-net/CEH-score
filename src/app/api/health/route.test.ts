// @vitest-environment node
import {describe, expect, it, vi} from 'vitest';

const notifyOnStartup = vi.hoisted(() => vi.fn());

vi.mock('@/lib/startup-notify', () => ({notifyOnStartup}));

import {GET} from './route';

describe('health route', () => {
    it('returns health without triggering deployment notifications', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({status: 'ok'});
        expect(notifyOnStartup).not.toHaveBeenCalled();
    });
});
