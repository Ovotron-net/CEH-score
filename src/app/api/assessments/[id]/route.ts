<<<<<<< Updated upstream
import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {db} from '@/db';
import {assessments} from '@/db/schema';
import {authenticate} from '@/lib/auth';
=======
<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { assessments } from '@/db/schema';
>>>>>>> Stashed changes

export async function DELETE(
    request: Request,
    {params}: { params: Promise<{ id: string }> },
) {
<<<<<<< Updated upstream
=======
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
=======
import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {db} from '@/db';
import {assessments} from '@/db/schema';
import {authenticate} from '@/lib/auth';

export async function DELETE(
    request: Request,
    {params}: { params: Promise<{ id: string }> },
) {
>>>>>>> Stashed changes
    const authError = authenticate(request);
    if (authError) return authError;

    const {id} = await params;
    if (!id || id.length > 100) {
        return NextResponse.json({error: 'Invalid ID.'}, {status: 400});
    }
    try {
        await db.delete(assessments).where(eq(assessments.id, id));
        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to delete assessment.'}, {status: 500});
    }
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
}