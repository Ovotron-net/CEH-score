import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { assessments } from '@/db/schema';
import { authenticate } from '@/lib/auth';

const AssessmentSchema = z.object({
  id: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['practice', 'official', 'mock']),
  score: z.number().int().min(0).max(10000),
  maxScore: z.number().int().min(1).max(10000),
  timeTaken: z.number().int().min(0),
  domain: z.string().min(1).max(200),
  notes: z.string().max(2000).default(''),
  createdAt: z.string().min(1).max(50),
});

export async function GET(request: Request) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const rows = await db.select().from(assessments).orderBy(assessments.createdAt);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assessments.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = authenticate(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const parsed = AssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const percentage = Math.round((data.score / data.maxScore) * 100);
  const passed = percentage >= 70;

  try {
    const [created] = await db
      .insert(assessments)
      .values({ ...data, percentage, passed })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const isUniqueViolation =
      typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505';
    if (isUniqueViolation) {
      return NextResponse.json({ error: 'An assessment with this ID already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create assessment.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    await db.delete(assessments);
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Failed to clear assessments.' }, { status: 500 });
  }
}