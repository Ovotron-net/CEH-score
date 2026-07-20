import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';

interface SceneProps {
    onReady: () => void;
    onUnavailable: () => void;
}

const {scene, sceneCallbacks} = vi.hoisted(() => {
    const sceneCallbacks = {current: undefined as SceneProps | undefined};
    return {
        sceneCallbacks,
        scene: vi.fn((props: SceneProps) => {
            sceneCallbacks.current = props;
            return <button type="button" onClick={props.onReady}>Ready scene</button>;
        }),
    };
});

vi.mock('./ReadinessShieldScene', () => ({default: scene}));

import ReadinessShield from './ReadinessShield';

const parameters: ReadinessVisualParameters = {
    cohesion: 0.9,
    orbitRegularity: 0.7,
    sectorCoverage: 0.5,
    dataPresence: 1,
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    sceneCallbacks.current = undefined;
});

describe('ReadinessShield', () => {
    it('shows the fallback until the scene reports ready', async () => {
        const {container} = render(<ReadinessShield parameters={parameters}/>);
        expect(container.querySelector('[data-readiness-status]')).toHaveAttribute('data-readiness-status', 'loading');
        expect(container.querySelector('[data-readiness-fallback]')).toBeVisible();

        screen.getByRole('button', {name: 'Ready scene'}).click();

        await waitFor(() => {
            expect(container.querySelector('[data-readiness-status]')).toHaveAttribute('data-readiness-status', 'ready');
            expect(container.querySelector('[data-readiness-fallback]')).not.toBeVisible();
        });
    });

    it('keeps the fallback and removes the scene when it becomes unavailable', async () => {
        scene.mockImplementationOnce(({onUnavailable}: SceneProps) => (
            <button type="button" onClick={onUnavailable}>Fail scene</button>
        ));
        const {container} = render(<ReadinessShield parameters={parameters}/>);

        screen.getByRole('button', {name: 'Fail scene'}).click();

        await waitFor(() => {
            expect(container.querySelector('[data-readiness-status]')).toHaveAttribute(
                'data-readiness-status',
                'unavailable',
            );
            expect(container.querySelector('[data-readiness-fallback]')).toBeVisible();
        });
        expect(screen.queryByRole('button', {name: 'Fail scene'})).not.toBeInTheDocument();
    });

    it('keeps unavailable terminal when a retained callback reports ready after failure', async () => {
        const {container} = render(<ReadinessShield parameters={parameters}/>);
        const retainedCallbacks = sceneCallbacks.current!;

        retainedCallbacks.onUnavailable();

        await waitFor(() => expect(container.querySelector('[data-readiness-fallback]')).toBeVisible());
        expect(screen.queryByRole('button', {name: 'Ready scene'})).not.toBeInTheDocument();

        retainedCallbacks.onReady();

        await waitFor(() => expect(container.querySelector('[data-readiness-fallback]')).toBeVisible());
        expect(screen.queryByRole('button', {name: 'Ready scene'})).not.toBeInTheDocument();
    });
});
