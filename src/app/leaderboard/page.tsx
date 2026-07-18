import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getAssessments} from '@/data/assessmentRepository';
import {getSettings} from '@/data/settingsRepository';
import {assessmentQueryKey, settingsQueryKey} from '@/data/queryKeys';
import Leaderboard from '@/views/Leaderboard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Leaderboard | CEH Tracker',
};

export default function LeaderboardPage() {
    return (
        <HydratedPage queries={[
            {queryKey: assessmentQueryKey, queryFn: getAssessments},
            {queryKey: settingsQueryKey, queryFn: getSettings},
        ]}>
            <Leaderboard/>
        </HydratedPage>
    );
}
