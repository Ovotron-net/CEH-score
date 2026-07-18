import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import type {Assessment} from '@/types';
import ChartDataTable from './ChartDataTable';

interface PassFailProps {
    assessments: Assessment[];
}

interface PassFailTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function PassFailTooltip({active, payload}: PassFailTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 text-xs">
                <p style={{color: payload[0].payload.fill}}>{payload[0].name}: {payload[0].value}</p>
            </div>
        );
    }
    return null;
}

export default function PassFail({assessments}: PassFailProps) {
    let passed = 0;
    for (const assessment of assessments) {
        if (assessment.passed) passed += 1;
    }
    const failed = assessments.length - passed;

    const data = [
        {name: 'Passed', value: passed},
        {name: 'Failed', value: failed},
    ];

    const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))'];

    if (assessments.length === 0) {
        return <p className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No pass or fail data yet.</p>;
    }

    return (
        <>
            <ChartDataTable
                summary={`${assessments.length} assessments: ${passed} passed and ${failed} failed.`}
                caption="Pass and fail data"
                columns={['Result', 'Assessments']}
                rows={data.map(({name, value}) => [name, value])}
            />
            <div aria-hidden="true">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart accessibilityLayer={false}>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]}/>
                    ))}
                </Pie>
                <Tooltip content={<PassFailTooltip/>}/>
                <Legend
                    formatter={(value) => <span
                        style={{color: 'hsl(var(--muted-foreground))', fontSize: '12px'}}>{value}</span>}
                />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
