import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/src/db';
import { assessments } from '@/src/db/schema';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: 'Invalid ID.' }, { status: 400 });
  }
  try {
    await db.delete(assessments).where(eq(assessments.id, id));
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete assessment.' }, { status: 500 });
  }
}
