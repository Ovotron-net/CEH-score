export default function ChartSkeleton({height = 220}: { height?: number }) {
    return <div className="w-full rounded-lg bg-muted/30 animate-pulse" style={{height}}/>;
}