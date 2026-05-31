import { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import { settingsApi } from '../api';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Alex Chen',
    targetScore: 85,
    examDate: '',
    theme: 'dark',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    settingsApi.get().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    await settingsApi.update(next);
  };

  return { settings, isLoading, updateSettings };
}
