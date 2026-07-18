import type {Metadata} from 'next';
import HydratedPage from '@/components/HydratedPage';
import {getAssessments} from '@/data/assessmentRepository';
import {getSettings} from '@/data/settingsRepository';
import {assessmentQueryKey, settingsQueryKey} from '@/data/queryKeys';
import Settings from '@/views/Settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Settings | CEH Tracker',
};

export default function SettingsPage() {
    return (
        <HydratedPage queries={[
            {queryKey: assessmentQueryKey, queryFn: getAssessments},
            {queryKey: settingsQueryKey, queryFn: getSettings},
        ]}>
            <Settings/>
        </HydratedPage>
    );
}
