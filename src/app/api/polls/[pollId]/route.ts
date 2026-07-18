import {NextResponse} from 'next/server';
import {db} from '@/db';
import {pollResults} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {getPollStats} from '@/data/pollRepository';
import {authenticate} from '@/lib/auth';
import {enforceRateLimit} from '@/lib/rate-limit';

export async function GET(
    request: Request,
    {params}: { params: Promise<{ pollId: string }> },
) {
    const authError = authenticate(request);
    if (authError) return authError;

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
    const authError = authenticate(request);
    if (authError) return authError;

    const limited = enforceRateLimit(request, 'polls:delete', 20, 60_000);
    if (limited) return limited;

    try {
        const {pollId} = await params;

        if (!pollId || pollId.length > 100) {
            return NextResponse.json({error: 'Invalid pollId.'}, {status: 400});
        }

        await db.delete(pollResults).where(eq(pollResults.pollId, pollId));

        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to delete poll.'}, {status: 500});
    }
}

