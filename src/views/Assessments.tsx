'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Filter, Plus, Search, Trash2, ClipboardList } from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import { formatScore } from '../utils/calculations';
import type { Assessment } from '../types';

export default function Assessments() {
  const { assessments, isLoading, deleteAssessment } = useAssessments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Assessment['type'] | 'all'>('all');

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || assessment.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [assessments, searchTerm, selectedType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Assessments</h1>
          <p className="text-muted-foreground">Manage and review your CEH practice assessments</p>
        </div>
        <Link href="/add" className="inline-flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 cyber-glow">
          <Plus className="w-4 h-4" />
          Add Assessment
        </Link>
      </div>

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by domain or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as Assessment['type'] | 'all')}
              className="pl-10 pr-8 py-3 bg-background/50 border border-border rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none min-w-[140px]"
            >
              <option value="all">All Types</option>
              <option value="practice">Practice</option>
              <option value="official">Official</option>
              <option value="mock">Mock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-6">
              {assessments.length === 0
                ? 'Start tracking your progress by adding your first assessment.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {assessments.length === 0 && (
              <Link href="/add" className="inline-flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200">
                <Plus className="w-4 h-4" />
                Add First Assessment
              </Link>
            )}
          </div>
        ) : (
          filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-200 card-enter">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                      {assessment.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${assessment.percentage >= 70 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {assessment.percentage >= 70 ? 'Passed' : 'Failed'}
                    </span>
                    <span className="text-sm text-muted-foreground">{assessment.domain}</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Score</div>
                      <div className="font-semibold text-white">{formatScore(assessment.score)} / {formatScore(assessment.maxScore)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Percentage</div>
                      <div className={`font-semibold ${assessment.percentage >= 70 ? 'text-primary' : 'text-red-400'}`}>
                        {assessment.percentage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Date</div>
                      <div className="font-semibold text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(assessment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Time</div>
                      <div className="font-semibold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {assessment.timeTaken}m
                      </div>
                    </div>
                  </div>
                  {assessment.notes && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="text-muted-foreground text-sm mb-1">Notes</div>
                      <p className="text-white text-sm leading-relaxed">{assessment.notes}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => void deleteAssessment(assessment.id)}
                  disabled={false}
                  className="self-start p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Delete assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



