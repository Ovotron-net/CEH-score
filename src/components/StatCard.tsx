
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  trend?: number;
}

const colorMap = {
  green: { text: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/20', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.1)]' },
  blue: { text: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10', border: 'border-[#00d4ff]/20', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.1)]' },
  yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.1)]' },
  red: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', glow: 'shadow-[0_0_20px_rgba(248,113,113,0.1)]' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.1)]' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'green', trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-[#111827] border border-[#1f2d40] rounded-xl p-6 transition-all duration-300 ${c.glow} hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[#64748b] text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-[#64748b] text-xs mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </div>
  );
}
