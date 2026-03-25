import { useState } from 'react';
import type { CEHDomain } from '../types';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

interface DomainCardProps {
  domain: CEHDomain;
  assessmentCount?: number;
  avgScore?: number;
}

export default function DomainCard({ domain, assessmentCount = 0, avgScore }: DomainCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#111827] border border-[#1f2d40] rounded-xl overflow-hidden hover:border-[#00ff88]/20 transition-all duration-200">
      <div
        className="p-5 cursor-pointer flex items-start justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5 text-[#00ff88]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-tight mb-1">{domain.name}</h3>
            <p className="text-[#64748b] text-xs">{domain.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-[#00d4ff]">Weight: {domain.weight}%</span>
              <span className="text-xs text-[#64748b]">{domain.topics.length} topics</span>
              {assessmentCount > 0 && <span className="text-xs text-purple-400">{assessmentCount} assessments</span>}
              {avgScore !== undefined && (
                <span className={`text-xs font-medium ${avgScore >= 70 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                  Avg: {avgScore}%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2 mt-1">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[#64748b]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#64748b]" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#1f2d40] px-5 py-4">
          <p className="text-xs text-[#64748b] font-medium uppercase tracking-wider mb-3">Topics</p>
          <div className="flex flex-wrap gap-2">
            {domain.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-3 py-1.5 bg-[#0a0e1a] border border-[#1f2d40] rounded-full text-[#e2e8f0] hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-colors cursor-default"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
