import {act, cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';
import ReadinessVisual from './ReadinessVisual';

const {dynamicImport, dynamicShieldRender} = vi.hoisted(() => {
    const dynamicShieldRender = vi.fn(() => <div data-dynamic-readiness-shield/>);
    return {
        dynamicShieldRender,
        dynamicImport: vi.fn<(
            loader: () => Promise<unknown>,
            options: {loading: () => React.ReactNode},
        ) => typeof dynamicShieldRender>(() => dynamicShieldRender),
    };
});

vi.mock('next/dynamic', () => ({default: dynamicImport}));

const parameters: ReadinessVisualParameters = {
    cohesion: 0.9,
    orbitRegularity: 0.7,
    sectorCoverage: 0.5,
    dataPresence: 1,
};

function renderVisual() {
    return render(<ReadinessVisual parameters={parameters}/>);
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    dynamicShieldRender.mockClear();
});

describe('ReadinessVisual', () => {
    it('isolates the shield client chunk and supplies a standalone fallback', () => {
        expect(dynamicImport).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ssr: false}));
        const options = dynamicImport.mock.calls[0][1];
        const {container} = render(options.loading());

        expect(container.querySelector('[data-readiness-fallback]')).toBeVisible();
    });

    it('keeps the static fallback until load is followed by an idle callback', () => {
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
        let idleCallback: IdleRequestCallback | undefined;
        vi.stubGlobal('requestIdleCallback', vi.fn((callback: IdleRequestCallback) => {
            idleCallback = callback;
            return 41;
        }));
        vi.stubGlobal('cancelIdleCallback', vi.fn());

        const {container} = renderVisual();

        expect(container.querySelector('[data-readiness-fallback]')).toBeVisible();
        expect(dynamicShieldRender).not.toHaveBeenCalled();

        act(() => window.dispatchEvent(new Event('load')));

        expect(requestIdleCallback).toHaveBeenCalledOnce();
        expect(vi.mocked(requestIdleCallback).mock.calls[0][1]?.timeout).toBeLessThan(1000);
        expect(container.querySelector('[data-readiness-fallback]')).toBeVisible();
        expect(dynamicShieldRender).not.toHaveBeenCalled();

        act(() => idleCallback?.({didTimeout: false, timeRemaining: () => 50}));

        expect(container.querySelector('[data-dynamic-readiness-shield]')).toBeInTheDocument();
        expect(dynamicShieldRender).toHaveBeenCalledOnce();
        expect(dynamicShieldRender).toHaveBeenCalledWith({parameters}, undefined);
    });

    it('removes a pending load listener on unmount', () => {
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
        const addEventListener = vi.spyOn(window, 'addEventListener');
        const removeEventListener = vi.spyOn(window, 'removeEventListener');

        const {unmount} = renderVisual();
        const loadListener = addEventListener.mock.calls.find(([type]) => type === 'load')?.[1];

        expect(loadListener).toEqual(expect.any(Function));
        unmount();
        expect(removeEventListener).toHaveBeenCalledWith('load', loadListener);
    });

    it('schedules idle immediately after a completed load and cancels it on unmount', () => {
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
        const requestIdle = vi.fn(() => 42);
        const cancelIdle = vi.fn();
        vi.stubGlobal('requestIdleCallback', requestIdle);
        vi.stubGlobal('cancelIdleCallback', cancelIdle);

        const {unmount} = renderVisual();

        expect(requestIdle).toHaveBeenCalledOnce();
        expect(dynamicShieldRender).not.toHaveBeenCalled();
        unmount();
        expect(cancelIdle).toHaveBeenCalledWith(42);
    });

    it('uses a short fallback timer without requestIdleCallback and cancels it on unmount', () => {
        vi.useFakeTimers();
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
        vi.stubGlobal('requestIdleCallback', undefined);
        vi.stubGlobal('cancelIdleCallback', undefined);
        const setTimeout = vi.spyOn(window, 'setTimeout');
        const clearTimeout = vi.spyOn(window, 'clearTimeout');

        const {unmount} = renderVisual();
        const fallbackTimer = setTimeout.mock.results[0]?.value;
        const fallbackDelay = setTimeout.mock.calls[0]?.[1];

        expect(fallbackDelay).toEqual(expect.any(Number));
        expect(fallbackDelay).toBeLessThan(1000);
        expect(dynamicShieldRender).not.toHaveBeenCalled();
        unmount();
        expect(clearTimeout).toHaveBeenCalledWith(fallbackTimer);
    });
});
