'use client';

<<<<<<< Updated upstream
import {forwardRef, useCallback} from 'react';
=======
<<<<<<< HEAD
import { useCallback } from 'react';
>>>>>>> Stashed changes
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

const navItems = [
    {to: '/', icon: LayoutDashboard, label: 'Dashboard'},
    {to: '/assessments', icon: ClipboardList, label: 'Assessments'},
    {to: '/add', icon: PlusCircle, label: 'Add Assessment'},
    {to: '/analytics', icon: BarChart3, label: 'Analytics'},
    {to: '/leaderboard', icon: Trophy, label: 'Leaderboard'},
    {to: '/polls', icon: PieChart, label: 'Polls'},
    {to: '/topics', icon: BookOpen, label: 'CEH Topics'},
    {to: '/settings', icon: Settings, label: 'Settings'},
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({isOpen = false, onClose}, ref) {
    const pathname = usePathname() ?? '';
    const handleNavClick = useCallback(() => {
        onClose?.();
    }, [onClose]);

    return (
        <aside
            ref={ref}
            className={[
                'fixed top-0 left-0 z-30 h-screen',
                'w-64 bg-card border-r border-border flex flex-col',
                'transition-transform duration-300 ease-in-out',
                'lg:sticky lg:translate-x-0 lg:flex-shrink-0',
                isOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
        >
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base leading-tight">CEH Tracker</h1>
                        <p className="text-muted-foreground text-xs">Score Analytics</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden text-muted-foreground hover:text-white transition-colors p-1"
                    aria-label="Close navigation"
                >
                    <X className="w-4 h-4"/>
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({to, icon: Icon, label}) => {
                    const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
                    return (
                        <Link
                            key={to}
                            href={to}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                                isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:text-white hover:bg-secondary'
                            }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0"/>
                            {label}
                        </Link>
                    );
                })}
            </nav>

<<<<<<< Updated upstream
=======
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <span className="text-primary">v1.0.0</span> · CEH v13
        </div>
      </div>
    </aside>
  );
}
=======
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

const navItems = [
    {to: '/', icon: LayoutDashboard, label: 'Dashboard'},
    {to: '/assessments', icon: ClipboardList, label: 'Assessments'},
    {to: '/add', icon: PlusCircle, label: 'Add Assessment'},
    {to: '/analytics', icon: BarChart3, label: 'Analytics'},
    {to: '/leaderboard', icon: Trophy, label: 'Leaderboard'},
    {to: '/polls', icon: PieChart, label: 'Polls'},
    {to: '/topics', icon: BookOpen, label: 'CEH Topics'},
    {to: '/settings', icon: Settings, label: 'Settings'},
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({isOpen = false, onClose}, ref) {
    const pathname = usePathname() ?? '';
    const handleNavClick = useCallback(() => {
        onClose?.();
    }, [onClose]);

    return (
        <aside
            ref={ref}
            className={[
                'fixed top-0 left-0 z-30 h-screen',
                'w-64 bg-card border-r border-border flex flex-col',
                'transition-transform duration-300 ease-in-out',
                'lg:sticky lg:translate-x-0 lg:flex-shrink-0',
                isOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
        >
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base leading-tight">CEH Tracker</h1>
                        <p className="text-muted-foreground text-xs">Score Analytics</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden text-muted-foreground hover:text-white transition-colors p-1"
                    aria-label="Close navigation"
                >
                    <X className="w-4 h-4"/>
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({to, icon: Icon, label}) => {
                    const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
                    return (
                        <Link
                            key={to}
                            href={to}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                                isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:text-white hover:bg-secondary'
                            }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0"/>
                            {label}
                        </Link>
                    );
                })}
            </nav>

>>>>>>> Stashed changes
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                    <span className="text-primary">v1.0.0</span> · CEH v13
                </div>
            </div>
        </aside>
    );
});

export default Sidebar;
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes

