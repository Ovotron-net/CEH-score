'use client';

import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import ChartDataTable from './ChartDataTable';

export interface VotesByPollDatum {
    question: string;
    visualLabel: string;
    votes: number;
    pollId: string;
}

interface VotesByPollChartProps {
    data: VotesByPollDatum[];
}

export default function VotesByPollChart({data}: VotesByPollChartProps) {
    if (data.length === 0) {
        return <p className="h-72 flex items-center justify-center text-sm text-muted-foreground">No poll vote data yet.</p>;
    }

    const totalVotes = data.reduce((total, poll) => total + poll.votes, 0);

    return (
        <>
            <ChartDataTable
                summary={`${totalVotes} votes across ${data.length} polls.`}
                caption="Votes by poll data"
                columns={['Poll', 'Votes']}
                rows={data.map(({question, votes}) => [question, votes])}
            />
            <div className="h-72 -mx-1" aria-hidden="true">
                <ResponsiveContainer width="100%" height={288}>
                    <BarChart accessibilityLayer={false} data={data} margin={{top: 10, right: 10, left: 0, bottom: 40}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                    <XAxis
                        dataKey="visualLabel"
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
                    <Bar dataKey="votes" fill="hsl(var(--info))" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
