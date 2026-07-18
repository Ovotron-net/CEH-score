import dynamic from 'next/dynamic';
import ChartSkeleton from './ChartSkeleton';

const loadScoreTrend = () => import('./ScoreTrend');
const loadPassFail = () => import('./PassFail');
const loadScoreDistribution = () => import('./ScoreDistribution');
const loadDomainRadar = () => import('./DomainRadar');
const loadDomainBarChart = () => import('./DomainBarChart');
const loadVotesByPollChart = () => import('./VotesByPollChart');

export function preloadAnalyticsCharts() {
    return Promise.all([
        loadScoreTrend(),
        loadPassFail(),
        loadScoreDistribution(),
        loadDomainRadar(),
        loadDomainBarChart(),
    ]);
}

export function preloadPollAnalyticsChart() {
    return loadVotesByPollChart();
}

export const ScoreTrend = dynamic(loadScoreTrend, {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const PassFail = dynamic(loadPassFail, {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const ScoreDistribution = dynamic(loadScoreDistribution, {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const DomainRadar = dynamic(loadDomainRadar, {
    ssr: false,
    loading: () => <ChartSkeleton height={280}/>,
});

export const DomainBarChart = dynamic(loadDomainBarChart, {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const VotesByPollChart = dynamic(loadVotesByPollChart, {
    ssr: false,
    loading: () => <ChartSkeleton height={288}/>,
});
