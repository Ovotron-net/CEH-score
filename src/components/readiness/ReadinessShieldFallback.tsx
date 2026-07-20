import {Shield} from 'lucide-react';

export default function ReadinessShieldFallback() {
    return (
        <div
            data-readiness-fallback
            className="flex h-full min-h-56 items-center justify-center sm:min-h-64"
            aria-hidden="true"
        >
            <div className="flex size-36 items-center justify-center rounded-full border border-primary/20 bg-primary/5 sm:size-44">
                <Shield className="size-20 text-primary/70 sm:size-24" strokeWidth={1}/>
            </div>
        </div>
    );
}
