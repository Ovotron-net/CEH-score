import {NextResponse} from 'next/server';
import {deletePoll, getPollStats} from '@/data/pollRepository';
import {guardRead, guardWrite} from '@/lib/routeGuard';

export async function GET(
    request: Request,
    {params}: { params: Promise<{ pollId: string }> },
) {
    const denied = guardRead(request);
    if (denied) return denied;

    try {
        const {pollId} = await params;

        if (!pollId || pollId.length > 100) {
            return NextResponse.json({error: 'Invalid pollId.'}, {status: 400});
        }

        const stats = await getPollStats(pollId);

        if (!stats) {
            return NextResponse.json({error: 'Poll not found.'}, {status: 404});
        }
        return NextResponse.json(stats);
    } catch {
        return NextResponse.json({error: 'Failed to fetch poll.'}, {status: 500});
    }
}

export async function DELETE(
    request: Request,
    {params}: { params: Promise<{ pollId: string }> },
) {
    const denied = guardWrite(request, 'polls:delete', 20, 60_000);
    if (denied) return denied;

    try {
        const {pollId} = await params;

        if (!pollId || pollId.length > 100) {
            return NextResponse.json({error: 'Invalid pollId.'}, {status: 400});
        }

        await deletePoll(pollId);
        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to delete poll.'}, {status: 500});
    }
}
