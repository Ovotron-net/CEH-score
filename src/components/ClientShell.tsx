'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {Menu, Shield} from 'lucide-react';
import {usePathname} from 'next/navigation';
import Sidebar from './Sidebar';

export default function ClientShell({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const mainRef = useRef<HTMLElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const restoreFocusRef = useRef(false);
    const previousPathnameRef = useRef(pathname);
    const close = useCallback(() => {
        restoreFocusRef.current = true;
        setSidebarOpen(false);
    }, []);
    const closeForNavigation = useCallback(() => {
        restoreFocusRef.current = false;
        setSidebarOpen(false);
    }, []);

    useEffect(() => {
        if (sidebarOpen || !restoreFocusRef.current) return;
        restoreFocusRef.current = false;
        menuButtonRef.current?.focus();
    }, [sidebarOpen]);

    useEffect(() => {
        if (previousPathnameRef.current === pathname) return;
        previousPathnameRef.current = pathname;

        const heading = mainRef.current?.querySelector<HTMLElement>('h1');
        if (!heading) return;
        heading.tabIndex = -1;
        heading.focus();
    }, [pathname]);

    useEffect(() => {
        if (!sidebarOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const sidebar = sidebarRef.current;
        const focusable = sidebar?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable?.[0];
        const last = focusable?.[focusable.length - 1];
        first?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
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
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [sidebarOpen, close]);

    return (
        <div className="flex min-h-screen bg-background">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:ring-2 focus:ring-primary"
            >
                Skip to main content
            </a>
            {sidebarOpen ? (
                <div
                    className="fixed inset-0 z-20 bg-black/60 lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            ) : null}

            <Sidebar mode="desktop"/>
            <Sidebar
                ref={sidebarRef}
                mode="mobile"
                isOpen={sidebarOpen}
                onClose={close}
                onNavigate={closeForNavigation}
            />

            <main
                ref={mainRef}
                id="main-content"
                inert={sidebarOpen}
                className="flex-1 overflow-auto min-w-0"
            >
                <div
                    className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-10">
                    <button
                        type="button"
                        ref={menuButtonRef}
                        onClick={() => {
                            restoreFocusRef.current = false;
                            setSidebarOpen(true);
                        }}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Open navigation"
                        aria-expanded={sidebarOpen}
                        aria-controls="mobile-navigation"
                    >
                        <Menu className="w-5 h-5"/>
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary"/>
                        <span className="text-foreground font-bold text-sm">CEH Tracker</span>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}
