import {NextResponse} from 'next/server';
import {z} from 'zod';
import {votePoll} from '@/data/pollRepository';
import {toErrorResponse} from '@/lib/errors';
import {guardWrite} from '@/lib/routeGuard';

const VoteBodySchema = z.object({
    optionText: z.string().min(1).max(500),
    pollQuestion: z.string().min(1).max(500).optional(),
    userId: z.string().max(100).optional().nullable(),
});

export async function POST(
    request: Request,
    {params}: { params: Promise<{ pollId: string }> },
) {
    const {pollId} = await params;

    if (!pollId || pollId.length > 100) {
        return NextResponse.json({error: 'Invalid pollId.'}, {status: 400});
    }

    // Auth + rate limit before body parse (consistent with other write routes).
    const denied = guardWrite(request, `vote:${pollId}`, 5, 60_000);
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const parsed = VoteBodySchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    try {
        const result = await votePoll({
            pollId,
            optionText: parsed.data.optionText,
            pollQuestion: parsed.data.pollQuestion,
            userId: parsed.data.userId,
        });
        return NextResponse.json(result, {status: 200});
    } catch (err) {
        const mapped = toErrorResponse(err, 'Failed to record vote.');
        return NextResponse.json(mapped.body, {status: mapped.status});
    }
}
