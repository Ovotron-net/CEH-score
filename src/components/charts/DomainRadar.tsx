import {useMemo} from 'react';
import {PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip} from 'recharts';
import type {Assessment} from '@/types';
import {CEH_DOMAINS} from '@/data/cehDomains';
import {buildDomainStats} from '@/utils/domainStats';
import ChartDataTable from './ChartDataTable';

interface DomainRadarProps {
    assessments: Assessment[];
}

export default function DomainRadar({assessments}: DomainRadarProps) {
    const domainData = useMemo(() => {
        const stats = buildDomainStats(assessments);
        return CEH_DOMAINS.slice(0, 8).flatMap(domain => {
            const measured = stats.get(domain.name);
            return measured ? [{
                domain: domain.name,
                chartLabel: domain.name.split(' ').slice(0, 2).join(' '),
                score: Math.round(measured.average),
            }] : [];
        });
    }, [assessments]);

    if (domainData.length === 0) {
        return <p className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No domain assessment data yet.</p>;
    }

    return (
        <>
            <ChartDataTable
                summary={`Scores are available for ${domainData.length} measured domains.`}
                caption="Domain radar data"
                columns={['Domain', 'Score']}
                rows={domainData.map(({domain, score}) => [domain, `${score}%`])}
            />
            <div aria-hidden="true">
                <ResponsiveContainer width="100%" height={280}>
                    <RadarChart accessibilityLayer={false} data={domainData} margin={{top: 10, right: 30, bottom: 10, left: 30}}>
                        <PolarGrid stroke="hsl(var(--border))"/>
                        <PolarAngleAxis dataKey="chartLabel" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}/>
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.15}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                            labelStyle={{color: 'hsl(var(--foreground))', fontSize: 11}}
                            itemStyle={{color: 'hsl(var(--primary))', fontSize: 11}}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
