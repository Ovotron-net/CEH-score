'use client';

import {useState} from 'react';
import type {ReadinessVisualParameters} from '../../utils/readinessVisual';
import ReadinessShieldFallback from './ReadinessShieldFallback';
import ReadinessShieldScene from './ReadinessShieldScene';

export interface ReadinessShieldProps {
    parameters: ReadinessVisualParameters;
}

export default function ReadinessShield({parameters}: ReadinessShieldProps) {
    const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

    return (
        <div
            data-readiness-status={status}
            className="relative h-full min-h-56 sm:min-h-64 md:min-h-80"
        >
            <div
                hidden={status === 'ready'}
                className={status === 'ready' ? 'invisible absolute inset-0' : 'absolute inset-0'}
            >
                <ReadinessShieldFallback/>
            </div>
            {status !== 'unavailable' ? (
                <ReadinessShieldScene
                    parameters={parameters}
                    onReady={() => setStatus(current => current === 'unavailable' ? current : 'ready')}
                    onUnavailable={() => setStatus('unavailable')}
                />
            ) : null}
        </div>
    );
}
