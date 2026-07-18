import {memo} from 'react';
import type {LucideIcon} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
    trend?: number;
}

const colorMap = {
    green: {
        text: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
    },
    blue: {
        text: 'text-info',
        bg: 'bg-info/10',
        border: 'border-info/20',
    },
    yellow: {
        text: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
    },
    red: {
        text: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
    },
    purple: {
        text: 'text-foreground',
        bg: 'bg-secondary',
        border: 'border-border',
    },
};

const StatCard = memo(function StatCard({title, value, subtitle, icon: Icon, color = 'green', trend}: StatCardProps) {
    const c = colorMap[color];
    return (
        <div
            className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] card-enter">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
                    {subtitle && <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>}
                    {trend !== undefined && (
                        <p className={`text-xs mt-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last
                        </p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${c.text}`}/>
                </div>
            </div>
        </div>
    );
});

export default StatCard;




