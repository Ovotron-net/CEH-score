'use client';

import {useDeferredValue, useMemo, useState} from 'react';
import {BookOpen, Search} from 'lucide-react';
import DomainCard from '../components/DomainCard';
import {CEH_DOMAINS} from '../data/cehDomains';
import {useAssessmentQuery} from '../hooks/useAssessments';
import {buildDomainStats} from '../utils/domainStats';

const TOTAL_TOPICS = CEH_DOMAINS.reduce((sum, domain) => sum + domain.topics.length, 0);

export default function Topics() {
    const {data: assessments = [], isLoading, isError} = useAssessmentQuery();
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const domainStats = useMemo(() => buildDomainStats(assessments), [assessments]);
    const domainAssessmentCount = useMemo(
        () => assessments.reduce((count, assessment) => count + Number(assessment.domain !== 'Full Exam'), 0),
        [assessments],
    );

    const filtered = CEH_DOMAINS.filter(d =>
        d.name.toLowerCase().includes(normalizedSearch) ||
        d.description.toLowerCase().includes(normalizedSearch) ||
        d.topics.some(t => t.toLowerCase().includes(normalizedSearch))
    );

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto page-enter">
            {isLoading && (
                <div role="status" aria-label="Loading topic statistics" className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    Loading topic statistics...
                </div>
            )}
            {isError && (
                <div role="alert" className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                    Failed to load assessments. Domain stats are unavailable. Check your connection.
                </div>
            )}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <BookOpen className="w-7 h-7 text-accent"/>
                    CEH Topics
                </h1>
                <p className="text-muted-foreground text-sm mt-1">All {CEH_DOMAINS.length} official CEH v13 domains</p>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{CEH_DOMAINS.length}</p>
                    <p className="text-muted-foreground text-xs mt-1">Domains</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-info">{TOTAL_TOPICS}</p>
                    <p className="text-muted-foreground text-xs mt-1">Total Topics</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p data-testid="domain-assessment-count" className="text-2xl font-bold text-warning">{domainAssessmentCount}</p>
                    <p className="text-muted-foreground text-xs mt-1">Domain Assessments</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <label htmlFor="topic-search" className="mb-2 block text-sm font-medium text-foreground">Search domains and topics</label>
                <div className="flex items-center gap-2 bg-card border border-input rounded-lg px-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30">
                    <Search className="w-4 h-4 text-muted-foreground"/>
                    <input
                        id="topic-search"
                        type="search"
                        placeholder="Search domains, topics..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="min-h-11 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1"
                    />
                </div>
            </div>

            {/* Domain list */}
            <div className="space-y-3">
                {filtered.map(domain => {
                    const stats = domainStats.get(domain.name);
                    return (
                        <DomainCard
                            key={domain.id}
                            domain={domain}
                            assessmentCount={stats?.count ?? 0}
                            avgScore={stats?.average}
                        />
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No domains match your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}



