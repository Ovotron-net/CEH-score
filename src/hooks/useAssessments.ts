import { useState, useEffect } from 'react';
import type { Assessment } from '../types';
import { loadAssessments, saveAssessments } from '../utils/localStorage';
import { SAMPLE_ASSESSMENTS } from '../data/sampleData';

const INITIALIZED_KEY = 'ceh_initialized';

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const stored = loadAssessments<Assessment>();
    if (stored.length === 0 && !localStorage.getItem(INITIALIZED_KEY)) {
      localStorage.setItem(INITIALIZED_KEY, 'true');
      saveAssessments(SAMPLE_ASSESSMENTS);
      return SAMPLE_ASSESSMENTS;
    }
    return stored;
  });

  useEffect(() => {
    saveAssessments(assessments);
  }, [assessments]);

  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [assessment, ...prev]);
  };

  const deleteAssessment = (id: string) => {
    setAssessments(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = () => {
    localStorage.removeItem(INITIALIZED_KEY);
    setAssessments([]);
  };

  return { assessments, addAssessment, deleteAssessment, clearAll };
}
