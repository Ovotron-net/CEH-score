'use client';

import {useEffect, useState} from 'react';
import {AlertTriangle, Save, Settings as SettingsIcon, Trash2} from 'lucide-react';
import {reconcileTheme} from '../api/settings';
import {useSettingsQuery, useUpdateSettings} from '../hooks/useSettings';
import {useAssessmentQuery, useClearAssessments} from '../hooks/useAssessments';
import type {UserSettings} from '../types';

const focusStyles = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function SettingsForm({
    settings,
    updateSettings,
    assessmentsCount,
    assessmentSize,
    clearAssessments,
    isClearPending,
}: {
    settings: UserSettings;
    updateSettings: (settings: UserSettings) => Promise<unknown>;
    assessmentsCount: number;
    assessmentSize: string;
    clearAssessments: () => Promise<unknown>;
    isClearPending: boolean;
}) {
    const [form, setForm] = useState(settings);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [confirmClear, setConfirmClear] = useState(false);
    const [clearState, setClearState] = useState<'idle' | 'clearing' | 'error'>('idle');
    const clearPending = isClearPending || clearState === 'clearing';

    const handleSave = async () => {
        setSaveState('saving');
        try {
            await updateSettings(form);
            setSaveState('saved');
        } catch {
            setSaveState('error');
        }
    };

    const handleClear = async () => {
        setClearState('clearing');
        try {
            await clearAssessments();
            setClearState('idle');
            setConfirmClear(false);
        } catch {
            setClearState('error');
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-foreground font-semibold mb-5">Profile</h2>
                <label htmlFor="settings-name" className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-2">
                    Your Name
                </label>
                <input
                    id="settings-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={event => setForm(previous => ({...previous, name: event.target.value}))}
                    className={`min-h-11 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-sm transition-colors ${focusStyles}`}
                />
            </section>

            <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-foreground font-semibold mb-5">Exam Goals</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="settings-target-score" className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-2">
                            Target Score ({form.targetScore}%)
                        </label>
                        <input
                            id="settings-target-score"
                            name="targetScore"
                            type="range"
                            min="70"
                            max="100"
                            value={form.targetScore}
                            onChange={event => setForm(previous => ({...previous, targetScore: parseInt(event.target.value, 10)}))}
                            className={`min-h-11 w-full accent-primary ${focusStyles}`}
                        />
                        <div className="flex justify-between text-muted-foreground text-xs mt-1">
                            <span>70% (Min pass)</span>
                            <span className="text-primary font-medium">{form.targetScore}%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="settings-exam-date" className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-2">
                            Exam Date
                        </label>
                        <input
                            id="settings-exam-date"
                            name="examDate"
                            type="date"
                            value={form.examDate}
                            onChange={event => setForm(previous => ({...previous, examDate: event.target.value}))}
                            className={`min-h-11 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-sm transition-colors ${focusStyles}`}
                        />
                    </div>
                </div>
            </section>

            <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-foreground font-semibold mb-5">Appearance</h2>
                <fieldset>
                    <legend className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-2">Theme</legend>
                    <div className="flex gap-2">
                        {(['dark', 'light'] as const).map(theme => (
                            <button
                                key={theme}
                                type="button"
                                aria-pressed={form.theme === theme}
                                onClick={() => setForm(previous => ({...previous, theme}))}
                                className={`min-h-11 flex-1 rounded-lg text-sm font-medium capitalize transition-all border ${focusStyles} ${
                                    form.theme === theme
                                        ? 'bg-primary/20 border-primary/40 text-primary'
                                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {theme === 'dark' ? 'Dark' : 'Light'}
                            </button>
                        ))}
                    </div>
                </fieldset>
            </section>

            <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-foreground font-semibold mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-background rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Total Assessments</p>
                        <p className="text-foreground font-bold text-xl mt-1">{assessmentsCount}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Data Size</p>
                        <p className="text-foreground font-bold text-xl mt-1">{assessmentSize}KB</p>
                    </div>
                </div>
            </section>

            <div className="space-y-3">
                <div data-testid="settings-actions" className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveState === 'saving'}
                        className={`min-h-11 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles} ${
                            saveState === 'saved'
                                ? 'bg-success/20 border border-success/40 text-success'
                                : saveState === 'error'
                                    ? 'bg-destructive/10 border border-destructive/30 text-destructive'
                                    : 'bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary'
                        }`}
                    >
                        <Save className="w-4 h-4" aria-hidden="true"/>
                        {saveState === 'saving' ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button
                        type="button"
                        disabled={clearPending}
                        onClick={() => {
                            setClearState('idle');
                            setConfirmClear(true);
                        }}
                        className={`min-h-11 flex items-center justify-center gap-2 px-4 py-3 border border-destructive/30 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles}`}
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true"/>
                        Clear Data
                    </button>
                </div>

                {saveState === 'saving' && <p role="status" className="text-muted-foreground text-sm">Saving settings.</p>}
                {saveState === 'saved' && <p role="status" className="text-success text-sm">Settings saved.</p>}
                {saveState === 'error' && <p role="alert" className="text-destructive text-sm">Could not save settings. Try again.</p>}

                {confirmClear && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true"/>
                        <div className="flex-1">
                            <p className="text-destructive text-sm font-medium">
                                Delete all {assessmentsCount} assessment{assessmentsCount !== 1 ? 's' : ''}?
                            </p>
                            <p className="text-muted-foreground text-xs mt-0.5">This cannot be undone.</p>
                            {clearState === 'clearing' && <p role="status" className="text-muted-foreground text-sm mt-2">Clearing assessment data.</p>}
                            {clearState === 'error' && (
                                <p role="alert" className="text-destructive text-sm mt-2">Could not clear assessment data. Try again.</p>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={clearPending}
                                    className={`min-h-11 px-3 py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/40 text-destructive rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles}`}
                                >
                                    Yes, delete all
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmClear(false)}
                                    disabled={clearPending}
                                    className={`min-h-11 px-3 py-2 bg-muted/50 hover:bg-muted border border-border text-muted-foreground rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${focusStyles}`}
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
    const settingsQuery = useSettingsQuery();
    const updateMutation = useUpdateSettings();
    const assessmentsQuery = useAssessmentQuery();
    const clearMutation = useClearAssessments();
    const assessments = assessmentsQuery.data ?? [];
    const assessmentSize = (JSON.stringify(assessments).length / 1024).toFixed(1);
    const settingsTheme = settingsQuery.data?.theme;

    useEffect(() => {
        if (settingsTheme) reconcileTheme(settingsTheme);
    }, [settingsTheme]);

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto page-enter">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <SettingsIcon className="w-7 h-7 text-muted-foreground" aria-hidden="true"/>
                    Settings
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Configure your CEH tracker</p>
            </div>

            {settingsQuery.isError && (
                <div role="alert" className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                    Could not load settings from server. Changes cannot be saved. Check your connection.
                </div>
            )}

            {settingsQuery.isLoading ? (
                <p role="status" className="text-muted-foreground text-sm">Loading...</p>
            ) : settingsQuery.data ? (
                <SettingsForm
                    key={JSON.stringify(settingsQuery.data)}
                    settings={settingsQuery.data}
                    updateSettings={updateMutation.mutateAsync}
                    assessmentsCount={assessments.length}
                    assessmentSize={assessmentSize}
                    clearAssessments={clearMutation.mutateAsync}
                    isClearPending={clearMutation.isPending}
                />
            ) : null}
        </div>
    );
}
