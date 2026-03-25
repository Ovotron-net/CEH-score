import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { MOCK_LEADERBOARD } from '../data/mockLeaderboard';
import { useAssessments } from '../hooks/useAssessments';
import { useSettings } from '../hooks/useSettings';
import { getBestScore } from '../utils/calculations';

export default function Leaderboard() {
  const { assessments } = useAssessments();
  const { settings } = useSettings();
  const [period, setPeriod] = useState('all');

  const bestScore = getBestScore(assessments);
  const userEntry = bestScore > 0 ? {
    id: 'user',
    name: settings.name + ' (You)',
    score: Math.round(bestScore * 1.25),
    percentage: bestScore,
    date: new Date().toISOString().split('T')[0],
    badge: '🎯',
  } : null;

  const allEntries = [...MOCK_LEADERBOARD, ...(userEntry ? [userEntry] : [])]
    .sort((a, b) => b.percentage - a.percentage)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-[#64748b] text-sm mt-1">Top CEH practitioners</p>
        </div>
        <div className="flex gap-2">
          {['all', 'month', 'week'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                  : 'bg-[#111827] text-[#64748b] border border-[#1f2d40] hover:text-white'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {allEntries.slice(0, 3).map((entry, i) => (
          <div
            key={entry.id}
            className={`bg-[#111827] border rounded-xl p-5 text-center ${
              i === 0 ? 'border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]' :
              i === 1 ? 'border-gray-400/30' :
              'border-orange-700/30'
            } ${entry.id === 'user' ? 'ring-2 ring-[#00ff88]/30' : ''}`}
          >
            <div className="text-4xl mb-2">{getRankBadge(entry.rank)}</div>
            <p className="text-white font-semibold text-sm">{entry.name}</p>
            <p className={`text-2xl font-bold mt-1 ${
              i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-orange-500'
            }`}>{entry.percentage}%</p>
            <p className="text-[#64748b] text-xs mt-1">{entry.score}/125</p>
          </div>
        ))}
      </div>

      {/* Rest of leaderboard */}
      <div className="bg-[#111827] border border-[#1f2d40] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_80px_80px_100px] gap-4 px-5 py-3 border-b border-[#1f2d40] text-[#64748b] text-xs font-medium uppercase tracking-wider">
          <span>Rank</span>
          <span>Name</span>
          <span className="text-right">Score</span>
          <span className="text-right">%</span>
          <span className="text-right">Date</span>
        </div>
        {allEntries.map(entry => (
          <div
            key={entry.id}
            className={`grid grid-cols-[48px_1fr_80px_80px_100px] gap-4 px-5 py-4 border-b border-[#1f2d40] last:border-0 hover:bg-[#1a2235] transition-colors ${
              entry.id === 'user' ? 'bg-[#00ff88]/5 border-l-2 border-l-[#00ff88]' : ''
            }`}
          >
            <span className="text-lg">{getRankBadge(entry.rank)}</span>
            <span className="text-white font-medium text-sm flex items-center gap-2">
              {entry.name}
              {entry.id === 'user' && (
                <span className="text-xs px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded-full">You</span>
              )}
            </span>
            <span className="text-right text-[#64748b] text-sm">{entry.score}</span>
            <span className={`text-right text-sm font-medium ${
              entry.percentage >= 90 ? 'text-[#00ff88]' :
              entry.percentage >= 80 ? 'text-[#00d4ff]' :
              entry.percentage >= 70 ? 'text-yellow-400' :
              'text-red-400'
            }`}>{entry.percentage}%</span>
            <span className="text-right text-[#64748b] text-xs">{entry.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
