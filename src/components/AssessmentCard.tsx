<<<<<<< Updated upstream
import {memo, useState} from 'react';
import type {Assessment} from '@/types';
import {CheckCircle, Clock, Target, Trash2, XCircle} from 'lucide-react';
import {format} from 'date-fns';
=======
<<<<<<< HEAD

import { memo, useState } from 'react';
import type { Assessment } from '@/types';
import { Trash2, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
>>>>>>> Stashed changes

interface AssessmentCardProps {
    assessment: Assessment;
    onDelete?: (id: string) => void;
}

const typeColors = {
    practice: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    mock: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    official: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const AssessmentCard = memo(function AssessmentCard({assessment, onDelete}: AssessmentCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const scoreColor = assessment.percentage >= 85
        ? 'text-primary'
        : assessment.percentage >= 70
            ? 'text-accent'
            : assessment.percentage >= 60
                ? 'text-yellow-400'
                : 'text-red-400';

    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDelete?.(assessment.id);
        } else {
            setConfirmDelete(true);
        }
    };

    return (
        <div
            className="bg-card border border-border rounded-xl p-5 hover:bg-secondary transition-all duration-200 card-enter">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${scoreColor}`}>
                        {assessment.percentage}%
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {assessment.passed
                                ? <CheckCircle className="w-4 h-4 text-primary"/>
                                : <XCircle className="w-4 h-4 text-red-400"/>
                            }
                            <span
                                className={`text-xs font-medium ${assessment.passed ? 'text-primary' : 'text-red-400'}`}>
                {assessment.passed ? 'PASSED' : 'FAILED'}
              </span>
                        </div>
                        <p className="text-muted-foreground text-xs">{assessment.score}/{assessment.maxScore} correct</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded border ${typeColors[assessment.type]} capitalize`}>
            {assessment.type}
          </span>
                    {onDelete && (
                        confirmDelete ? (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleDeleteClick}
                                    className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded transition-all"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-xs px-2 py-1 bg-border/50 hover:bg-border border border-border text-muted-foreground rounded transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDeleteClick}
                                className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                                aria-label="Delete assessment"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{format(new Date(assessment.date), 'MMM d, yyyy')}</span>
                <span className="flex items-center gap-1">
          <Clock className="w-3 h-3"/>{assessment.timeTaken}m
        </span>
                <span className="flex items-center gap-1">
          <Target
              className="w-3 h-3"/>{assessment.domain.length > 20 ? assessment.domain.substring(0, 20) + '...' : assessment.domain}
        </span>
            </div>

            {assessment.notes && (
                <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3 line-clamp-2">
                    {assessment.notes}
                </p>
            )}

            {/* Score bar */}
            <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${assessment.percentage}%`,
                        background: assessment.percentage >= 70
                            ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                            : 'linear-gradient(90deg, #ff4444, #ff8800)',
                    }}
                />
            </div>
        </div>
<<<<<<< Updated upstream
    );
=======
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{format(new Date(assessment.date), 'MMM d, yyyy')}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />{assessment.timeTaken}m
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />{assessment.domain.length > 20 ? assessment.domain.substring(0, 20) + '...' : assessment.domain}
        </span>
      </div>

      {assessment.notes && (
        <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3 line-clamp-2">
          {assessment.notes}
        </p>
      )}

      {/* Score bar */}
      <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${assessment.percentage}%`,
            background: assessment.percentage >= 70
              ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
              : 'linear-gradient(90deg, #ff4444, #ff8800)',
          }}
        />
      </div>
    </div>
  );
=======
import {memo, useState} from 'react';
import type {Assessment} from '@/types';
import {CheckCircle, Clock, Target, Trash2, XCircle} from 'lucide-react';
import {format} from 'date-fns';

interface AssessmentCardProps {
    assessment: Assessment;
    onDelete?: (id: string) => void;
}

const typeColors = {
    practice: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    mock: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    official: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const AssessmentCard = memo(function AssessmentCard({assessment, onDelete}: AssessmentCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const scoreColor = assessment.percentage >= 85
        ? 'text-primary'
        : assessment.percentage >= 70
            ? 'text-accent'
            : assessment.percentage >= 60
                ? 'text-yellow-400'
                : 'text-red-400';

    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDelete?.(assessment.id);
        } else {
            setConfirmDelete(true);
        }
    };

    return (
        <div
            className="bg-card border border-border rounded-xl p-5 hover:bg-secondary transition-all duration-200 card-enter">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${scoreColor}`}>
                        {assessment.percentage}%
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {assessment.passed
                                ? <CheckCircle className="w-4 h-4 text-primary"/>
                                : <XCircle className="w-4 h-4 text-red-400"/>
                            }
                            <span
                                className={`text-xs font-medium ${assessment.passed ? 'text-primary' : 'text-red-400'}`}>
                {assessment.passed ? 'PASSED' : 'FAILED'}
              </span>
                        </div>
                        <p className="text-muted-foreground text-xs">{assessment.score}/{assessment.maxScore} correct</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded border ${typeColors[assessment.type]} capitalize`}>
            {assessment.type}
          </span>
                    {onDelete && (
                        confirmDelete ? (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleDeleteClick}
                                    className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded transition-all"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-xs px-2 py-1 bg-border/50 hover:bg-border border border-border text-muted-foreground rounded transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDeleteClick}
                                className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                                aria-label="Delete assessment"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{format(new Date(assessment.date), 'MMM d, yyyy')}</span>
                <span className="flex items-center gap-1">
          <Clock className="w-3 h-3"/>{assessment.timeTaken}m
        </span>
                <span className="flex items-center gap-1">
          <Target
              className="w-3 h-3"/>{assessment.domain.length > 20 ? assessment.domain.substring(0, 20) + '...' : assessment.domain}
        </span>
            </div>

            {assessment.notes && (
                <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3 line-clamp-2">
                    {assessment.notes}
                </p>
            )}

            {/* Score bar */}
            <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${assessment.percentage}%`,
                        background: assessment.percentage >= 70
                            ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                            : 'linear-gradient(90deg, #ff4444, #ff8800)',
                    }}
                />
            </div>
        </div>
    );
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
});

export default AssessmentCard;