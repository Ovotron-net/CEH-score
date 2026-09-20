// @vitest-environment node
import {describe, expect, it} from 'vitest';

import {GET} from './route';

describe('health route', () => {
    it('returns health status', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({status: 'ok'});
    });
});
