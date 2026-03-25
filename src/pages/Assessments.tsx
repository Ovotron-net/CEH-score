import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, SortAsc } from 'lucide-react';
import AssessmentCard from '../components/AssessmentCard';
import { useAssessments } from '../hooks/useAssessments';

export default function Assessments() {
  const { assessments, deleteAssessment } = useAssessments();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const filtered = assessments
    .filter(a => {
      const matchesSearch = a.domain.toLowerCase().includes(search.toLowerCase()) ||
        a.notes.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.percentage - a.percentage;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessments</h1>
          <p className="text-[#64748b] text-sm mt-1">{assessments.length} total assessments</p>
        </div>
        <Link
          to="/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm font-medium transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          New Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2d40] rounded-lg px-3 py-2 flex-1 min-w-[192px]">
          <Search className="w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-[#64748b] outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#64748b]" />
          {['all', 'practice', 'mock', 'official'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                typeFilter === type
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                  : 'bg-[#111827] text-[#64748b] border border-[#1f2d40] hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-[#64748b]" />
          {['date', 'score'].map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort as 'date' | 'score')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                sortBy === sort
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30'
                  : 'bg-[#111827] text-[#64748b] border border-[#1f2d40] hover:text-white'
              }`}
            >
              By {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#64748b]">
          <p className="text-lg">No assessments found</p>
          <Link to="/add" className="text-[#00ff88] hover:underline mt-2 block text-sm">Add your first assessment</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(a => (
            <AssessmentCard key={a.id} assessment={a} onDelete={deleteAssessment} />
          ))}
        </div>
      )}
    </div>
  );
}
