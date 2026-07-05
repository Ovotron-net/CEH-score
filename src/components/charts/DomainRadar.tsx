import {useMemo} from 'react';
import {PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip} from 'recharts';
import type {Assessment} from '@/types';
import {CEH_DOMAINS} from '@/data/cehDomains';

interface DomainRadarProps {
    assessments: Assessment[];
}

export default function DomainRadar({assessments}: DomainRadarProps) {
    const domainData = useMemo(() => {
        const fullExamAvg = (() => {
            const fullExam = assessments.filter(a => a.domain === 'Full Exam');
            return fullExam.length > 0
                ? fullExam.reduce((sum, a) => sum + a.percentage, 0) / fullExam.length
                : 75;
        })();

        return CEH_DOMAINS.slice(0, 8).map(domain => {
            const domainAssessments = assessments.filter(a => a.domain === domain.name);
            const avg = domainAssessments.length > 0
                ? domainAssessments.reduce((sum, a) => sum + a.percentage, 0) / domainAssessments.length
                : 0;
            return {
                domain: domain.name.split(' ').slice(0, 2).join(' '),
                score: domainAssessments.length > 0 ? Math.round(avg) : Math.round(fullExamAvg),
            };
        });
    }, [assessments]);

    return (
        <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={domainData} margin={{top: 10, right: 30, bottom: 10, left: 30}}>
                <PolarGrid stroke="hsl(var(--border))"/>
                <PolarAngleAxis dataKey="domain" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}/>
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
    );
}