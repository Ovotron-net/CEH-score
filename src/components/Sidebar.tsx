
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, PlusCircle, BarChart3, Trophy, BookOpen, Settings, Shield
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/add', icon: PlusCircle, label: 'Add Assessment' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/topics', icon: BookOpen, label: 'CEH Topics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#111827] border-r border-[#1f2d40] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#1f2d40]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#00ff88]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">CEH Tracker</h1>
            <p className="text-[#64748b] text-xs">Score Analytics</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                  : 'text-[#64748b] hover:text-white hover:bg-[#1a2235]'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1f2d40]">
        <div className="text-xs text-[#64748b] text-center">
          <span className="text-[#00ff88]">v1.0.0</span> · CEH v13
        </div>
      </div>
    </aside>
  );
}
