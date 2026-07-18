import {NextResponse} from 'next/server';
import {z} from 'zod';
import {db} from '@/db';
import {pollResults} from '@/db/schema';
import {getPollResults} from '@/data/pollRepository';
import {authenticate} from '@/lib/auth';
import {enforceRateLimit} from '@/lib/rate-limit';

const PollResultSchema = z.object({
    pollId: z.string().min(1).max(100),
    pollQuestion: z.string().min(1).max(500),
    optionText: z.string().min(1).max(500),
    userId: z.string().max(100).optional().nullable(),
});


export async function GET(request: Request) {
    const authError = authenticate(request);
    if (authError) return authError;

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
    const authError = authenticate(request);
    if (authError) return authError;

    const limited = enforceRateLimit(request, 'polls:create', 20, 60_000);
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = PollResultSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    const data = parsed.data;

    try {
        const [created] = await db
            .insert(pollResults)
            .values({
                pollId: data.pollId,
                pollQuestion: data.pollQuestion,
                optionText: data.optionText,
                userId: data.userId || null,
                voteCount: 1,
            })
            .returning();
        return NextResponse.json(created, {status: 201});
    } catch (err: unknown) {
        const isUniqueViolation =
            typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505';
        if (isUniqueViolation) {
            return NextResponse.json(
                {error: 'A poll option with this text already exists for this poll.'},
                {status: 409},
            );
        }
        return NextResponse.json({error: 'Failed to create poll result.'}, {status: 500});
    }
}

