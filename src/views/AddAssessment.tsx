'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Assessment, AssessmentInput} from '../types';
import {useAddAssessment} from '../hooks/useAssessments';
import {CEH_DOMAINS, FULL_EXAM} from '../data/cehDomains';
import {calculatePercentage, isPassed} from '../utils/calculations';
import {AlertCircle, CheckCircle, Save, XCircle} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {formatLocalDateInput} from '../utils/dates';

export default function AddAssessment() {
    const router = useRouter();
    const addMutation = useAddAssessment();

    const [form, setForm] = useState({
        date: formatLocalDateInput(),
        type: 'practice' as Assessment['type'],
        score: '',
        maxScore: '125',
        timeTaken: '',
        domain: FULL_EXAM,
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const score = parseInt(form.score) || 0;
    const maxScore = parseInt(form.maxScore) || 0;
    const percentage = form.score && maxScore > 0 ? calculatePercentage(score, maxScore) : 0;
    const passed = isPassed(percentage);

    const parsedMaxScore = parseInt(form.maxScore);
    const maxScoreError = !form.maxScore || isNaN(parsedMaxScore) || parsedMaxScore < 1
        ? 'Max score must be at least 1'
        : null;
    const parsedScore = parseInt(form.score);
    const scoreError = !form.score
        ? null
        : isNaN(parsedScore) || parsedScore < 0
            ? 'Score must be zero or greater'
            : !maxScoreError && parsedScore > parsedMaxScore
                ? `Score cannot exceed max score (${parsedMaxScore})`
                : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.score || !form.maxScore || !form.timeTaken || scoreError || maxScoreError) return;

        const assessment: AssessmentInput = {
            id: `assessment-${Date.now()}`,
            date: form.date,
            type: form.type,
            score: parseInt(form.score),
            maxScore: parseInt(form.maxScore),
            timeTaken: parseInt(form.timeTaken),
            domain: form.domain,
            notes: form.notes,
        };

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await addMutation.mutateAsync(assessment);
            router.push('/assessments');
        } catch {
            setSubmitError('Failed to save assessment. Please try again.');
            setIsSubmitting(false);
        }
    };

    const domainOptions = [FULL_EXAM, ...CEH_DOMAINS.map(d => d.name)];

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Add Assessment</h1>
                <p className="text-muted-foreground text-sm mt-1">Record a new CEH practice or exam result</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {form.score && !scoreError && (
                    <Card className={
                        passed ? 'bg-primary/5 border-primary/20' : 'bg-red-500/5 border-red-500/20'
                    }>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    {passed ? <CheckCircle className="h-5 w-5 text-primary"/> :
                                        <XCircle className="h-5 w-5 text-destructive"/>}
                                    <span
                                        className={`text-xl font-bold ${passed ? 'text-primary' : 'text-destructive'}`}>{percentage}%</span>
                                    <span
                                        className={`text-sm ${passed ? 'text-primary' : 'text-destructive'}`}>{passed ? 'PASSED' : 'FAILED'}</span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{score}/{maxScore} correct answers</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-xs text-muted-foreground">Pass threshold: 70%</p>
                                {passed ? (
                                    <p className="mt-0.5 text-sm font-medium text-primary">
                                        {score - Math.ceil(0.7 * maxScore)} above passing threshold
                                    </p>
                                ) : (
                                    <p className="mt-0.5 text-sm font-medium text-destructive">
                                        Need {Math.ceil(0.7 * maxScore) - score} more to pass
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Assessment Details</CardTitle>
                        <CardDescription>Fill out the exam result fields below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="assessment-date"
                                       className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
                                <Input
                                    id="assessment-date"
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(p => ({...p, date: e.target.value}))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="assessment-type"
                                     className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={value => setForm(p => ({...p, type: value as Assessment['type']}))}
                                >
                                    <SelectTrigger id="assessment-type" className="min-h-11">
                                        <SelectValue placeholder="Select type"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="practice">Practice</SelectItem>
                                        <SelectItem value="mock">Mock Exam</SelectItem>
                                        <SelectItem value="official">Official</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="assessment-score"
                                       className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Score</Label>
                                <Input
                                    id="assessment-score"
                                    type="number"
                                    min="0"
                                    max={maxScore}
                                    value={form.score}
                                    onChange={e => setForm(p => ({...p, score: e.target.value}))}
                                    placeholder="e.g. 98"
                                     required
                                     aria-invalid={Boolean(scoreError)}
                                     aria-describedby={scoreError ? 'assessment-score-error' : undefined}
                                    className={
                                        scoreError ? 'border-destructive focus-visible:ring-destructive' : undefined
                                    }
                                />
                                {scoreError && (
                                    <p id="assessment-score-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                                        <AlertCircle className="h-3 w-3 flex-shrink-0"/>
                                        {scoreError}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="assessment-max-score"
                                       className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Max
                                    Score</Label>
                                <Input
                                    id="assessment-max-score"
                                    type="number"
                                    min="1"
                                    max="200"
                                     value={form.maxScore}
                                     onChange={e => setForm(p => ({...p, maxScore: e.target.value}))}
                                     aria-invalid={Boolean(maxScoreError)}
                                     aria-describedby={maxScoreError ? 'assessment-max-score-error' : undefined}
                                     className={maxScoreError ? 'border-destructive focus-visible:ring-destructive' : undefined}
                                 />
                                 {maxScoreError && (
                                     <p id="assessment-max-score-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                                         <AlertCircle className="h-3 w-3 flex-shrink-0"/>
                                         {maxScoreError}
                                     </p>
                                 )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="assessment-domain"
                                 className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Domain</Label>
                            <Select
                                value={form.domain}
                                onValueChange={value => setForm(p => ({...p, domain: value}))}
                            >
                                <SelectTrigger id="assessment-domain" className="min-h-11">
                                    <SelectValue placeholder="Select domain"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {domainOptions.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="assessment-time"
                                   className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Time
                                Taken (minutes)</Label>
                            <Input
                                id="assessment-time"
                                type="number"
                                min="1"
                                max="300"
                                value={form.timeTaken}
                                onChange={e => setForm(p => ({...p, timeTaken: e.target.value}))}
                                placeholder="e.g. 120"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="assessment-notes"
                                   className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Notes
                                (optional)</Label>
                            <Textarea
                                id="assessment-notes"
                                value={form.notes}
                                onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                                placeholder="What did you learn? What needs improvement?"
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                        type="button"
                        onClick={() => router.back()}
                        variant="outline"
                        className="min-h-11 flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || addMutation.isPending || !!scoreError || !!maxScoreError}
                        className="min-h-11 flex-1"
                    >
                        <Save className="h-4 w-4"/>
                        {isSubmitting || addMutation.isPending ? 'Saving...' : 'Save Assessment'}
                    </Button>
                </div>
                {submitError && (
                    <p role="alert" className="text-center text-sm text-destructive">{submitError}</p>
                )}
                {(isSubmitting || addMutation.isPending) && (
                    <p role="status" className="sr-only">Saving assessment</p>
                )}
            </form>
        </div>
    );
}



