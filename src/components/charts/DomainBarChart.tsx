'use client';

import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export interface DomainBarDatum {
    name: string;
    score: number;
}

interface DomainBarChartProps {
    data: DomainBarDatum[];
}

export default function DomainBarChart({data}: DomainBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false}/>
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                />
                <Tooltip
                    contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                    }}
                    labelStyle={{color: 'hsl(var(--foreground))'}}
                    itemStyle={{color: 'hsl(var(--primary))'}}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} fillOpacity={0.8}/>
            </BarChart>
        </ResponsiveContainer>
    );
}