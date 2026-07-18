import {cleanup, fireEvent, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';

const three = vi.hoisted(() => {
    const renderer = {
        debug: {onShaderError: undefined as (() => void) | undefined},
        dispose: vi.fn(),
        render: vi.fn(),
        setPixelRatio: vi.fn(),
        setSize: vi.fn(),
    };
    const geometry = {
        dispose: vi.fn(),
        setAttribute: vi.fn(),
    };
    const material = {dispose: vi.fn()};
    const scene = {add: vi.fn()};
    const camera = {
        aspect: 1,
        position: {z: 0},
        updateProjectionMatrix: vi.fn(),
    };
    const uniformPointer = {set: vi.fn()};
    const uniformColor = {setHSL: vi.fn()};

    return {
        BufferAttribute: vi.fn(function (array: Float32Array, itemSize: number) {
            return {array, itemSize};
        }),
        BufferGeometry: vi.fn(function () {
            return geometry;
        }),
        Color: vi.fn(function () {
            return uniformColor;
        }),
        PerspectiveCamera: vi.fn(function () {
            return camera;
        }),
        Points: vi.fn(function () {
            return {};
        }),
        Scene: vi.fn(function () {
            return scene;
        }),
        ShaderMaterial: vi.fn(function (options: unknown) {
            void options;
            return material;
        }),
        Vector2: vi.fn(function () {
            return uniformPointer;
        }),
        WebGLRenderer: vi.fn(function () {
            return renderer;
        }),
        camera,
        geometry,
        material,
        renderer,
        scene,
        uniformColor,
        uniformPointer,
    };
});

vi.mock('three', () => ({
    AdditiveBlending: 2,
    BufferAttribute: three.BufferAttribute,
    BufferGeometry: three.BufferGeometry,
    Color: three.Color,
    PerspectiveCamera: three.PerspectiveCamera,
    Points: three.Points,
    Scene: three.Scene,
    ShaderMaterial: three.ShaderMaterial,
    Vector2: three.Vector2,
    WebGLRenderer: three.WebGLRenderer,
}));

import ReadinessShieldScene, {spatialSectorThreshold} from './ReadinessShieldScene';

const parameters: ReadinessVisualParameters = {
    cohesion: 0.9,
    orbitRegularity: 0.7,
    sectorCoverage: 0.5,
    dataPresence: 1,
};

let reducedMotion = false;
let frameSequence = 0;
let pendingFrames: Map<number, FrameRequestCallback>;
let resizeObserver: {disconnect: ReturnType<typeof vi.fn>; trigger: () => void};
let intersectionObserver: {disconnect: ReturnType<typeof vi.fn>; trigger: (visible: boolean) => void};
let themeObserver: {disconnect: ReturnType<typeof vi.fn>; trigger: () => void};

function runPendingFrame(time = 16) {
    const entry = pendingFrames.entries().next().value as [number, FrameRequestCallback] | undefined;
    if (!entry) throw new Error('No pending animation frame');
    pendingFrames.delete(entry[0]);
    entry[1](time);
}

beforeEach(() => {
    reducedMotion = false;
    frameSequence = 0;
    pendingFrames = new Map();
    document.documentElement.style.setProperty('--primary', '160 84% 39%');
    Object.defineProperty(window, 'innerWidth', {configurable: true, value: 1440});
    Object.defineProperty(window, 'devicePixelRatio', {configurable: true, value: 2});
    Object.defineProperty(navigator, 'hardwareConcurrency', {configurable: true, value: 8});
    Object.defineProperty(navigator, 'connection', {configurable: true, value: undefined});
    Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'visible'});

    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
        frameSequence += 1;
        pendingFrames.set(frameSequence, callback);
        return frameSequence;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => {
        pendingFrames.delete(id);
    }));
    vi.stubGlobal('ResizeObserver', vi.fn(function (this: typeof resizeObserver, callback: () => void) {
        resizeObserver = {
            disconnect: vi.fn(),
            trigger: callback,
        };
        return {
            disconnect: resizeObserver.disconnect,
            observe: vi.fn(),
        };
    }));
    vi.stubGlobal('IntersectionObserver', vi.fn(function (
        this: typeof intersectionObserver,
        callback: (entries: Array<{isIntersecting: boolean}>) => void,
    ) {
        intersectionObserver = {
            disconnect: vi.fn(),
            trigger: visible => callback([{isIntersecting: visible}]),
        };
        return {
            disconnect: intersectionObserver.disconnect,
            observe: vi.fn(),
        };
    }));
    vi.stubGlobal('MutationObserver', vi.fn(function (this: typeof themeObserver, callback: () => void) {
        themeObserver = {
            disconnect: vi.fn(),
            trigger: callback,
        };
        return {
            disconnect: themeObserver.disconnect,
            observe: vi.fn(),
        };
    }));
    vi.stubGlobal('matchMedia', vi.fn(() => ({
        matches: reducedMotion,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })));
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        bottom: 320,
        height: 320,
        left: 0,
        right: 640,
        top: 0,
        width: 640,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    });

    vi.clearAllMocks();
    three.renderer.debug.onShaderError = undefined;
    three.renderer.render.mockImplementation(() => undefined);
    three.WebGLRenderer.mockImplementation(function () {
        return three.renderer;
    });
});

afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute('class');
    document.documentElement.removeAttribute('style');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('ReadinessShieldScene', () => {
    it('maps shield positions to the midpoint thresholds of 20 angular sectors', () => {
        const thresholds = Array.from({length: 20}, (_, sectorIndex) => (sectorIndex + 0.5) / 20);

        for (const threshold of thresholds) {
            const angle = -Math.PI + threshold * Math.PI * 2;
            expect(spatialSectorThreshold(Math.cos(angle), Math.sin(angle))).toBeCloseTo(threshold, 10);
        }

        for (let coveredDomains = 0; coveredDomains <= 20; coveredDomains += 1) {
            const coverage = coveredDomains / 20;
            expect(thresholds.filter(threshold => threshold <= coverage)).toHaveLength(coveredDomains);
        }
    });

    it('applies measured cohesion globally while preserving neutral empty-data cohesion in the shader', () => {
        render(<ReadinessShieldScene
            parameters={{...parameters, sectorCoverage: 0}}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const materialOptions = three.ShaderMaterial.mock.calls[0][0] as {vertexShader: string};

        expect(materialOptions.vertexShader).toContain(
            'float globalCohesion = mix(0.42, uCohesion, uDataPresence);',
        );
        expect(materialOptions.vertexShader).toContain(
            'float stability = globalCohesion * mix(0.72, 1.0, activeSector);',
        );
    });

    it('creates one capped point cloud and disposes every resource', () => {
        const onReady = vi.fn();
        const {unmount} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={onReady}
            onUnavailable={vi.fn()}
        />);

        expect(three.Points).toHaveBeenCalledOnce();
        expect(three.scene.add).toHaveBeenCalledOnce();
        expect(three.renderer.setPixelRatio).toHaveBeenCalledWith(1.5);
        expect(three.BufferAttribute.mock.calls[0][0]).toHaveLength(16000 * 3);
        expect(onReady).not.toHaveBeenCalled();

        runPendingFrame();
        expect(onReady).toHaveBeenCalledOnce();

        unmount();
        expect(cancelAnimationFrame).toHaveBeenCalledOnce();
        expect(pendingFrames.size).toBe(0);
        expect(three.geometry.dispose).toHaveBeenCalledOnce();
        expect(three.material.dispose).toHaveBeenCalledOnce();
        expect(three.renderer.dispose).toHaveBeenCalledOnce();
        expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
        expect(intersectionObserver.disconnect).toHaveBeenCalledOnce();
        expect(themeObserver.disconnect).toHaveBeenCalledOnce();
    });

    it('uses the mobile particle and pixel-ratio caps', () => {
        Object.defineProperty(window, 'innerWidth', {configurable: true, value: 375});

        render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);

        expect(three.renderer.setPixelRatio).toHaveBeenCalledWith(1.25);
        expect(three.BufferAttribute.mock.calls[0][0]).toHaveLength(4000 * 3);
    });

    it('renders once and schedules no persistent frame for reduced motion', () => {
        reducedMotion = true;

        render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
            bottom: 320.03125,
            height: 320.03125,
            left: 0,
            right: 640,
            top: 0,
            width: 640,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });
        resizeObserver.trigger();

        expect(three.renderer.render).toHaveBeenCalledOnce();
        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(pendingFrames.size).toBe(0);
    });

    it('renders exactly one fresh reduced-motion frame when parameters change', () => {
        reducedMotion = true;
        const {rerender} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const geometryCount = three.BufferGeometry.mock.calls.length;
        const materialOptions = three.ShaderMaterial.mock.calls[0][0] as {
            uniforms: Record<string, {value: number}>;
        };

        rerender(<ReadinessShieldScene
            parameters={{
                cohesion: 0.61,
                orbitRegularity: 0.42,
                sectorCoverage: 0.05,
                dataPresence: 0,
            }}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);

        expect(materialOptions.uniforms.uCohesion.value).toBe(0.61);
        expect(materialOptions.uniforms.uOrbitRegularity.value).toBe(0.42);
        expect(materialOptions.uniforms.uSectorCoverage.value).toBe(0.05);
        expect(materialOptions.uniforms.uDataPresence.value).toBe(0);
        expect(three.renderer.render).toHaveBeenCalledTimes(2);
        expect(three.BufferGeometry).toHaveBeenCalledTimes(geometryCount);
        expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('queues one reduced-motion refresh while offscreen and draws it once on return', () => {
        reducedMotion = true;
        const {rerender} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const materialOptions = three.ShaderMaterial.mock.calls[0][0] as {
            uniforms: Record<string, {value: number}>;
        };
        expect(three.renderer.render).toHaveBeenCalledOnce();

        intersectionObserver.trigger(false);
        rerender(<ReadinessShieldScene
            parameters={{...parameters, cohesion: 0.63}}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        document.documentElement.style.setProperty('--primary', '210 70% 40%');
        themeObserver.trigger();

        expect(materialOptions.uniforms.uCohesion.value).toBe(0.63);
        expect(three.uniformColor.setHSL).toHaveBeenLastCalledWith(210 / 360, 0.7, 0.4);
        expect(three.renderer.render).toHaveBeenCalledOnce();

        intersectionObserver.trigger(true);
        intersectionObserver.trigger(true);

        expect(three.renderer.render).toHaveBeenCalledTimes(2);
        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(pendingFrames.size).toBe(0);
    });

    it('queues one reduced-motion refresh while the document is hidden and draws it once on return', () => {
        reducedMotion = true;
        const {rerender} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        expect(three.renderer.render).toHaveBeenCalledOnce();

        Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'hidden'});
        fireEvent(document, new Event('visibilitychange'));
        rerender(<ReadinessShieldScene
            parameters={{...parameters, orbitRegularity: 0.31}}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        document.documentElement.style.setProperty('--primary', '25 80% 45%');
        themeObserver.trigger();

        expect(three.renderer.render).toHaveBeenCalledOnce();

        Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'visible'});
        fireEvent(document, new Event('visibilitychange'));
        fireEvent(document, new Event('visibilitychange'));

        expect(three.renderer.render).toHaveBeenCalledTimes(2);
        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(pendingFrames.size).toBe(0);
    });

    it('resizes through ResizeObserver without creating another point cloud', () => {
        render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const pointCount = three.Points.mock.calls.length;

        resizeObserver.trigger();

        expect(three.renderer.setSize).toHaveBeenLastCalledWith(640, 320, false);
        expect(three.camera.aspect).toBe(2);
        expect(three.camera.updateProjectionMatrix).toHaveBeenCalled();
        expect(three.Points).toHaveBeenCalledTimes(pointCount);
    });

    it('pauses offscreen and resumes with at most one frame', () => {
        render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);

        intersectionObserver.trigger(false);
        expect(cancelAnimationFrame).toHaveBeenCalledOnce();
        expect(pendingFrames.size).toBe(0);

        intersectionObserver.trigger(true);
        intersectionObserver.trigger(true);
        expect(pendingFrames.size).toBe(1);
    });

    it('pauses while hidden and resumes with at most one frame', () => {
        render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);

        Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'hidden'});
        fireEvent(document, new Event('visibilitychange'));
        expect(pendingFrames.size).toBe(0);

        Object.defineProperty(document, 'visibilityState', {configurable: true, value: 'visible'});
        fireEvent(document, new Event('visibilitychange'));
        fireEvent(document, new Event('visibilitychange'));
        expect(pendingFrames.size).toBe(1);
    });

    it('updates theme and parameter uniforms without rebuilding geometry', () => {
        const {rerender} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const geometryCount = three.BufferGeometry.mock.calls.length;
        const materialOptions = three.ShaderMaterial.mock.calls[0][0] as {
            uniforms: Record<string, {value: number}>;
        };

        document.documentElement.style.setProperty('--primary', '140 60% 30%');
        themeObserver.trigger();
        rerender(<ReadinessShieldScene
            parameters={{...parameters, cohesion: 0.8}}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        runPendingFrame();

        expect(three.uniformColor.setHSL).toHaveBeenLastCalledWith(140 / 360, 0.6, 0.3);
        expect(materialOptions.uniforms.uCohesion.value).toBe(0.8);
        expect(three.BufferGeometry).toHaveBeenCalledTimes(geometryCount);
    });

    it('writes mouse coordinates directly, targets full strength, and ignores touch', () => {
        const {container} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const canvas = container.querySelector('canvas')!;
        const materialOptions = three.ShaderMaterial.mock.calls[0][0] as {
            uniforms: Record<string, {value: number}>;
            vertexShader: string;
        };

        fireEvent.pointerMove(canvas, {clientX: 10, clientY: 10, pointerType: 'touch'});
        expect(three.uniformPointer.set).not.toHaveBeenCalled();
        runPendingFrame(16);
        expect(materialOptions.uniforms.uPointerStrength.value).toBe(0);

        fireEvent.pointerMove(canvas, {clientX: 320, clientY: 160, pointerType: 'mouse'});
        expect(three.uniformPointer.set).toHaveBeenLastCalledWith(0, -0);
        expect(materialOptions.uniforms.uPointerStrength.value).toBe(0);
        expect(materialOptions.vertexShader).toContain('uniform float uPointerStrength;');
        expect(materialOptions.vertexShader).toContain('* uPointerStrength');
        const calls = three.uniformPointer.set.mock.calls.length;

        fireEvent.pointerMove(canvas, {clientX: 10, clientY: 10, pointerType: 'touch'});
        expect(three.uniformPointer.set).toHaveBeenCalledTimes(calls);
        runPendingFrame(32);
        expect(materialOptions.uniforms.uPointerStrength.value).toBeGreaterThan(0);
        expect(materialOptions.uniforms.uPointerStrength.value).toBeLessThan(1);
    });

    it('visibly decays pointer strength over multiple frames after pointer leave', () => {
        const {container} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={vi.fn()}
        />);
        const canvas = container.querySelector('canvas')!;
        const materialOptions = three.ShaderMaterial.mock.calls[0][0] as {
            uniforms: Record<string, {value: number}>;
        };
        runPendingFrame(16);
        fireEvent.pointerMove(canvas, {clientX: 320, clientY: 160, pointerType: 'mouse'});
        runPendingFrame(66);
        const activeStrength = materialOptions.uniforms.uPointerStrength.value;
        expect(activeStrength).toBeGreaterThan(0);
        expect(activeStrength).toBeLessThan(1);

        fireEvent.pointerLeave(canvas);
        expect(materialOptions.uniforms.uPointerStrength.value).toBe(activeStrength);

        runPendingFrame(116);
        const firstDecay = materialOptions.uniforms.uPointerStrength.value;
        expect(firstDecay).toBeGreaterThan(0);
        expect(firstDecay).toBeLessThan(activeStrength);

        runPendingFrame(166);
        const secondDecay = materialOptions.uniforms.uPointerStrength.value;
        expect(secondDecay).toBeGreaterThan(0);
        expect(secondDecay).toBeLessThan(firstDecay);

        for (let frame = 4; frame <= 25; frame += 1) runPendingFrame(frame * 50);
        expect(materialOptions.uniforms.uPointerStrength.value).toBeLessThan(0.001);
    });

    it('falls back when renderer construction fails', () => {
        const onUnavailable = vi.fn();
        three.WebGLRenderer.mockImplementationOnce(function () {
            throw new Error('WebGL unavailable');
        });

        render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={onUnavailable}
        />);

        expect(onUnavailable).toHaveBeenCalledOnce();
        expect(three.scene.add).not.toHaveBeenCalled();
    });

    it.each([
        {motion: 'animated', reduced: false, failure: 'render exception'},
        {motion: 'animated', reduced: false, failure: 'shader callback'},
        {motion: 'reduced', reduced: true, failure: 'render exception'},
        {motion: 'reduced', reduced: true, failure: 'shader callback'},
    ])('reports only unavailable when the first $motion frame has a $failure', ({reduced, failure}) => {
        reducedMotion = reduced;
        const callbacks: string[] = [];
        three.renderer.render.mockImplementation(() => {
            if (failure === 'render exception') throw new Error('First render failed');
            three.renderer.debug.onShaderError?.();
        });

        expect(() => {
            render(<ReadinessShieldScene
                parameters={parameters}
                onReady={() => callbacks.push('ready')}
                onUnavailable={() => callbacks.push('unavailable')}
            />);
            if (!reduced) runPendingFrame();
        }).not.toThrow();

        expect(callbacks).toEqual(['unavailable']);
        expect(pendingFrames.size).toBe(0);
    });

    it('falls back and releases partial resources when shader material construction fails', () => {
        const onUnavailable = vi.fn();
        three.ShaderMaterial.mockImplementationOnce(function () {
            throw new Error('Shader unavailable');
        });

        expect(() => render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={onUnavailable}
        />)).not.toThrow();

        expect(onUnavailable).toHaveBeenCalledOnce();
        expect(three.geometry.dispose).toHaveBeenCalledOnce();
        expect(three.renderer.dispose).toHaveBeenCalledOnce();
    });

    it('falls back and stops after shader failure or context loss', () => {
        const onUnavailable = vi.fn();
        const {container} = render(<ReadinessShieldScene
            parameters={parameters}
            onReady={vi.fn()}
            onUnavailable={onUnavailable}
        />);

        three.renderer.debug.onShaderError?.();
        expect(onUnavailable).toHaveBeenCalledOnce();
        expect(pendingFrames.size).toBe(0);

        const contextLoss = new Event('webglcontextlost', {cancelable: true});
        fireEvent(container.querySelector('canvas')!, contextLoss);
        expect(contextLoss.defaultPrevented).toBe(true);
        expect(onUnavailable).toHaveBeenCalledTimes(1);
        expect(pendingFrames.size).toBe(0);
    });
});
