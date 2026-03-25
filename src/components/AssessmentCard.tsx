
import type { Assessment } from '../types';
import { Trash2, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AssessmentCardProps {
  assessment: Assessment;
  onDelete?: (id: string) => void;
}

const typeColors = {
  practice: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mock: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  official: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function AssessmentCard({ assessment, onDelete }: AssessmentCardProps) {
  const scoreColor = assessment.percentage >= 85
    ? 'text-[#00ff88]'
    : assessment.percentage >= 70
    ? 'text-[#00d4ff]'
    : assessment.percentage >= 60
    ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-5 hover:bg-[#1a2235] transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {assessment.percentage}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              {assessment.passed
                ? <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                : <XCircle className="w-4 h-4 text-red-400" />
              }
              <span className={`text-xs font-medium ${assessment.passed ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {assessment.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            <p className="text-[#64748b] text-xs">{assessment.score}/{assessment.maxScore} correct</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded border ${typeColors[assessment.type]} capitalize`}>
            {assessment.type}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(assessment.id)}
              className="opacity-0 group-hover:opacity-100 text-[#64748b] hover:text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#64748b]">
        <span>{format(new Date(assessment.date), 'MMM d, yyyy')}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />{assessment.timeTaken}m
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />{assessment.domain.length > 20 ? assessment.domain.substring(0, 20) + '...' : assessment.domain}
        </span>
      </div>

      {assessment.notes && (
        <p className="mt-3 text-xs text-[#64748b] border-t border-[#1f2d40] pt-3 line-clamp-2">
          {assessment.notes}
        </p>
      )}

      {/* Score bar */}
      <div className="mt-3 h-1.5 bg-[#1f2d40] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${assessment.percentage}%`,
            background: assessment.percentage >= 70
              ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
              : 'linear-gradient(90deg, #ff4444, #ff8800)',
          }}
        />
      </div>
    </div>
  );
}
