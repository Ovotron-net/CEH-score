
import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { Assessment } from '../../types';
import { CEH_DOMAINS } from '../../data/cehDomains';

interface DomainRadarProps {
  assessments: Assessment[];
}

export default function DomainRadar({ assessments }: DomainRadarProps) {
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
      <RadarChart data={domainData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#1f2d40" />
        <PolarAngleAxis dataKey="domain" tick={{ fill: '#64748b', fontSize: 10 }} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#00ff88"
          fill="#00ff88"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #1f2d40', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0', fontSize: 11 }}
          itemStyle={{ color: '#00ff88', fontSize: 11 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
