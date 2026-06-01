import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { pollResults } from '@/db/schema';
import { eq } from 'drizzle-orm';

const PollResultSchema = z.object({
  pollId: z.string().min(1).max(100),
  pollQuestion: z.string().min(1).max(500),
  optionText: z.string().min(1).max(500),
  userId: z.string().max(100).optional().nullable(),
});



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get('pollId');

    if (pollId) {
      const rows = await db
        .select()
        .from(pollResults)
        .where(eq(pollResults.pollId, pollId))
        .orderBy(pollResults.createdAt);
      return NextResponse.json(rows);
    }

    const rows = await db.select().from(pollResults).orderBy(pollResults.createdAt);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch poll results.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = PollResultSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.flatten() },
      { status: 400 },
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
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create poll result.' }, { status: 500 });
  }
}

