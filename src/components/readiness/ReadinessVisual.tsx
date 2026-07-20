'use client';

import {Component, type ErrorInfo, type ReactNode, useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';
import ReadinessShieldFallback from './ReadinessShieldFallback';

const ReadinessShield = dynamic(() => import('./ReadinessShield'), {
    ssr: false,
    loading: () => <ReadinessShieldFallback/>,
});

class ReadinessVisualBoundary extends Component<
    {children: ReactNode},
    {failed: boolean}
> {
    state = {failed: false};

    static getDerivedStateFromError() {
        return {failed: true};
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        if (process.env.NODE_ENV !== 'production') console.error(error, info);
    }

    render() {
        return this.state.failed ? <ReadinessShieldFallback/> : this.props.children;
    }
}

export interface ReadinessVisualProps {
    parameters: ReadinessVisualParameters;
}

export default function ReadinessVisual({parameters}: ReadinessVisualProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        let idleCallbackId: number | null = null;
        let fallbackTimerId: number | null = null;
        const renderShield = () => {
            idleCallbackId = null;
            fallbackTimerId = null;
            setShouldRender(true);
        };
        const scheduleRender = () => {
            if (typeof window.requestIdleCallback === 'function') {
                idleCallbackId = window.requestIdleCallback(renderShield, {timeout: 500});
            } else {
                fallbackTimerId = window.setTimeout(renderShield, 50);
            }
        };

        if (document.readyState === 'complete') scheduleRender();
        else window.addEventListener('load', scheduleRender, {once: true});

        return () => {
            window.removeEventListener('load', scheduleRender);
            if (idleCallbackId !== null) window.cancelIdleCallback(idleCallbackId);
            if (fallbackTimerId !== null) window.clearTimeout(fallbackTimerId);
        };
    }, []);

    if (!shouldRender) return <ReadinessShieldFallback/>;

    return (
        <ReadinessVisualBoundary>
            <ReadinessShield parameters={parameters}/>
        </ReadinessVisualBoundary>
    );
}
