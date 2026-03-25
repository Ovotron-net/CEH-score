
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Assessment } from '../../types';

interface PassFailProps {
  assessments: Assessment[];
}

interface PassFailTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function PassFailTooltip({ active, payload }: PassFailTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-[#1f2d40] rounded-lg p-3 text-xs">
        <p style={{ color: payload[0].payload.fill }}>{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export default function PassFail({ assessments }: PassFailProps) {
  const passed = assessments.filter(a => a.passed).length;
  const failed = assessments.length - passed;

  const data = [
    { name: 'Passed', value: passed },
    { name: 'Failed', value: failed },
  ];

  const COLORS = ['#00ff88', '#ff4444'];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip content={<PassFailTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
