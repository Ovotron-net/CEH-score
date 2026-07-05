'use client';

import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export interface VotesByPollDatum {
    name: string;
    votes: number;
    pollId: string;
}

interface VotesByPollChartProps {
    data: VotesByPollDatum[];
}

export default function VotesByPollChart({data}: VotesByPollChartProps) {
    return (
        <div className="h-72 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{top: 10, right: 10, left: 0, bottom: 40}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                    <XAxis
                        dataKey="name"
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}/>
                    <Tooltip
                        contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 8,
                        }}
                        labelStyle={{color: 'hsl(var(--foreground))'}}
                    />
                    <Bar dataKey="votes" fill="#00d4ff" radius={[4, 4, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}