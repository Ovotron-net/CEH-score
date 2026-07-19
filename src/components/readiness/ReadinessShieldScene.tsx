'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';

interface ReadinessShieldSceneProps {
    parameters: ReadinessVisualParameters;
    onReady: () => void;
    onUnavailable: () => void;
}

const vertexShader = `
attribute vec3 aSeed;
attribute vec3 aTarget;
attribute float aSector;
attribute float aRandom;
uniform float uTime;
uniform float uAssembly;
uniform float uCohesion;
uniform float uOrbitRegularity;
uniform float uSectorCoverage;
uniform float uDataPresence;
uniform vec2 uPointer;
uniform float uPointerStrength;
varying float vAlpha;

void main() {
    float activeSector = step(aSector, uSectorCoverage);
    float globalCohesion = mix(0.42, uCohesion, uDataPresence);
    float stability = globalCohesion * mix(0.72, 1.0, activeSector);
    float assembled = smoothstep(0.0, 1.0, uAssembly) * stability;
    float orbitAngle = uTime * mix(0.32, 0.12, uOrbitRegularity) + aRandom * 6.28318;
    vec3 orbit = vec3(cos(orbitAngle), sin(orbitAngle * 0.83), sin(orbitAngle))
        * (0.10 + (1.0 - uOrbitRegularity) * 0.16);
    vec3 position = mix(aSeed + orbit, aTarget, assembled);
    vec2 delta = position.xy - uPointer * vec2(2.1, 1.7);
    float pointerForce = max(0.0, 0.55 - length(delta)) * 0.18 * uPointerStrength;
    position.xy += normalize(delta + vec2(0.0001)) * pointerForce;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(10.0 / -viewPosition.z, 1.2, 3.2);
    vAlpha = mix(0.28, 0.92, activeSector)
        * mix(0.65, 1.0, stability)
        * mix(0.72, 1.0, uDataPresence);
}
`;

const fragmentShader = `
uniform vec3 uColor;
varying float vAlpha;

void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.12, distanceFromCenter) * vAlpha;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor, alpha);
}
`;

function particleBudget(): number {
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
    if (window.innerWidth < 768 || connection?.saveData) return 4000;
    if ((navigator.hardwareConcurrency ?? 4) >= 8 && window.innerWidth >= 1280) return 16000;
    return 12000;
}

function parseHslChannels(value: string): [number, number, number] | null {
    const match = value.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    return match ? [Number(match[1]) / 360, Number(match[2]) / 100, Number(match[3]) / 100] : null;
}

export function spatialSectorThreshold(x: number, y: number): number {
    const normalizedAngle = (Math.atan2(y, x) + Math.PI) / (Math.PI * 2);
    const sectorIndex = Math.min(19, Math.floor(normalizedAngle * 20));
    return (sectorIndex + 0.5) / 20;
}

function createAttributes(count: number) {
    const seeds = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const sectors = new Float32Array(count);
    const randoms = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const radius = 1.8 + Math.random() * 1.8;
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * 2.8;
        seeds[offset] = Math.cos(angle) * radius;
        seeds[offset + 1] = elevation;
        seeds[offset + 2] = Math.sin(angle) * radius * 0.45;

        const y = 1.9 - Math.random() * 3.8;
        const lowerHalf = y < 0;
        const width = lowerHalf
            ? 1.55 * Math.sqrt(Math.max(0, (y + 1.9) / 1.9))
            : 1.45 + (y / 1.9) * 0.18;
        targets[offset] = (Math.random() * 2 - 1) * width;
        targets[offset + 1] = y;
        targets[offset + 2] = (Math.random() - 0.5) * 0.18;
        sectors[index] = spatialSectorThreshold(targets[offset], targets[offset + 1]);
        randoms[index] = Math.random();
    }

    return {seeds, targets, sectors, randoms};
}

