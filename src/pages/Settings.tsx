import { useState } from 'react';
import { Settings as SettingsIcon, Save, Trash2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAssessments } from '../hooks/useAssessments';
import type { UserSettings } from '../types';

function SettingsForm({
  settings,
  updateSettings,
  assessments,
  onClearData,
}: {
  settings: UserSettings;
  updateSettings: (u: Partial<UserSettings>) => Promise<unknown>;
  assessments: unknown[];
  onClearData: () => void;
}) {
  const [form, setForm] = useState(settings);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await updateSettings(form);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Exam Goals */}
      <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">Exam Goals</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">
              Target Score ({form.targetScore}%)
            </label>
            <input
              type="range"
              min="70"
              max="100"
              value={form.targetScore}
              onChange={e => setForm(p => ({ ...p, targetScore: parseInt(e.target.value) }))}
              className="w-full accent-[#00ff88]"
            />
            <div className="flex justify-between text-[#64748b] text-xs mt-1">
              <span>70% (Min pass)</span>
              <span className="text-[#00ff88] font-medium">{form.targetScore}%</span>
              <span>100%</span>
            </div>
          </div>
          <div>
            <label className="text-[#64748b] text-xs font-medium uppercase tracking-wider block mb-2">Exam Date</label>
            <input
              type="date"
              value={form.examDate}
              onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))}
              className="w-full bg-[#0a0e1a] border border-[#1f2d40] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#00ff88]/50 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#111827] border border-[#1f2d40] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-[#0a0e1a] rounded-lg p-3">
            <p className="text-[#64748b] text-xs">Total Assessments</p>
            <p className="text-white font-bold text-xl mt-1">{assessments.length}</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg p-3">
            <p className="text-[#64748b] text-xs">Data Size</p>
            <p className="text-white font-bold text-xl mt-1">{(JSON.stringify(assessments).length / 1024).toFixed(1)}KB</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            saveState === 'saved'
              ? 'bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88]'
              : saveState === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88]'
          }`}
        >
          <Save className="w-4 h-4" />
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : saveState === 'error' ? 'Save Failed' : 'Save Settings'}
        </button>
        <button
          onClick={onClearData}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear Data
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const { assessments, clearAll } = useAssessments();

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all assessment data.')) {
      clearAll();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-[#64748b]" />
          Settings
        </h1>
        <p className="text-[#64748b] text-sm mt-1">Configure your CEH tracker</p>
      </div>

      {isLoading ? (
        <p className="text-[#64748b] text-sm">Loading…</p>
      ) : (
        <SettingsForm
          settings={settings}
          updateSettings={updateSettings}
          assessments={assessments}
          onClearData={handleClearData}
        />
      )}
    </div>
  );
}
