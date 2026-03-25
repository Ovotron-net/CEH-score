import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import DomainCard from '../components/DomainCard';
import { CEH_DOMAINS } from '../data/cehDomains';
import { useAssessments } from '../hooks/useAssessments';

export default function Topics() {
  const { assessments } = useAssessments();
  const [search, setSearch] = useState('');

  const filtered = CEH_DOMAINS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const getDomainStats = (domainName: string) => {
    const domainAssessments = assessments.filter(a => a.domain === domainName);
    if (domainAssessments.length === 0) return { count: 0 };
    const avg = domainAssessments.reduce((s, a) => s + a.percentage, 0) / domainAssessments.length;
    return { count: domainAssessments.length, avg: Math.round(avg * 10) / 10 };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-[#00d4ff]" />
          CEH Topics
        </h1>
        <p className="text-[#64748b] text-sm mt-1">All {CEH_DOMAINS.length} official CEH v13 domains</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#00ff88]">{CEH_DOMAINS.length}</p>
          <p className="text-[#64748b] text-xs mt-1">Domains</p>
        </div>
        <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#00d4ff]">{CEH_DOMAINS.reduce((s, d) => s + d.topics.length, 0)}</p>
          <p className="text-[#64748b] text-xs mt-1">Total Topics</p>
        </div>
        <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{assessments.filter(a => a.domain !== 'Full Exam').length}</p>
          <p className="text-[#64748b] text-xs mt-1">Domain Assessments</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2d40] rounded-lg px-4 py-3 mb-6">
        <Search className="w-4 h-4 text-[#64748b]" />
        <input
          type="text"
          placeholder="Search domains, topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-[#64748b] outline-none flex-1"
        />
      </div>

      {/* Domain list */}
      <div className="space-y-3">
        {filtered.map(domain => {
          const stats = getDomainStats(domain.name);
          return (
            <DomainCard
              key={domain.id}
              domain={domain}
              assessmentCount={stats.count}
              avgScore={stats.avg}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748b]">
            <p>No domains match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
