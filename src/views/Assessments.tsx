'use client';

import {useDeferredValue, useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import {Calendar, ClipboardList, Clock, Filter, Plus, Search, Trash2} from 'lucide-react';
import {useAssessmentQuery, useDeleteAssessment} from '../hooks/useAssessments';
import {formatScore} from '../utils/calculations';
import {formatLocalDateDisplay} from '../utils/dates';
import type {Assessment} from '../types';

export default function Assessments() {
    const {data: assessments = [], isLoading, isError, refetch} = useAssessmentQuery();
    const deleteMutation = useDeleteAssessment();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<Assessment['type'] | 'all'>('all');
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [deleteErrorId, setDeleteErrorId] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const deleteTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
    const deleteStatusRef = useRef<HTMLParagraphElement>(null);
    const restoreDeleteFocusIdRef = useRef<string | null>(null);
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

    useEffect(() => {
        if (confirmingId) {
            confirmButtonRef.current?.focus();
        } else if (restoreDeleteFocusIdRef.current) {
            const id = restoreDeleteFocusIdRef.current;
            restoreDeleteFocusIdRef.current = null;
            deleteTriggerRefs.current.get(id)?.focus();
        }
    }, [confirmingId]);

    useEffect(() => {
        if (deleteSuccess) deleteStatusRef.current?.focus();
    }, [deleteSuccess]);

    const closeConfirmationAndRestoreFocus = () => {
        restoreDeleteFocusIdRef.current = confirmingId;
        setConfirmingId(null);
    };

    const filteredAssessments = useMemo(() => {
        return assessments.filter((assessment) => {
            const matchesSearch =
                assessment.domain.toLowerCase().includes(normalizedSearch) ||
                assessment.notes.toLowerCase().includes(normalizedSearch);
            const matchesType = selectedType === 'all' || assessment.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [assessments, normalizedSearch, selectedType]);

    if (isLoading) {
        return (
            <div role="status" aria-label="Loading assessments" className="min-h-64 flex items-center justify-center">
                <div className="spinner" aria-hidden="true"/>
                <span className="sr-only">Loading assessments</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 page-enter">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Assessments</h1>
                    <p className="text-muted-foreground">Manage and review your CEH practice assessments</p>
                </div>
                <Link href="/add"
                      className="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 cyber-glow">
                    <Plus className="w-4 h-4"/>
                    Add Assessment
                </Link>
            </div>

            <div className="glass-card rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <input
                            type="search"
                            placeholder="Search by domain or notes..."
                            aria-label="Search assessments by domain or notes"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full min-h-11 pl-10 pr-4 py-3 bg-background/50 border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="assessment-type-filter" className="sr-only">
                            Filter assessments by type
                        </label>
                        <Filter
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <select
                            id="assessment-type-filter"
                            title="Filter assessments by type"
                            aria-label="Filter assessments by type"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as Assessment['type'] | 'all')}
                            className="min-h-11 w-full md:w-auto pl-10 pr-8 py-3 bg-background/50 border border-input rounded-lg text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-colors appearance-none min-w-[140px]"
                        >
                            <option value="all">All Types</option>
                            <option value="practice">Practice</option>
                            <option value="official">Official</option>
                            <option value="mock">Mock</option>
                        </select>
                    </div>
                </div>
            </div>

            {deleteSuccess ? (
                <p
                    ref={deleteStatusRef}
                    role="status"
                    aria-live="polite"
                    tabIndex={-1}
                    className="mb-4 text-sm text-success"
                >
                    {deleteSuccess}
                </p>
            ) : null}

            <div className="space-y-4">
                {isError ? (
                    <div role="alert" className="glass-card rounded-xl border-destructive/30 p-6 text-destructive">
                        <h2 className="font-semibold">Unable to load assessments</h2>
                        <p className="mt-1 text-sm">Check your connection and try again.</p>
                        <button type="button" onClick={() => void refetch()} className="mt-4 min-h-11 rounded-lg border border-destructive/40 px-4 text-sm font-medium">
                            Try again
                        </button>
                    </div>
                ) : filteredAssessments.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                        <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50"/>
                        <h2 className="text-xl font-semibold text-foreground mb-2">No assessments found</h2>
                        <p className="text-muted-foreground mb-6">
                            {assessments.length === 0
                                ? 'Start tracking your progress by adding your first assessment.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                        {assessments.length === 0 && (
                            <Link href="/add"
                                   className="inline-flex min-h-11 items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200">
                                <Plus className="w-4 h-4"/>
                                Add First Assessment
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredAssessments.map((assessment) => (
                        <div key={assessment.id}
                             className="render-row glass-card rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-all duration-200 card-enter">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                        className="px-3 py-1 rounded-full text-xs font-medium bg-info/10 text-info border border-info/20 capitalize">
                      {assessment.type}
                    </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${assessment.percentage >= 70 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                      {assessment.percentage >= 70 ? 'Passed' : 'Failed'}
                    </span>
                                        <span className="text-sm text-muted-foreground">{assessment.domain}</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground mb-1">Score</div>
                                            <div
                                                 className="font-semibold text-foreground">{formatScore(assessment.score)} / {formatScore(assessment.maxScore)}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground mb-1">Percentage</div>
                                            <div
                                                className={`font-semibold ${assessment.percentage >= 70 ? 'text-primary' : 'text-destructive'}`}>
                                                {assessment.percentage}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground mb-1">Date</div>
                                             <div className="font-semibold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3"/>
                                                 {formatLocalDateDisplay(assessment.date)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground mb-1">Time</div>
                                             <div className="font-semibold text-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3"/>
                                                {assessment.timeTaken}m
                                            </div>
                                        </div>
                                    </div>
                                    {assessment.notes && (
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <div className="text-muted-foreground text-sm mb-1">Notes</div>
                                             <p className="text-foreground text-sm leading-relaxed">{assessment.notes}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="self-start">
                                    {confirmingId === assessment.id ? (
                                        <div role="group" aria-label="Confirm deletion" className="flex flex-wrap items-center gap-2">
                                            <button
                                                ref={confirmButtonRef}
                                                type="button"
                                                onClick={() => {
                                                    setDeleteErrorId(null);
                                                    setDeleteSuccess('');
                                                    void deleteMutation.mutateAsync(assessment.id)
                                                        .then(() => {
                                                            setConfirmingId(null);
                                                            setDeleteSuccess(`${assessment.domain} assessment deleted`);
                                                        })
                                                        .catch(() => {
                                                            setDeleteErrorId(assessment.id);
                                                            closeConfirmationAndRestoreFocus();
                                                        });
                                                }}
                                                disabled={deleteMutation.isPending}
                                                className="min-h-11 rounded-lg bg-destructive px-3 text-sm font-medium text-destructive-foreground disabled:opacity-50"
                                            >
                                                Confirm delete
                                            </button>
                                            <button type="button" onClick={closeConfirmationAndRestoreFocus} className="min-h-11 rounded-lg border border-input px-3 text-sm text-foreground">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            ref={(node) => {
                                                if (node) deleteTriggerRefs.current.set(assessment.id, node);
                                                else deleteTriggerRefs.current.delete(assessment.id);
                                            }}
                                            type="button"
                                            onClick={() => {
                                                setDeleteErrorId(null);
                                                setDeleteSuccess('');
                                                setConfirmingId(assessment.id);
                                            }}
                                            disabled={deleteMutation.isPending && deleteMutation.variables === assessment.id}
                                            className="min-h-11 min-w-11 p-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                            aria-label={deleteMutation.isPending && deleteMutation.variables === assessment.id
                                                ? `Deleting ${assessment.domain} assessment`
                                                : `Delete ${assessment.domain} assessment`}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    )}
                                    {deleteErrorId === assessment.id && (
                                        <p role="alert" className="mt-2 max-w-48 text-sm text-destructive">Delete failed. Please try again.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
