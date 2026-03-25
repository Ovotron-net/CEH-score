
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Assessment } from '../../types';

interface ScoreDistributionProps {
  assessments: Assessment[];
}

interface BinData {
  range: string;
  min: number;
  max: number;
  count: number;
}

export default function ScoreDistribution({ assessments }: ScoreDistributionProps) {
  const bins: BinData[] = [
    { range: '0-50%', min: 0, max: 50, count: 0 },
    { range: '50-60%', min: 50, max: 60, count: 0 },
    { range: '60-70%', min: 60, max: 70, count: 0 },
    { range: '70-80%', min: 70, max: 80, count: 0 },
    { range: '80-90%', min: 80, max: 90, count: 0 },
    { range: '90-100%', min: 90, max: 101, count: 0 },
  ];

  assessments.forEach(a => {
    const bin = bins.find(b => a.percentage >= b.min && a.percentage < b.max);
    if (bin) bin.count++;
  });

  const getColor = (range: string) => {
    if (range.startsWith('9')) return '#00ff88';
    if (range.startsWith('8')) return '#00d4ff';
    if (range.startsWith('7')) return '#ffd700';
    if (range.startsWith('6')) return '#ff8800';
    return '#ff4444';
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={bins} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d40" />
        <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #1f2d40', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0', fontSize: 11 }}
          itemStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {bins.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
