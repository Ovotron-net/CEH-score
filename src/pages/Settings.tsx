import { useState } from 'react';
import { Settings as SettingsIcon, Save, Trash2, AlertTriangle } from 'lucide-react';
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
  const [confirmClear, setConfirmClear] = useState(false);

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
      <div className="space-y-3">
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
            onClick={() => setConfirmClear(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </button>
        </div>

        {confirmClear && (
          <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">Delete all {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}?</p>
              <p className="text-[#64748b] text-xs mt-0.5">This cannot be undone.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { onClearData(); setConfirmClear(false); }}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-xs font-medium transition-all"
                >
                  Yes, delete all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 bg-[#1f2d40]/50 hover:bg-[#1f2d40] border border-[#1f2d40] text-[#64748b] rounded-lg text-xs font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const { settings, isLoading, isError, updateSettings } = useSettings();
  const { assessments, clearAll } = useAssessments();

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-[#64748b]" />
          Settings
        </h1>
        <p className="text-[#64748b] text-sm mt-1">Configure your CEH tracker</p>
      </div>

      {isError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          Could not load settings from server — changes cannot be saved. Check your connection.
        </div>
      )}

      {isLoading ? (
        <p className="text-[#64748b] text-sm">Loading…</p>
      ) : (
        <SettingsForm
          settings={settings}
          updateSettings={updateSettings}
          assessments={assessments}
          onClearData={clearAll}
        />
      )}
    </div>
  );
}
