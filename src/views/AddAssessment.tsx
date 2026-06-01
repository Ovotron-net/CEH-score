'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Assessment } from '../types';
import { useAssessments } from '../hooks/useAssessments';
import { CEH_DOMAINS, FULL_EXAM } from '../data/cehDomains';
import { calculatePercentage, isPassed } from '../utils/calculations';
import { CheckCircle, XCircle, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddAssessment() {
  const router = useRouter();
  const { addAssessment } = useAssessments();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
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

  const scoreError = useMemo(() => {
    const m = parseInt(form.maxScore);
    if (!form.maxScore || isNaN(m) || m < 1) return 'Max score must be at least 1';
    if (!form.score) return null;
    const s = parseInt(form.score);
    if (isNaN(s) || s < 0) return 'Score must be a positive number';
    if (s > m) return `Score cannot exceed max score (${m})`;
    return null;
  }, [form.score, form.maxScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.score || !form.maxScore || !form.timeTaken || scoreError) return;

    const assessment: Assessment = {
      id: `assessment-${Date.now()}`,
      date: form.date,
      type: form.type,
      score: parseInt(form.score),
      maxScore: parseInt(form.maxScore),
      percentage,
      timeTaken: parseInt(form.timeTaken),
      domain: form.domain,
      notes: form.notes,
      passed,
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await addAssessment(assessment);
      router.push('/assessments');
    } catch {
      setSubmitError('Failed to save assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const domainOptions = [FULL_EXAM, ...CEH_DOMAINS.map(d => d.name)];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add Assessment</h1>
        <p className="text-muted-foreground text-sm mt-1">Record a new CEH practice or exam result</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.score && !scoreError && (
          <Card className={
            passed ? 'bg-primary/5 border-primary/20' : 'bg-red-500/5 border-red-500/20'
          }>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  {passed ? <CheckCircle className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
                  <span className={`text-xl font-bold ${passed ? 'text-primary' : 'text-destructive'}`}>{percentage}%</span>
                  <span className={`text-sm ${passed ? 'text-primary' : 'text-destructive'}`}>{passed ? 'PASSED' : 'FAILED'}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{score}/{maxScore} correct answers</p>
              </div>
              <div className="text-right">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assessment-date" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input
                id="assessment-date"
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select
                value={form.type}
                onValueChange={value => setForm(p => ({ ...p, type: value as Assessment['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="mock">Mock Exam</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assessment-score" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Score</Label>
              <Input
                id="assessment-score"
                type="number"
                min="0"
                max={maxScore}
                value={form.score}
                onChange={e => setForm(p => ({ ...p, score: e.target.value }))}
                placeholder="e.g. 98"
                required
                className={
                  scoreError ? 'border-destructive focus-visible:ring-destructive' : undefined
                }
              />
              {scoreError && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {scoreError}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="assessment-max-score" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Max Score</Label>
              <Input
                id="assessment-max-score"
                type="number"
                min="1"
                max="200"
                value={form.maxScore}
                onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Domain</Label>
            <Select
              value={form.domain}
              onValueChange={value => setForm(p => ({ ...p, domain: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domainOptions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assessment-time" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Time Taken (minutes)</Label>
            <Input
              id="assessment-time"
              type="number"
              min="1"
              max="300"
              value={form.timeTaken}
              onChange={e => setForm(p => ({ ...p, timeTaken: e.target.value }))}
              placeholder="e.g. 120"
              required
            />
          </div>

          <div>
            <Label htmlFor="assessment-notes" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
            <Textarea
              id="assessment-notes"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="What did you learn? What needs improvement?"
              rows={3}
              className="resize-none"
            />
          </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !!scoreError}
            className="flex-1"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Save Assessment'}
          </Button>
        </div>
        {submitError && (
          <p className="text-center text-sm text-destructive">{submitError}</p>
        )}
      </form>
    </div>
  );
}



