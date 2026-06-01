import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pollResults } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { pollId: string } },
) {
  try {
    const { pollId } = params;

    const rows = await db
      .select()
      .from(pollResults)
      .where(eq(pollResults.pollId, pollId))
      .orderBy(pollResults.optionText);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Poll not found.' }, { status: 404 });
    }

    // Calculate statistics
    const totalVotes = rows.reduce((sum, row) => sum + row.voteCount, 0);
    const pollQuestion = rows[0].pollQuestion;

    const options = rows.map((row) => ({
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
    return NextResponse.json({ error: 'Failed to fetch poll.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { pollId: string } },
) {
  try {
    const { pollId } = params;

    await db.delete(pollResults).where(eq(pollResults.pollId, pollId));

    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete poll.' }, { status: 500 });
  }
}

