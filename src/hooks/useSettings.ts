import { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import { loadSettings, saveSettings } from '../utils/localStorage';

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Alex Chen',
  targetScore: 85,
  examDate: '',
  theme: 'dark',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings(DEFAULT_SETTINGS));

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
