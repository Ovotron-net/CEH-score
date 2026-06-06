'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Trophy, PlusCircle } from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import { useSettings } from '../hooks/useSettings';
import { format } from 'date-fns';

type Period = 'all' | 'month' | 'week';

const PERIOD_LABELS: Record<Period, string> = { all: 'All Time', month: 'This Month', week: 'This Week' };

function cutoffDate(period: Period): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'week') d.setDate(d.getDate() - 7);
  if (period === 'month') d.setDate(d.getDate() - 30);
  return d;
}

const getRankBadge = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const scoreColor = (pct: number) =>
  pct >= 90 ? 'text-primary' : pct >= 80 ? 'text-accent' : pct >= 70 ? 'text-yellow-400' : 'text-red-400';

export default function Leaderboard() {
  const { assessments, isError } = useAssessments();
  const { settings } = useSettings();
  const [period, setPeriod] = useState<Period>('all');

  const entries = useMemo(() => {
    const cutoff = cutoffDate(period);
    return assessments
      .filter(a => !cutoff || new Date(a.date) >= cutoff)
      .sort((a, b) => b.percentage - a.percentage)
      .map((a, i) => ({ ...a, rank: i + 1 }));
  }, [assessments, period]);

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      {isError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          Failed to load assessments — your data may be unavailable. Check your connection.
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal best scores — <span className="text-primary">{settings.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                  : 'bg-card text-muted-foreground border border-border hover:text-white'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 1 && (
        <div className={`grid gap-4 mb-8 ${entries.length >= 3 ? 'grid-cols-3' : entries.length === 2 ? 'grid-cols-2 max-w-sm mx-auto' : 'grid-cols-1 max-w-xs mx-auto'}`}>
          {entries.slice(0, 3).map((entry, i) => (
            <div
              key={entry.id}
              className={`bg-card border rounded-xl p-5 text-center card-enter ${
                i === 0 ? 'border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]' :
                i === 1 ? 'border-muted-foreground/30' :
                'border-orange-700/30'
              }`}
            >
              <div className="text-4xl mb-2">{getRankBadge(entry.rank)}</div>
              <p className="text-muted-foreground text-xs mb-1 truncate">{entry.domain}</p>
              <p className={`text-2xl font-bold ${scoreColor(entry.percentage)}`}>{entry.percentage}%</p>
              <p className="text-muted-foreground text-xs mt-1">{entry.score}/{entry.maxScore} correct</p>
              <p className="text-muted-foreground text-xs mt-0.5">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full rankings */}
      {entries.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="mb-3">No assessments for this period</p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-medium transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Assessment
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_80px_80px_100px] gap-4 px-5 py-3 border-b border-border text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <span>Rank</span>
            <span>Domain</span>
            <span className="text-right">Score</span>
            <span className="text-right">%</span>
            <span className="text-right">Date</span>
          </div>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="grid grid-cols-[48px_1fr_80px_80px_100px] gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary transition-colors"
            >
              <span className="text-lg">{getRankBadge(entry.rank)}</span>
              <span className="text-white font-medium text-sm truncate">{entry.domain}</span>
              <span className="text-right text-muted-foreground text-sm">{entry.score}/{entry.maxScore}</span>
              <span className={`text-right text-sm font-medium ${scoreColor(entry.percentage)}`}>{entry.percentage}%</span>
              <span className="text-right text-muted-foreground text-xs">{format(new Date(entry.date), 'MMM d, yy')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



