'use client';

import {useEffect, useRef, useState} from 'react';
import {useVotePoll} from '@/hooks/usePolls';

interface PollFormProps {
    pollId: string;
    question: string;
    options: string[];
    userId?: string;
    onSuccess?: () => void;
}

export function PollForm({pollId, question, options, userId, onSuccess}: PollFormProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const voteMutation = useVotePoll();

    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!selected) {
            setError('Please select an option before submitting.');
            return;
        }

        try {
            await voteMutation.mutateAsync({
                pollId,
                optionText: selected,
                pollQuestion: question,
                userId,
            });

            setSuccess(true);
            setSelected(null);
            onSuccess?.();

            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
            successTimeoutRef.current = setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit vote');
        }
    };

    const loading = voteMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="space-y-3" disabled={loading}>
                <legend className="text-base font-semibold text-white mb-4">{question}</legend>
                {options.map((option) => (
                    <label
                        key={option}
                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                            selected === option
                                ? 'border-cyber-green/60 bg-cyber-green/10'
                                : 'border-border bg-background/40 hover:border-border hover:bg-secondary/40'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <input
                            type="radio"
                            name="poll-option"
                            value={option}
                            checked={selected === option}
                            onChange={(e) => setSelected(e.target.value)}
                            disabled={loading}
                            className="w-4 h-4 mr-3 accent-primary"
                        />
                        <span className="text-sm text-foreground">{option}</span>
                    </label>
                ))}
            </fieldset>

            <button
                type="submit"
                disabled={loading || !selected}
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Submitting...' : 'Submit Vote'}
            </button>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {success ? <p className="text-primary text-sm">Vote submitted successfully</p> : null}
        </form>
    );
}