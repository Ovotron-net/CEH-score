// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {makeBrowserQueryClient, makeQueryClient} from './queryClient';

describe('query clients', () => {
    it('creates a fresh server client for every call', () => {
        expect(makeQueryClient()).not.toBe(makeQueryClient());
    });

    it('disables retries for server queries', () => {
        expect(makeQueryClient().getDefaultOptions().queries?.retry).toBe(false);
    });

    it('retains browser retries for background requests', () => {
        expect(makeBrowserQueryClient().getDefaultOptions().queries?.retry).toBe(1);
    });
});
