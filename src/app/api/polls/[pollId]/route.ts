import {NextResponse} from 'next/server';
import {db} from '@/db';
import {pollResults} from '@/db/schema';
import type {InferSelectModel} from 'drizzle-orm';
import {eq} from 'drizzle-orm';
import {authenticate} from '@/lib/auth';

type PollResultRow = InferSelectModel<typeof pollResults>;

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

        const rows = await db
            .select()
            .from(pollResults)
            .where(eq(pollResults.pollId, pollId))
            .orderBy(pollResults.optionText);

        if (rows.length === 0) {
            return NextResponse.json({error: 'Poll not found.'}, {status: 404});
        }

        // Calculate statistics
        const totalVotes = rows.reduce((sum: number, row: PollResultRow) => sum + row.voteCount, 0);
        const pollQuestion = rows[0].pollQuestion;

        const options = rows.map((row: PollResultRow) => ({
            id: row.id,
            optionText: row.optionText,
            voteCount: row.voteCount,
            percentage: totalVotes > 0 ? Math.round((row.voteCount / totalVotes) * 100) : 0,
        }));

        return NextResponse.json({
            pollId,
            pollQuestion,
            totalVotes,
            options,
            createdAt: rows[0].createdAt,
            updatedAt: rows[rows.length - 1].updatedAt,
        });
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

