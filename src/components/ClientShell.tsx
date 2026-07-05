'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {Menu, Shield} from 'lucide-react';
import Sidebar from './Sidebar';

export default function ClientShell({children}: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const close = useCallback(() => setSidebarOpen(false), []);

    useEffect(() => {
        if (!sidebarOpen) return;

        const sidebar = sidebarRef.current;
        const focusable = sidebar?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable?.[0];
        const last = focusable?.[focusable.length - 1];
        first?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
                menuButtonRef.current?.focus();
                return;
            }
            if (e.key !== 'Tab' || !focusable?.length) return;

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [sidebarOpen, close]);

    return (
        <div className="flex min-h-screen bg-background">
            {sidebarOpen ? (
                <div
                    className="fixed inset-0 z-20 bg-black/60 lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            ) : null}

            <Sidebar ref={sidebarRef} isOpen={sidebarOpen} onClose={close}/>

            <main className="flex-1 overflow-auto min-w-0">
                <div
                    className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-10">
                    <button
                        ref={menuButtonRef}
                        onClick={() => setSidebarOpen(true)}
                        className="text-muted-foreground hover:text-white transition-colors p-1"
                        aria-label="Open navigation"
                        aria-expanded={sidebarOpen}
                    >
                        <Menu className="w-5 h-5"/>
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary"/>
                        <span className="text-white font-bold text-sm">CEH Tracker</span>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}