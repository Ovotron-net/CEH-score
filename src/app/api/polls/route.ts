import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createPollResult, getPollResults} from '@/data/pollRepository';
import {toErrorResponse} from '@/lib/errors';
import {guardRead, guardWrite} from '@/lib/routeGuard';

const PollResultSchema = z.object({
    pollId: z.string().min(1).max(100),
    pollQuestion: z.string().min(1).max(500),
    optionText: z.string().min(1).max(500),
    userId: z.string().max(100).optional().nullable(),
});

export async function GET(request: Request) {
    const denied = guardRead(request);
    if (denied) return denied;

    try {
        const {searchParams} = new URL(request.url);
        const pollId = searchParams.get('pollId');

        if (pollId) {
            if (pollId.length > 100) {
                return NextResponse.json({error: 'Invalid pollId.'}, {status: 400});
            }
            return NextResponse.json(await getPollResults(pollId));
        }

        return NextResponse.json(await getPollResults());
    } catch {
        return NextResponse.json({error: 'Failed to fetch poll results.'}, {status: 500});
    }
}

export async function POST(request: Request) {
    const denied = guardWrite(request, 'polls:create', 20, 60_000);
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const parsed = PollResultSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    try {
        const created = await createPollResult(parsed.data);
        return NextResponse.json(created, {status: 201});
    } catch (err) {
        const mapped = toErrorResponse(err, 'Failed to create poll result.');
        return NextResponse.json(mapped.body, {status: mapped.status});
    }
}
