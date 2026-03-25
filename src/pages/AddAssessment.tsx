import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Assessment } from '../types';
import { useAssessments } from '../hooks/useAssessments';
import { CEH_DOMAINS, FULL_EXAM } from '../data/cehDomains';
import { calculatePercentage, isPassed } from '../utils/calculations';
import { CheckCircle, XCircle, Save } from 'lucide-react';

export default function AddAssessment() {
  const navigate = useNavigate();
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

  const score = parseInt(form.score) || 0;
  const maxScore = parseInt(form.maxScore) || 125;
  const percentage = form.score ? calculatePercentage(score, maxScore) : 0;
  const passed = isPassed(percentage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.score || !form.timeTaken) return;

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

    addAssessment(assessment);
    navigate('/assessments');
  };

  const domainOptions = [FULL_EXAM, ...CEH_DOMAINS.map(d => d.name)];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add Assessment</h1>
        <p className="text-[#64748b] text-sm mt-1">Record a new CEH practice or exam result</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview */}
        {form.score && (
          <div className={`flex items-center justify-between p-4 rounded-xl border ${
            passed ? 'bg-[#00ff88]/5 border-[#00ff88]/20' : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                {passed ? <CheckCircle className="w-5 h-5 text-[#00ff88]" /> : <XCircle className="w-5 h-5 text-red-400" />}
                <span className={`font-bold text-xl ${passed ? 'text-[#00ff88]' : 'text-red-400'}`}>{percentage}%</span>
                <span className={`text-sm ${passed ? 'text-[#00ff88]' : 'text-red-400'}`}>{passed ? 'PASSED' : 'FAILED'}</span>
              </div>
              <p className="text-[#64748b] text-sm mt-1">{score}/{maxScore} correct answers</p>
            </div>
            <div className="text-right">
              <p className="text-[#64748b] text-xs">Pass threshold: 70%</p>
              {passed ? (
                <p className="text-sm font-medium mt-0.5 text-[#00ff88]">
                  {score - Math.ceil(0.7 * maxScore) + 1} above passing threshold
                </p>
              ) : (
                <p className="text-sm font-medium mt-0.5 text-red-400">
                  Need {Math.ceil(0.7 * maxScore) - score} more to pass
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as Assessment['type'] }))}
                className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
              >
                <option value="practice">Practice</option>
                <option value="mock">Mock Exam</option>
                <option value="official">Official</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Score (0-125)</label>
              <input
                type="number"
                min="0"
                max={maxScore}
                value={form.score}
                onChange={e => setForm(p => ({ ...p, score: e.target.value }))}
                placeholder="e.g. 98"
                required
                className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Max Score</label>
              <input
                type="number"
                min="1"
                max="200"
                value={form.maxScore}
                onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))}
                className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Domain</label>
            <select
              value={form.domain}
              onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}
              className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
            >
              {domainOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Time Taken (minutes)</label>
            <input
              type="number"
              min="1"
              max="300"
              value={form.timeTaken}
              onChange={e => setForm(p => ({ ...p, timeTaken: e.target.value }))}
              placeholder="e.g. 120"
              required
              className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="What did you learn? What needs improvement?"
              rows={3}
              className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-[#1f2d40] text-[#64748b] rounded-lg text-sm font-medium hover:text-white hover:border-[#64748b] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm font-medium transition-all"
          >
            <Save className="w-4 h-4" />
            Save Assessment
          </button>
        </div>
      </form>
    </div>
  );
}