export default function ReadinessShieldScene({
    parameters,
    onReady,
    onUnavailable,
}: ReadinessShieldSceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const parametersRef = useRef(parameters);
    const updateParametersRef = useRef<((next: ReadinessVisualParameters) => void) | null>(null);
    const onReadyRef = useRef(onReady);
    const onUnavailableRef = useRef(onUnavailable);

    useEffect(() => {
        parametersRef.current = parameters;
        updateParametersRef.current?.(parameters);
    }, [parameters]);
    useEffect(() => {
        onReadyRef.current = onReady;
    }, [onReady]);
    useEffect(() => {
        onUnavailableRef.current = onUnavailable;
    }, [onUnavailable]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: false,
                powerPreference: 'high-performance',
            });
        } catch {
            onUnavailableRef.current();
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
        camera.position.z = 6;
        const geometry = new THREE.BufferGeometry();
        const attributes = createAttributes(particleBudget());
        geometry.setAttribute('position', new THREE.BufferAttribute(attributes.targets, 3));
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(attributes.seeds, 3));
        geometry.setAttribute('aTarget', new THREE.BufferAttribute(attributes.targets, 3));
        geometry.setAttribute('aSector', new THREE.BufferAttribute(attributes.sectors, 1));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(attributes.randoms, 1));

        const uniforms = {
            uTime: {value: 0},
            uAssembly: {value: 0},
            uCohesion: {value: parametersRef.current.cohesion},
            uOrbitRegularity: {value: parametersRef.current.orbitRegularity},
            uSectorCoverage: {value: parametersRef.current.sectorCoverage},
            uDataPresence: {value: parametersRef.current.dataPresence},
            uPointer: {value: new THREE.Vector2(0, 0)},
            uPointerStrength: {value: 0},
            uColor: {value: new THREE.Color()},
        };
        let material: THREE.ShaderMaterial;
        try {
            material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });
        } catch {
            geometry.dispose();
            renderer.dispose();
            onUnavailableRef.current();
            return;
        }
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let disposed = false;
        let unavailable = false;
        let visible = true;
        let documentVisible = document.visibilityState !== 'hidden';
        let staticRefreshPending = false;
        let frameId: number | null = null;
        let activeTime = 0;
        let previousTime: number | null = null;
        let initialized = false;
        let readyReported = false;
        let renderedWidth = 0;
        let renderedHeight = 0;
        let renderedPixelRatio = 0;
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reducedMotion = reducedMotionQuery.matches;
        let pointerStrength = 0;
        let pointerTargetStrength = 0;

        const stop = () => {
            if (frameId !== null) cancelAnimationFrame(frameId);
            frameId = null;
            previousTime = null;
        };
        const fail = () => {
            if (disposed || unavailable) return;
            unavailable = true;
            stop();
            onUnavailableRef.current();
        };
        const renderScene = () => {
            try {
                renderer.render(scene, camera);
            } catch {
                fail();
            }
            return !unavailable;
        };
        const renderStaticFrame = () => {
            if (disposed || unavailable || !reducedMotion || !initialized) return;
            if (!visible || !documentVisible) {
                staticRefreshPending = true;
                return;
            }
            staticRefreshPending = false;
            if (!renderScene() || readyReported) return;
            readyReported = true;
            onReadyRef.current();
        };
        const updateParameterUniforms = (next: ReadinessVisualParameters) => {
            uniforms.uCohesion.value = next.cohesion;
            uniforms.uOrbitRegularity.value = next.orbitRegularity;
            uniforms.uSectorCoverage.value = next.sectorCoverage;
            uniforms.uDataPresence.value = next.dataPresence;
        };
        updateParametersRef.current = next => {
            updateParameterUniforms(next);
            renderStaticFrame();
        };
        const updateTheme = () => {
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const hsl = parseHslChannels(primary);
            if (hsl) uniforms.uColor.value.setHSL(...hsl);
            renderStaticFrame();
        };
        const renderFrame = (time: number) => {
            frameId = null;
            if (disposed || unavailable || !visible || !documentVisible) return;
            const delta = previousTime === null ? 0 : Math.min(50, time - previousTime);
            previousTime = time;
            activeTime += delta;
            if (delta > 0 && pointerStrength !== pointerTargetStrength) {
                const interpolation = 1 - Math.exp(-delta / 120);
                pointerStrength += (pointerTargetStrength - pointerStrength) * interpolation;
                uniforms.uPointerStrength.value = pointerStrength;
            }
            uniforms.uTime.value = activeTime / 1000;
            uniforms.uAssembly.value = reducedMotion ? 1 : Math.min(1, activeTime / 1600);
            updateParameterUniforms(parametersRef.current);
            if (!renderScene()) return;
            if (!readyReported) {
                readyReported = true;
                onReadyRef.current();
            }
            if (!reducedMotion) frameId = requestAnimationFrame(renderFrame);
        };
        const start = () => {
            if (disposed || unavailable || reducedMotion || !visible || !documentVisible || frameId !== null) return;
            previousTime = null;
            frameId = requestAnimationFrame(renderFrame);
        };
        const onReducedMotionChange = (event: MediaQueryListEvent) => {
            if (reducedMotion === event.matches) return;
            reducedMotion = event.matches;
            if (!reducedMotion) {
                staticRefreshPending = false;
                start();
                return;
            }

            stop();
            activeTime = Math.max(activeTime, 1600);
            uniforms.uAssembly.value = 1;
            uniforms.uPointer.value.set(0, 0);
            pointerStrength = 0;
            pointerTargetStrength = 0;
            uniforms.uPointerStrength.value = 0;
            updateParameterUniforms(parametersRef.current);
            renderStaticFrame();
        };
        const resize = () => {
            const {width, height} = container.getBoundingClientRect();
            if (width <= 0 || height <= 0) return;
            const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5);
            const sameSize = Math.abs(width - renderedWidth) < 0.5 && Math.abs(height - renderedHeight) < 0.5;
            if (sameSize && pixelRatio === renderedPixelRatio) return;
            renderedWidth = width;
            renderedHeight = height;
            renderedPixelRatio = pixelRatio;
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderStaticFrame();
        };
        const onPointerMove = (event: PointerEvent) => {
            if (reducedMotion || event.pointerType === 'touch') return;
            const bounds = canvas.getBoundingClientRect();
            if (bounds.width <= 0 || bounds.height <= 0) return;
            const pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            const pointerY = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
            uniforms.uPointer.value.set(pointerX, pointerY);
            pointerTargetStrength = 1;
        };
        const onPointerLeave = () => {
            if (reducedMotion) return;
            pointerTargetStrength = 0;
        };
        const onVisibilityChange = () => {
            documentVisible = document.visibilityState !== 'hidden';
            if (documentVisible) {
                if (staticRefreshPending) renderStaticFrame();
                else start();
            }
            else stop();
        };
        const onContextLost = (event: Event) => {
            event.preventDefault();
            fail();
        };

        renderer.debug.onShaderError = fail;
        const resizeObserver = new ResizeObserver(resize);
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
                if (staticRefreshPending) renderStaticFrame();
                else start();
            }
            else stop();
        });
        const themeObserver = new MutationObserver(updateTheme);
        resizeObserver.observe(container);
        intersectionObserver.observe(container);
        themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class', 'style']});
        canvas.addEventListener('pointermove', onPointerMove, {passive: true});
        canvas.addEventListener('pointerleave', onPointerLeave, {passive: true});
        canvas.addEventListener('webglcontextlost', onContextLost);
        document.addEventListener('visibilitychange', onVisibilityChange);
        reducedMotionQuery.addEventListener('change', onReducedMotionChange);

        updateTheme();
        resize();
        initialized = true;
        if (reducedMotion) {
            uniforms.uAssembly.value = 1;
            updateParameterUniforms(parametersRef.current);
            renderStaticFrame();
        }
        else start();

        return () => {
            if (disposed) return;
            disposed = true;
            updateParametersRef.current = null;
            stop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            themeObserver.disconnect();
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerleave', onPointerLeave);
            canvas.removeEventListener('webglcontextlost', onContextLost);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            data-readiness-canvas
            className="block size-full min-h-56 sm:min-h-64 md:min-h-80"
        />
    );
}
