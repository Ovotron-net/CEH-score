'use client';

import {forwardRef, useCallback} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
    BarChart3,
    BookOpen,
    ClipboardList,
    LayoutDashboard,
    PieChart,
    PlusCircle,
    Settings,
    Shield,
    Trophy,
    X
} from 'lucide-react';
import {preloadAnalyticsCharts, preloadPollAnalyticsChart} from '@/components/charts/lazy';

const navItems = [
    {to: '/', icon: LayoutDashboard, label: 'Dashboard'},
    {to: '/assessments', icon: ClipboardList, label: 'Assessments'},
    {to: '/add', icon: PlusCircle, label: 'Add Assessment'},
    {to: '/analytics', icon: BarChart3, label: 'Analytics', preload: preloadAnalyticsCharts},
    {to: '/leaderboard', icon: Trophy, label: 'Leaderboard'},
    {to: '/polls', icon: PieChart, label: 'Polls', preload: preloadPollAnalyticsChart},
    {to: '/topics', icon: BookOpen, label: 'CEH Topics'},
    {to: '/settings', icon: Settings, label: 'Settings'},
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onNavigate?: () => void;
    mode?: 'desktop' | 'mobile';
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({
    isOpen = false,
    onClose,
    onNavigate,
    mode = 'desktop',
}, ref) {
    const pathname = usePathname() ?? '';
    const handleNavClick = useCallback(() => {
        onNavigate?.();
    }, [onNavigate]);
    const isMobile = mode === 'mobile';

    return (
        <aside
            ref={ref}
            id={isMobile ? 'mobile-navigation' : undefined}
            inert={isMobile && !isOpen}
            aria-hidden={isMobile && !isOpen ? true : undefined}
            className={[
                'w-64 bg-card border-r border-border flex flex-col',
                isMobile
                    ? 'fixed top-0 left-0 z-30 h-screen transition-transform duration-300 ease-in-out lg:hidden'
                    : 'hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-shrink-0',
                isMobile && (isOpen ? 'translate-x-0' : '-translate-x-full'),
            ].join(' ')}
        >
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary"/>
                    </div>
                    <div>
                        <div className="text-foreground font-bold text-base leading-tight">CEH Tracker</div>
                        <p className="text-muted-foreground text-xs">Score Analytics</p>
                    </div>
                </div>
                {isMobile ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close navigation"
                    >
                        <X className="w-4 h-4"/>
                    </button>
                ) : null}
            </div>

            <nav aria-label="Primary navigation" className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({to, icon: Icon, label, preload}) => {
                    const isActive = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
                    return (
                        <Link
                            key={to}
                            href={to}
                            onClick={handleNavClick}
                            onFocus={preload ? () => void preload() : undefined}
                            onPointerEnter={preload ? () => void preload() : undefined}
                            onTouchStart={preload ? () => void preload() : undefined}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                                isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0"/>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                    <span className="text-primary">v1.0.0</span> · CEH v13
                </div>
            </div>
        </aside>
    );
});

export default Sidebar;

