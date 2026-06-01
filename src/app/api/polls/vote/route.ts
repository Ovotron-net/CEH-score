import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { pollResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VoteSchema = z.object({
  pollId: z.string().min(1).max(100),
  optionText: z.string().min(1).max(500),
  userId: z.string().max(100).optional().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = VoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { pollId, optionText, userId } = parsed.data;

  try {
    // Check if this option already exists for this poll
    const existing = await db
      .select()
      .from(pollResults)
      .where(and(eq(pollResults.pollId, pollId), eq(pollResults.optionText, optionText)))
      .limit(1);

    if (existing.length > 0) {
      // Increment vote count
      const [updated] = await db
        .update(pollResults)
        .set({
          voteCount: existing[0].voteCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(pollResults.id, existing[0].id))
        .returning();
      return NextResponse.json(updated, { status: 200 });
    } else {
      // Create new poll option with 1 vote
      const [created] = await db
        .insert(pollResults)
        .values({
          pollId,
          pollQuestion: '', // Will be set by client or updated later
          optionText,
          userId: userId || null,
          voteCount: 1,
        })
        .returning();
      return NextResponse.json(created, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to record vote.' }, { status: 500 });
  }
}

