'use client';

<<<<<<< Updated upstream
import {useMemo} from 'react';
import {useAssessments} from '../hooks/useAssessments';
import {PassFail, ScoreDistribution, ScoreTrend, DomainRadar, DomainBarChart} from '../components/charts/lazy';
import {getAverageScore, getBestScore, getPassRate} from '../utils/calculations';
import {CEH_DOMAINS} from '../data/cehDomains';
=======
<<<<<<< HEAD
import { useMemo } from 'react';
import { useAssessments } from '../hooks/useAssessments';
import ScoreTrend from '../components/charts/ScoreTrend';
import PassFail from '../components/charts/PassFail';
import ScoreDistribution from '../components/charts/ScoreDistribution';
import DomainRadar from '../components/charts/DomainRadar';
import { getAverageScore, getBestScore, getPassRate } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CEH_DOMAINS } from '../data/cehDomains';
>>>>>>> Stashed changes

export default function Analytics() {
    const {assessments, isLoading, isError} = useAssessments();

    const avgScore = useMemo(() => getAverageScore(assessments), [assessments]);
    const bestScore = useMemo(() => getBestScore(assessments), [assessments]);
    const passRate = useMemo(() => getPassRate(assessments), [assessments]);

    const domainBarData = useMemo(() => {
        const byDomain = new Map<string, number[]>();
        const fullExamScores: number[] = [];

        for (const a of assessments) {
            if (a.domain === 'Full Exam') {
                fullExamScores.push(a.percentage);
            } else {
                const scores = byDomain.get(a.domain) ?? [];
                scores.push(a.percentage);
                byDomain.set(a.domain, scores);
            }
        }

        const fullExamAvg = fullExamScores.length > 0
            ? fullExamScores.reduce((s, p) => s + p, 0) / fullExamScores.length
            : avgScore;

        return CEH_DOMAINS.slice(0, 10).map((d) => {
            const domainScores = byDomain.get(d.name);
            return {
                name: d.name.split(' ').slice(-1)[0],
                score: domainScores && domainScores.length > 0
                    ? Math.round(domainScores.reduce((s, p) => s + p, 0) / domainScores.length)
                    : Math.round(fullExamAvg),
            };
        });
    }, [assessments, avgScore]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"/>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto page-enter">
            {isError ? (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    Failed to load assessments — your data may be unavailable. Check your connection.
                </div>
            ) : null}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Detailed performance analysis</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    {label: 'Average Score', value: `${avgScore}%`, color: 'text-primary'},
                    {label: 'Best Score', value: `${bestScore}%`, color: 'text-yellow-400'},
                    {label: 'Pass Rate', value: `${passRate}%`, color: 'text-accent'},
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center card-enter">
                        <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Score Over Time</h2>
                    <ScoreTrend assessments={assessments} limit={20}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Pass / Fail Ratio</h2>
                    <PassFail assessments={assessments}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Score Distribution</h2>
                    <ScoreDistribution assessments={assessments}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Domain Performance</h2>
                    <DomainBarChart data={domainBarData}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Improvement Trend</h2>
                    <ScoreTrend assessments={assessments} limit={assessments.length}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Domain Radar</h2>
                    <DomainRadar assessments={assessments}/>
                </div>
            </div>
        </div>
<<<<<<< Updated upstream
    );
}
=======
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Detailed performance analysis</p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Average Score', value: `${avgScore}%`, color: 'text-primary' },
          { label: 'Best Score', value: `${bestScore}%`, color: 'text-yellow-400' },
          { label: 'Pass Rate', value: `${passRate}%`, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center card-enter">
            <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Score Over Time</h2>
          <ScoreTrend assessments={assessments} limit={20} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Pass / Fail Ratio</h2>
          <PassFail assessments={assessments} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Score Distribution</h2>
          <ScoreDistribution assessments={assessments} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Domain Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={domainBarData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Improvement Trend</h2>
          <ScoreTrend assessments={assessments} limit={assessments.length} />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Domain Radar</h2>
          <DomainRadar assessments={assessments} />
        </div>
      </div>
    </div>
  );
}



=======
import {useMemo} from 'react';
import {useAssessments} from '../hooks/useAssessments';
import {PassFail, ScoreDistribution, ScoreTrend, DomainRadar, DomainBarChart} from '../components/charts/lazy';
import {getAverageScore, getBestScore, getPassRate} from '../utils/calculations';
import {CEH_DOMAINS} from '../data/cehDomains';

export default function Analytics() {
    const {assessments, isLoading, isError} = useAssessments();

    const avgScore = useMemo(() => getAverageScore(assessments), [assessments]);
    const bestScore = useMemo(() => getBestScore(assessments), [assessments]);
    const passRate = useMemo(() => getPassRate(assessments), [assessments]);

    const domainBarData = useMemo(() => {
        const byDomain = new Map<string, number[]>();
        const fullExamScores: number[] = [];

        for (const a of assessments) {
            if (a.domain === 'Full Exam') {
                fullExamScores.push(a.percentage);
            } else {
                const scores = byDomain.get(a.domain) ?? [];
                scores.push(a.percentage);
                byDomain.set(a.domain, scores);
            }
        }

        const fullExamAvg = fullExamScores.length > 0
            ? fullExamScores.reduce((s, p) => s + p, 0) / fullExamScores.length
            : avgScore;

        return CEH_DOMAINS.slice(0, 10).map((d) => {
            const domainScores = byDomain.get(d.name);
            return {
                name: d.name.split(' ').slice(-1)[0],
                score: domainScores && domainScores.length > 0
                    ? Math.round(domainScores.reduce((s, p) => s + p, 0) / domainScores.length)
                    : Math.round(fullExamAvg),
            };
        });
    }, [assessments, avgScore]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"/>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto page-enter">
            {isError ? (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    Failed to load assessments — your data may be unavailable. Check your connection.
                </div>
            ) : null}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Detailed performance analysis</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    {label: 'Average Score', value: `${avgScore}%`, color: 'text-primary'},
                    {label: 'Best Score', value: `${bestScore}%`, color: 'text-yellow-400'},
                    {label: 'Pass Rate', value: `${passRate}%`, color: 'text-accent'},
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center card-enter">
                        <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Score Over Time</h2>
                    <ScoreTrend assessments={assessments} limit={20}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Pass / Fail Ratio</h2>
                    <PassFail assessments={assessments}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Score Distribution</h2>
                    <ScoreDistribution assessments={assessments}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Domain Performance</h2>
                    <DomainBarChart data={domainBarData}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Improvement Trend</h2>
                    <ScoreTrend assessments={assessments} limit={assessments.length}/>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Domain Radar</h2>
                    <DomainRadar assessments={assessments}/>
                </div>
            </div>
        </div>
    );
}
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
