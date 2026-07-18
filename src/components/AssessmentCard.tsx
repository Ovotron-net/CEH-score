import {memo, useState} from 'react';
import type {Assessment} from '@/types';
import {CheckCircle, Clock, Target, Trash2, XCircle} from 'lucide-react';
import {format} from 'date-fns';
import {parseLocalDate} from '@/utils/dates';

interface AssessmentCardProps {
    assessment: Assessment;
    onDelete?: (id: string) => void;
}

const typeColors = {
    practice: 'bg-info/10 text-info border-info/20',
    mock: 'bg-secondary text-foreground border-border',
    official: 'bg-warning/10 text-warning border-warning/20',
};

const AssessmentCard = memo(function AssessmentCard({assessment, onDelete}: AssessmentCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const scoreColor = assessment.percentage >= 85
        ? 'text-success'
        : assessment.percentage >= 70
            ? 'text-info'
            : assessment.percentage >= 60
                ? 'text-warning'
                : 'text-destructive';

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
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${scoreColor}`}>
                        {assessment.percentage}%
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {assessment.passed
                                ? <CheckCircle className="w-4 h-4 text-success"/>
                                : <XCircle className="w-4 h-4 text-destructive"/>
                            }
                            <span
                                className={`text-xs font-medium ${assessment.passed ? 'text-success' : 'text-destructive'}`}>
                {assessment.passed ? 'PASSED' : 'FAILED'}
              </span>
                        </div>
                        <p className="text-muted-foreground text-xs">{assessment.score}/{assessment.maxScore} correct</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded border ${typeColors[assessment.type]} capitalize`}>
            {assessment.type}
          </span>
                    {onDelete && (
                        confirmDelete ? (
                            <div className="flex flex-wrap items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="min-h-11 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    className="min-h-11 rounded border border-border bg-secondary px-3 py-2 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                aria-label="Delete assessment"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>{format(parseLocalDate(assessment.date), 'MMM d, yyyy')}</span>
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
                            ? 'linear-gradient(90deg, hsl(var(--success)), hsl(var(--info)))'
                            : 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--warning)))',
                    }}
                />
            </div>
        </div>
    );
});

export default AssessmentCard;
