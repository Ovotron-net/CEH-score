import {NextResponse} from 'next/server';
import {z} from 'zod';
import {eq, sql} from 'drizzle-orm';
import {db} from '@/db';
import {pollResults} from '@/db/schema';
import {authenticate} from '@/lib/auth';
import {enforceRateLimit} from '@/lib/rate-limit';

const VoteBodySchema = z.object({
    optionText: z.string().min(1).max(500),
    pollQuestion: z.string().min(1).max(500).optional(),
    userId: z.string().max(100).optional().nullable(),
});

export async function POST(
    request: Request,
    {params}: { params: Promise<{ pollId: string }> },
) {
    const authError = authenticate(request);
    if (authError) return authError;

    const body = await request.json().catch(() => null);
    const parsed = VoteBodySchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    try {
        const {pollId} = await params;

        if (!pollId || pollId.length > 100) {
            return NextResponse.json({error: 'Invalid pollId.'}, {status: 400});
        }

        // Rate limit: max 5 votes per IP per poll per 60 seconds
        const limited = enforceRateLimit(request, `vote:${pollId}`, 5, 60_000);
        if (limited) return limited;

        const {optionText, pollQuestion, userId} = parsed.data;

        // Load existing option rows for this poll to resolve the question and
        // guard against unbounded, user-driven option creation.
        const existingRows = await db
            .select()
            .from(pollResults)
            .where(eq(pollResults.pollId, pollId));

        const resolvedPollQuestion = pollQuestion ?? existingRows[0]?.pollQuestion;

        if (!resolvedPollQuestion) {
            return NextResponse.json(
                {
                    error:
                        'pollQuestion is required for a new pollId when no existing poll metadata is present.',
                },
                {status: 400},
            );
        }

        const isExistingOption = existingRows.some((row) => row.optionText === optionText);
        const MAX_OPTIONS_PER_POLL = 20;
        if (!isExistingOption && existingRows.length >= MAX_OPTIONS_PER_POLL) {
            return NextResponse.json(
                {error: 'This poll has reached the maximum number of options.'},
                {status: 400},
            );
        }

        const [result] = await db
            .insert(pollResults)
            .values({
                pollId,
                pollQuestion: resolvedPollQuestion,
                optionText,
                userId: userId || null,
                voteCount: 1,
            })
            .onConflictDoUpdate({
                target: [pollResults.pollId, pollResults.optionText],
                set: {
                    voteCount: sql`${pollResults.voteCount}
                    + 1`,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return NextResponse.json(result, {status: 200});
    } catch {
        return NextResponse.json({error: 'Failed to record vote.'}, {status: 500});
    }
}
