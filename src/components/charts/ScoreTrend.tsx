
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Assessment } from '../../types';
import { format } from 'date-fns';

interface ScoreTrendProps {
  assessments: Assessment[];
  limit?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function ScoreTrendTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#111827] border border-[#1f2d40] rounded-lg p-3 text-xs">
        <p className="text-[#64748b] mb-1">{label}</p>
        <p className={`font-bold text-sm ${val >= 70 ? 'text-[#00ff88]' : 'text-red-400'}`}>{val}%</p>
      </div>
    );
  }
  return null;
}

export default function ScoreTrend({ assessments, limit = 10 }: ScoreTrendProps) {
  const data = [...assessments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-limit)
    .map(a => ({
      date: format(new Date(a.date), 'MMM d'),
      score: a.percentage,
      passed: a.passed,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d40" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ScoreTrendTooltip />} />
        <ReferenceLine y={70} stroke="#ffd700" strokeDasharray="4 4" strokeWidth={1.5} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#00ff88"
          strokeWidth={2.5}
          dot={{ fill: '#00ff88', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#00d4ff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
