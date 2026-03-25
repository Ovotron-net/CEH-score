
import { Link } from 'react-router-dom';
import { Activity, Target, Award, Calendar, PlusCircle, CheckCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import ScoreTrend from '../components/charts/ScoreTrend';
import DomainRadar from '../components/charts/DomainRadar';
import AssessmentCard from '../components/AssessmentCard';
import { useAssessments } from '../hooks/useAssessments';
import { useSettings } from '../hooks/useSettings';
import { getAverageScore, getBestScore, getDaysToExam, getReadinessLevel, getPassRate } from '../utils/calculations';

export default function Dashboard() {
  const { assessments, deleteAssessment } = useAssessments();
  const { settings } = useSettings();

  const avgScore = getAverageScore(assessments);
  const bestScore = getBestScore(assessments);
  const daysToExam = getDaysToExam(settings.examDate);
  const passRate = getPassRate(assessments);
  const readiness = getReadinessLevel(avgScore);
  const recent = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Readiness ring calculation
  const readinessPercent = Math.min(100, Math.round((avgScore / settings.targetScore) * 100));
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-[#00ff88]">{settings.name}</span>
          </h1>
          <p className="text-[#64748b] text-sm mt-1">CEH Exam Score Dashboard</p>
        </div>
        <Link
          to="/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm font-medium transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          New Assessment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Assessments" value={assessments.length} subtitle={`${passRate}% pass rate`} icon={Activity} color="blue" />
        <StatCard title="Average Score" value={`${avgScore}%`} subtitle={`Target: ${settings.targetScore}%`} icon={Target} color="green" />
        <StatCard title="Best Score" value={`${bestScore}%`} subtitle="Personal best" icon={Award} color="yellow" />
        <StatCard
          title="Days to Exam"
          value={settings.examDate ? daysToExam : '—'}
          subtitle={settings.examDate ? 'Keep going!' : 'Set exam date'}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Readiness gauge */}
        <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-6 flex flex-col items-center justify-center">
          <h2 className="text-white font-semibold mb-4 self-start">Exam Readiness</h2>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2d40" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={readinessPercent >= 100 ? '#00ff88' : readinessPercent >= 80 ? '#00d4ff' : '#ffd700'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{readinessPercent}%</span>
              <span className="text-xs text-[#64748b]">Ready</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[#00ff88] font-semibold">{readiness}</p>
            <p className="text-[#64748b] text-xs mt-1">Avg: {avgScore}% / Target: {settings.targetScore}%</p>
          </div>
          <div className="mt-4 w-full space-y-2 text-xs">
            <div className="flex justify-between text-[#64748b]">
              <span>Pass Rate</span>
              <span className={passRate >= 70 ? 'text-[#00ff88]' : 'text-red-400'}>{passRate}%</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>Assessments</span>
              <span className="text-white">{assessments.length}</span>
            </div>
          </div>
        </div>

        {/* Score Trend */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2d40] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Score Trend</h2>
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
              Score
              <div className="w-6 border-t-2 border-dashed border-yellow-400 ml-2"></div>
              Pass Line (70%)
            </div>
          </div>
          <ScoreTrend assessments={assessments} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Radar */}
        <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Domain Coverage</h2>
          <DomainRadar assessments={assessments} />
        </div>

        {/* Recent Assessments */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2d40] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Assessments</h2>
            <Link to="/assessments" className="text-[#00d4ff] text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <div className="text-center py-8 text-[#64748b]">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No assessments yet</p>
                <Link to="/add" className="text-[#00ff88] text-sm hover:underline mt-2 block">Add your first assessment</Link>
              </div>
            ) : (
              recent.map(a => <AssessmentCard key={a.id} assessment={a} onDelete={deleteAssessment} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
