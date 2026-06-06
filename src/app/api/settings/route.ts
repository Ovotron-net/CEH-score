import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { authenticate } from '@/lib/auth';

const SETTINGS_ID = 1;

const SettingsSchema = z.object({
  name: z.string().min(1).max(100),
  targetScore: z.number().int().min(0).max(100),
  examDate: z.string().max(50),
  theme: z.enum(['dark', 'light']),
});

export async function GET(request: Request) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const [inserted] = await db
      .insert(settings)
      .values({ id: SETTINGS_ID })
      .onConflictDoNothing()
      .returning();
    if (inserted) return NextResponse.json(inserted);

    const existing = (await db.select().from(settings)).find((row) => row.id === SETTINGS_ID);
    return NextResponse.json(existing);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = authenticate(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, targetScore, examDate, theme } = parsed.data;

  try {
    const [updated] = await db
      .insert(settings)
      .values({ id: SETTINGS_ID, name, targetScore, examDate, theme })
      .onConflictDoUpdate({ target: settings.id, set: { name, targetScore, examDate, theme } })
      .returning();
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}