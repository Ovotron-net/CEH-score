import { useState, useEffect } from 'react';
import type { Assessment } from '../types';
import { assessmentsApi } from '../api';

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    assessmentsApi.getAll().then(data => {
      setAssessments(data);
      setIsLoading(false);
    });
  }, []);

  const addAssessment = async (assessment: Assessment) => {
    await assessmentsApi.create(assessment);
    setAssessments(prev => [assessment, ...prev]);
  };

  const deleteAssessment = async (id: string) => {
    await assessmentsApi.remove(id);
    setAssessments(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = async () => {
    await assessmentsApi.clearAll();
    setAssessments([]);
  };

  return { assessments, isLoading, addAssessment, deleteAssessment, clearAll };
}
