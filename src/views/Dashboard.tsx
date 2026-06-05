'use client';

import Link from 'next/link';
import { Activity, BookOpen, Clock, Shield, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import { calculateStats, formatScore } from '../utils/calculations';
import StatCard from '../components/StatCard';
import ScoreTrend from '../components/charts/ScoreTrend';
import DomainRadar from '../components/charts/DomainRadar';

export default function Dashboard() {
  const { assessments, isLoading } = useAssessments();
  const stats = calculateStats(assessments);
  const recentAssessments = assessments.slice(-5).reverse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 page-enter">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-cyber-green/10 border border-cyber-green/20">
            <Shield className="w-6 h-6 text-cyber-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-cyber-muted mt-1">Track your CEH exam preparation progress</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Current Average" value={formatScore(stats.averageScore)} icon={Target} color="green" />
        <StatCard title="Best Score" value={formatScore(stats.bestScore)} icon={Trophy} color="yellow" />
        <StatCard title="Total Assessments" value={stats.totalAssessments.toString()} icon={Activity} color="blue" />
        <StatCard title="Study Streak" value={`${stats.studyStreak} days`} icon={Zap} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <ScoreTrend assessments={assessments} limit={10} />
        </div>
        <div>
          <DomainRadar assessments={assessments} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 cyber-glow card-enter">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyber-blue" />
              Recent Assessments
            </h2>
            <Link href="/assessments" className="text-cyber-green hover:text-cyber-green/80 text-sm font-medium transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentAssessments.length === 0 ? (
              <div className="text-center py-8 text-cyber-muted">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No assessments yet</p>
                <Link href="/add" className="text-cyber-green hover:text-cyber-green/80 text-sm mt-2 inline-block transition-colors">
                  Add your first assessment
                </Link>
              </div>
            ) : (
              recentAssessments.map((assessment) => (
                <div key={assessment.id} className="bg-cyber-card/50 rounded-lg p-4 border border-cyber-border/50 hover:border-cyber-green/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white capitalize">{assessment.type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${assessment.percentage >= 70 ? 'bg-cyber-green/10 text-cyber-green' : 'bg-cyber-red/10 text-cyber-red'}`}>
                      {assessment.percentage}%
                    </span>
                  </div>
                  <div className="text-sm text-cyber-muted mb-1">{assessment.domain}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{assessment.score}/{assessment.maxScore}</span>
                    <span className="text-cyber-muted">{new Date(assessment.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 cyber-glow-blue card-enter">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyber-blue" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/add" className="w-full flex items-center justify-between p-4 bg-cyber-green/10 hover:bg-cyber-green/15 border border-cyber-green/20 hover:border-cyber-green/30 rounded-lg transition-all group">
              <div>
                <div className="font-medium text-cyber-green">Add Assessment</div>
                <div className="text-sm text-cyber-muted mt-1">Record a new practice test</div>
              </div>
              <Target className="w-5 h-5 text-cyber-green group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/analytics" className="w-full flex items-center justify-between p-4 bg-cyber-blue/10 hover:bg-cyber-blue/15 border border-cyber-blue/20 hover:border-cyber-blue/30 rounded-lg transition-all group">
              <div>
                <div className="font-medium text-cyber-blue">View Analytics</div>
                <div className="text-sm text-cyber-muted mt-1">Analyze your performance trends</div>
              </div>
              <TrendingUp className="w-5 h-5 text-cyber-blue group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/topics" className="w-full flex items-center justify-between p-4 bg-cyber-purple/10 hover:bg-cyber-purple/15 border border-cyber-purple/20 hover:border-cyber-purple/30 rounded-lg transition-all group">
              <div>
                <div className="font-medium text-cyber-purple">Study Topics</div>
                <div className="text-sm text-cyber-muted mt-1">Review CEH domains and weak areas</div>
              </div>
              <BookOpen className="w-5 h-5 text-cyber-purple group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



