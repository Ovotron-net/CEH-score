import dynamic from 'next/dynamic';
import ChartSkeleton from './ChartSkeleton';

export const ScoreTrend = dynamic(() => import('./ScoreTrend'), {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const PassFail = dynamic(() => import('./PassFail'), {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const ScoreDistribution = dynamic(() => import('./ScoreDistribution'), {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const DomainRadar = dynamic(() => import('./DomainRadar'), {
    ssr: false,
    loading: () => <ChartSkeleton height={280}/>,
});

export const DomainBarChart = dynamic(() => import('./DomainBarChart'), {
    ssr: false,
    loading: () => <ChartSkeleton/>,
});

export const VotesByPollChart = dynamic(() => import('./VotesByPollChart'), {
    ssr: false,
    loading: () => <ChartSkeleton height={288}/>,
});